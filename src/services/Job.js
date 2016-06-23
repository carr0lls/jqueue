import RSMQWorker from 'rsmq-worker'
import request from 'superagent'
import { Constants } from '../constants'
import { getTimeString } from '../helpers'
const qname = Constants.JOBQUEUE_NAME

export class Job {
  constructor(db, jobQueue) {
    this.db = db
    this.JobQueue = jobQueue
    // Connect to database
    this.db.connect()
    // Start Job queue
    this.JobQueue.init()
    // Run Job queue workers
    this.runWorkers()
  }
  // Route services
  fetchAllJobs(res) {
    this.db.Job.find({}, (err, foundJobs) => {
      if (err) return this.errorHandler(err, res)

      res.json(foundJobs)
    })
  }
  fetchJob(job_id, res) {
    this.db.Job.findById(job_id, (err, foundJob) => {
      if (err) return this.errorHandler(err, res)

      if (!foundJob)
        return res.status(400).json({error: {desc: "Job does not exist in database."}})

      res.json({
        _id: foundJob._id,
        status: foundJob.status,
        qid: foundJob.qid,
        url: foundJob.url,
        created: foundJob.created,
        content: foundJob.content,
        last_updated: foundJob.last_updated
      })
    })
  }
  addJob(requestUrl, res) {
    if (requestUrl) {
      this.JobQueue.addToJobQueue({message: requestUrl}, (err, resp) => {
        if (err) return this.errorHandler(err, res)

        let newJob = new this.db.Job ({
          qid: resp.qid,
          url: requestUrl,
          created: getTimeString()
        })
        newJob.save((err, job) => {
          if (err) return this.errorHandler(err, res)

          res.json({job_id: job.id})
        })
      })
    }
    else {
      res.status(400).json({error: {desc: "Fetch url is required."}})
    }
  }
  updateJob(job_id, requestUrl, res) {
    this.db.Job.findById(job_id, (err, foundJob) => {
      if (err) return this.errorHandler(err, res)

      if (!foundJob)
        return res.status(400).json({error: {desc: "Job does not exist in database."}})

      if (foundJob.status === Constants.JOBQUEUE_PENDING_STATUS ||
          foundJob.status === Constants.JOBQUEUE_UPDATE_STATUS) {
        return res.status(400).json({error: {desc: "This job is already in the queue."}})
      }

      let url = requestUrl ? requestUrl : foundJob.url
      this.JobQueue.addToJobQueue({message: url}, (err, resp) => {
        if (err) return this.errorHandler(err, res)

        let data = {
          qid: resp.qid,
          status: Constants.JOBQUEUE_UPDATE_STATUS,
          url,
          last_updated: getTimeString(),
          content: undefined
        }
        foundJob = Object.assign(foundJob, data)
        foundJob.save((err, updatedJob) => {
          if (err) return this.errorHandler(err, res)

          res.json({
            status: updatedJob.status,
            url: updatedJob.url,
            created: updatedJob.created,
            last_updated: updatedJob.last_updated
          })
        })
      })
    })
  }
  deleteJob(job_id, res) {
    this.db.Job.findById(job_id, (err, foundJob) => {
      if (err) return this.errorHandler(err, res)

      if (!foundJob)
        return res.status(400).json({error: {desc: "Job does not exist in database."}})

      this.JobQueue.removeFromJobQueue(foundJob.qid, (err, resp) => {
        if (err) return this.errorHandler(err, res)

        foundJob.remove((err, removedJob) => {
          if (err) return this.errorHandler(err, res)

          res.json({success: {url: removedJob.url}})
        })
      })
    })
  }
  deleteAllJobs(res) {
    this.JobQueue.destroyJobQueue((err, resp) => {
      if (err) return this.errorHandler(err, res)

      this.db.Job.remove({}, (err, removedJobs) => {
        if (err) return this.errorHandler(err, res)

        this.JobQueue.createJobQueue((err, resp) => {
          if (err) return this.errorHandler(err, res)

          res.json(removedJobs)
        })
      })
    })
  }
  // Error handlers
  errorHandler(err, res) {
    return res.status(500).json({error: {reason: err}})
  }
  // Job queue workers
  runJob(qid) {
    this.db.Job.findOne({qid}, (err, foundJob) => {
      if (foundJob) {
        let requestUrl = foundJob.url
        let data
        request
          .get(requestUrl)
          .end((err, result) => {
            if (err) {
              data = {
                status: Constants.JOBQUEUE_FAIL_STATUS,
                last_updated: getTimeString()
              }
              let errorMsg = err.reason ? err.reason : err.code
              console.log("Failed to fetch data for "+ qid +".")
              console.log({error: {reason: err, desc: errorMsg}})
            }
            else {
              data = {
                status: Constants.JOBQUEUE_COMPLETE_STATUS,
                last_updated: getTimeString(),
                content: result.text
              }
              console.log("Completed fetching data for "+ qid +".")
            }
            foundJob = Object.assign(foundJob, data)
            foundJob.save((err, updatedJob) => {
              if (err) {
                console.error({error: {reason: err, desc: "Failed to update job in database."}})
              }
              this.JobQueue.removeFromJobQueue(qid)
            })
          })
      }
      else {
        console.error({error: {desc: "Failed to locate job to update."}})
      }
    })
  }
  runWorkers() {
    // Job worker
    const worker = new RSMQWorker(qname, {
      interval: Constants.JOBQUEUE_INTERVAL,
      autostart: true
    })
    // Listen to messages
    worker.on('message', (message, next, id) => {
      console.log('Job:', message, id)
      this.runJob(id)
    })
  }
}
