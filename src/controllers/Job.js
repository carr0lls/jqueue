import * as db from '../models'
import * as Constants from '../constants'
import { jobQueue, createJobQueue, destroyJobQueue } from '../helpers'

const qname = Constants.JOBQUEUE_NAME
createJobQueue()

const index = (req, res) => {
  // jobQueue.getQueueAttributes({qname}, (err, resp) => {
  //   if (err) {
  //     res.send(err, 500);
  //     return;
  //   }
  //   res.json(resp)
  // })
  db.Job.find({}, (err, foundJobs) => {
    if (err) {
      res.json({error: true, reason: err})
    }
    else {
      res.json(foundJobs)
    }
  })
}

const show = (req, res) => {
  db.Job.findById(req.params.job_id, (err, foundJob) => {
    if (foundJob) {
      res.json({status: foundJob.status, url: foundJob.url, created: foundJob.created, content: foundJob.content, last_updated: foundJob.last_updated})
    }
    else {
      res.json({error: true, reason: "Failed to retrieve job."})
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
      if (err) {
        res.status(500).send(err);
        return;
      }

      let newJob = new db.Job ({
        qid,
        url: req.body.url
      })
      newJob.save((err, job) => {
        if (err) {
          res.json({error: true, reason: "Failed to create new job."})
        }
        else {
          res.json({job_id: job.id, url: job.url})
        }
      })
    });
  }
  else {
    res.json({error: true, reason: "Fetch url is required."})
  }
}

const update = (req, res) => {
  // db.Job.findById(req.params.job_id, (err, foundJob) => {
  //   if (foundJob) {
  //     let requestUrl = req.body.url ? req.body.url : foundJob.url
  //     request
  //       .get(requestUrl)
  //       .end((err, result) => {
  //         if (err) {
  //           let errorMsg = err.reason ? err.reason : err.code
  //           res.json({error: true, reason: errorMsg})
  //         }
  //         else {
  //           foundJob.url = requestUrl
  //           foundJob.created = getTimeString()
  //           foundJob.content = result.text
  //           foundJob.save((err, updatedJob) => {
  //             if (err) {
  //               res.json({error: true, reason: "Failed to update job."})
  //             }
  //             else {
  //               res.json(updatedJob)
  //             }
  //           })
  //         }
  //       })
  //   }
  //   else {
  //     res.json({error: true, reason: "Failed to find job to update."})
  //   }
  // })
}

const destroy = (req, res) => {
  db.Job.findByIdAndRemove(req.params.job_id, (err, removedJob) => {
    if (removedJob) {
      jobQueue.deleteMessage({qname, id: removedJob.qid}, (err, resp) => {
        if (resp === 1) {
          console.log("message deleted from jobQueue")
        }
      })
      res.json({success: true})
    }
    else {
      res.json({error: true, reason: "Failed to delete job."})
    }
  })
}

const empty = (req, res) => {
  destroyJobQueue()
  createJobQueue()
  db.Job.remove({}, (err, removedJobs) => {
    if (err) {
      res.json({error: true, reason: err})
    }
    else {
      res.json(removedJobs)
    }
  })
}

module.exports.Job = {
  index: index,
  show: show,
  create: create,
  update: update,
  destroy: destroy,
  empty: empty
}
