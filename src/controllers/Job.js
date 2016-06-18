import * as db from '../models'
import { Constants } from '../constants'
import { getTimeString, JobQueue } from '../helpers'
const qname = Constants.JOBQUEUE_NAME

// Start Job queue
JobQueue.init()

const index = (req, res) => {
  db.Job.find({}, (err, foundJobs) => {
    if (err) return errorHandler(err, res)

    res.json(foundJobs)
  })
}

const show = (req, res) => {
  db.Job.findById(req.params.job_id, (err, foundJob) => {
    if (err) return errorHandler(err, res)

    if (!foundJob)
      return res.status(400).json({error: {desc: "Job does not exist in database."}})

    res.json({
      status: foundJob.status,
      url: foundJob.url,
      created: foundJob.created,
      content: foundJob.content,
      last_updated: foundJob.last_updated
    })
  })
}

const create = (req, res) => {
  let requestUrl = req.body.url
  if (requestUrl) {
    JobQueue.addToJobQueue({message: requestUrl}, (err, resp) => {
      if (err) return errorHandler(err, res)

      let newJob = new db.Job ({
        qid: resp.qid,
        url: requestUrl,
        created: getTimeString()
      })
      newJob.save((err, job) => {
        if (err) return errorHandler(err, res)

        res.json({job_id: job.id})
      })
    })
  }
  else {
    res.status(400).json({error: {desc: "Fetch url is required."}})
  }
}

const update = (req, res) => {
  db.Job.findById(req.params.job_id, (err, foundJob) => {
    if (err) return errorHandler(err, res)

    if (!foundJob)
      return res.status(400).json({error: {desc: "Job does not exist in database."}})

    if (foundJob.status === Constants.JOBQUEUE_PENDING_STATUS ||
        foundJob.status === Constants.JOBQUEUE_UPDATE_STATUS) {
      return res.status(400).json({error: {desc: "This job is already in the queue."}})
    }

    let requestUrl = req.body.url ? req.body.url : foundJob.url
    JobQueue.addToJobQueue({message: requestUrl}, (err, resp) => {
      if (err) return errorHandler(err, res)

      foundJob.qid = resp.qid
      foundJob.status = Constants.JOBQUEUE_UPDATE_STATUS
      foundJob.url = requestUrl
      foundJob.last_updated = getTimeString()
      foundJob.content = undefined
      foundJob.save((err, updatedJob) => {
        if (err) return errorHandler(err, res)

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

const destroy = (req, res) => {
  db.Job.findByIdAndRemove(req.params.job_id, (err, removedJob) => {
    if (err) return errorHandler(err, res)

    if (!removedJob)
      return res.status(400).json({error: {desc: "Job does not exist in database."}})

    JobQueue.removeFromJobQueue(removedJob.qid, (err, resp) => {
      if (err) return errorHandler(err, res)

      res.json({success: true})
    })
  })
}

const empty = (req, res) => {
  JobQueue.destroyJobQueue((err, resp) => {
    if (err) return errorHandler(err, res)

    db.Job.remove({}, (err, removedJobs) => {
      if (err) return errorHandler(err, res)

      JobQueue.createJobQueue((err, resp) => {
        if (err) return errorHandler(err, res)

        res.json(removedJobs)
      })
    })
  })
}

const errorHandler = (err, res) => {
  return res.status(500).json({error: {reason: err}})
}

export const Job = {
  index,
  show,
  create,
  update,
  destroy,
  empty
}
