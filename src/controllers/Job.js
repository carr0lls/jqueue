import * as db from '../models'
import { Constants } from '../constants'
import { getTimeString, jobQueue, createJobQueue, destroyJobQueue } from '../helpers'
const qname = Constants.JOBQUEUE_NAME

const index = (req, res) => {
  db.Job.find({}, (err, foundJobs) => {
    if (err)
      return res.status(500).json({error: {reason: err}})

    res.json(foundJobs)
  })
}

const show = (req, res) => {
  db.Job.findById(req.params.job_id, (err, foundJob) => {
    if (err)
      return res.status(500).json({error: {reason: err, desc: "Failed to match job id."}})

    if (foundJob) {
      res.json({
        status: foundJob.status,
        url: foundJob.url,
        created: foundJob.created,
        content: foundJob.content,
        last_updated: foundJob.last_updated
      })
    }
  })
}

const create = (req, res) => {
  if (req.body.url) {
    let data = {
      qname,
      message: req.body.url
    }
    jobQueue.sendMessage(data, (err, qid) => {
      if (err)
        return res.status(500).json({error: {reason: err}})

      let newJob = new db.Job ({
        qid,
        url: req.body.url
      })
      newJob.save((err, job) => {
        if (err)
          return res.status(500).json({error: {reason: err}})

        res.json({job_id: job.id})
      })
    })
  }
  else {
    return res.status(400).json({error: {desc: "Fetch url is required."}})
  }
}

const update = (req, res) => {
  db.Job.findById(req.params.job_id, (err, foundJob) => {
    if (err)
      return res.status(500).json({error: {reason: err, desc: "Failed to find job to update."}})

    if (foundJob) {
      if (foundJob.status === Constants.JOBQUEUE_PENDING_STATUS ||
          foundJob.status === Constants.JOBQUEUE_UPDATE_STATUS) {
        return res.status(400).json({error: {desc: "This job is already in the queue."}})
      }

      let requestUrl = req.body.url ? req.body.url : foundJob.url
      let data = {
        qname,
        message: requestUrl
      }
      jobQueue.sendMessage(data, (err, qid) => {
        if (err)
          return res.status(500).json({error: {reason: err}})

        foundJob.qid = qid
        foundJob.status = Constants.JOBQUEUE_UPDATE_STATUS
        foundJob.url = requestUrl
        foundJob.last_updated = getTimeString()
        foundJob.content = undefined
        foundJob.save((err, updatedJob) => {
          if (err)
            return res.status(500).json({error: {reason: err, desc: "Failed to update job."}})

          res.json({
            status: updatedJob.status,
            url: updatedJob.url,
            created: updatedJob.created,
            last_updated: updatedJob.last_updated
          })
        })
      })
    }
  })
}

const destroy = (req, res) => {
  db.Job.findByIdAndRemove(req.params.job_id, (err, removedJob) => {
    if (err)
      return res.status(500).json({error: {reason: err, desc: "Failed to delete job."}})

    if (removedJob) {
      jobQueue.deleteMessage({qname, id: removedJob.qid}, (err, resp) => {
        if (resp === 1) {
          console.log("Removed job "+removedJob.qid+" from jobQueue\n")
        }
      })
      res.json({success: true})
    }
  })
}

const empty = (req, res) => {
  destroyJobQueue()
  createJobQueue()
  db.Job.remove({}, (err, removedJobs) => {
    if (err)
      return res.status(500).json({error: {reason: err}})

    res.json(removedJobs)
  })
}

export const Job = {
  index,
  show,
  create,
  update,
  destroy,
  empty
}
