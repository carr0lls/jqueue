import request from 'superagent'
import rsmq from 'rsmq'
import * as db from '../models'

const jobQueue = new rsmq({host: '127.0.0.1', port: 6379, ns: 'rsmq'})
const qname = 'jobQueue'

jobQueue.createQueue({qname}, (err, resp) => {
  if (resp === 1) {
    console.log("jobQueue created")
  }
});

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
      res.json({status: foundJob.status, url: foundJob.url, date: foundJob.date, content: foundJob.content})
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
        res.send(err, 500);
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

  // if (req.body.url) {
  //   request
  //     .get(req.body.url)
  //     .end((err, result) => {
  //       if (err) {
  //         let errorMsg = err.reason ? err.reason : err.status
  //         if (!errorMsg)
  //           errorMsg = 'The url specified is invalid.'
  //
  //         res.json({error: true, reason: errorMsg})
  //       }
  //       else {
  //         let newJob = new db.Job ({
  //           url: req.body.url,
  //           date: getTimeString(),
  //           content: result.text
  //         })
  //
  //         newJob.save((err, job) => {
  //           if (err) {
  //             res.json({error: true, reason: "Failed to create new job."})
  //           }
  //           else {
  //             res.json({_id: job.id, url: job.url})
  //           }
  //         })
  //       }
  //   })
  // }
  // else {
  //   res.json({ error: true, reason: "Fetch url is required."})
  // }
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
  //           foundJob.date = getTimeString()
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
  jobQueue.deleteQueue({qname}, (err, resp) => {
    if (resp === 1) {
      console.log("jobQueue deleted")
    }
  })
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
