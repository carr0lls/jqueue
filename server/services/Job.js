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
  fetchAllJobs(cb) {
    this.db.Job.find({}, (err, foundJobs) => {
      if (err) return cb(this.errorHandler(err), null)
      
      cb(null, foundJobs)
    })
  }
  fetchJob(job_id, cb) {
    this.db.Job.findById(job_id, (err, foundJob) => {
      if (err) return cb(this.errorHandler(err), null)

      if (!foundJob)
        return cb(this.badRequestHandler("Job does not exist in database."), null)

      cb(null, {
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
  addJob(requestUrl, cb) {
    if (requestUrl) {
      this.JobQueue.addToJobQueue({message: requestUrl}, (err, resp) => {
        if (err) return cb(this.errorHandler(err), null)

        let newJob = new this.db.Job ({
          qid: resp.qid,
          url: requestUrl,
          created: getTimeString()
        })
        newJob.save((err, job) => {
          if (err) return cb(this.errorHandler(err), null)

          cb(null, {job_id: job.id})
        })
      })
    }
    else {
      cb(this.badRequestHandler("Fetch url is required."), null)
    }
  }
  updateJob(job_id, requestUrl, cb) {
    this.db.Job.findById(job_id, (err, foundJob) => {
      if (err) return cb(this.errorHandler(err), null)

      if (!foundJob)
        return cb(this.badRequestHandler("Job does not exist in database."), null)

      if (foundJob.status === Constants.JOBQUEUE_PENDING_STATUS ||
          foundJob.status === Constants.JOBQUEUE_UPDATE_STATUS) {
        return cb(this.badRequestHandler("This job is already in the queue."), null)
      }

      let url = requestUrl ? requestUrl : foundJob.url
      this.JobQueue.addToJobQueue({message: url}, (err, resp) => {
        if (err) return cb(this.errorHandler(err), null)

        let data = {
          qid: resp.qid,
          status: Constants.JOBQUEUE_UPDATE_STATUS,
          url,
          last_updated: getTimeString(),
          content: undefined
        }
        foundJob = Object.assign(foundJob, data)
        foundJob.save((err, updatedJob) => {
          if (err) return cb(this.errorHandler(err), null)

          cb(null, {
            status: updatedJob.status,
            url: updatedJob.url,
            created: updatedJob.created,
            last_updated: updatedJob.last_updated
          })
        })
      })
    })
  }
  deleteJob(job_id, cb) {
    this.db.Job.findById(job_id, (err, foundJob) => {
      if (err) return cb(this.errorHandler(err), null)

      if (!foundJob)
        return cb(this.badRequestHandler("Job does not exist in database."), null)

      this.JobQueue.removeFromJobQueue(foundJob.qid, (err, resp) => {
        if (err) return cb(this.errorHandler(err), null)

        foundJob.remove((err, removedJob) => {
          if (err) return cb(this.errorHandler(err), null)

          cb(null, {success: {url: removedJob.url}})
        })
      })
    })
  }
  deleteAllJobs(cb) {
    this.JobQueue.destroyJobQueue((err, resp) => {
      if (err) return cb(this.errorHandler(err), null)

      this.db.Job.remove({}, (err, removedJobs) => {
        if (err) return cb(this.errorHandler(err), null)

        this.JobQueue.createJobQueue((err, resp) => {
          if (err) return cb(this.errorHandler(err), null)

          cb(null, removedJobs)
        })
      })
    })
  }
  // Error handlers
  errorHandler(err) {
    return {error: {reason: err}, code: 500}
  }
  badRequestHandler(err) {
    return {error: {desc: err}, code: 400}
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
                content: result.text.replace(/(<([^>]+)>)/ig,"")
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
