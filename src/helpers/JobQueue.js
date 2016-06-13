import RSMQ from 'rsmq'
import request from 'superagent'
import RSMQWorker from 'rsmq-worker'
import * as db from '../models'
import { Constants } from '../constants'
import { getTimeString } from './Utils'
const qname = Constants.JOBQUEUE_NAME

export const jobQueue = new RSMQ({
  host: '127.0.0.1',
  port: 6379,
  ns: 'rsmq'
})
export const createJobQueue = () => {
  jobQueue.createQueue({qname}, (err, resp) => {
    if (resp === 1) {
      console.log("jobQueue created")
    }
  })
}
export const destroyJobQueue = () => {
  jobQueue.deleteQueue({qname}, (err, resp) => {
    if (resp === 1) {
      console.log("jobQueue deleted")
    }
  })
}

// Job worker
const worker = new RSMQWorker(qname, {
  interval: [ 5 ],
  autostart: true
});

// listen to messages
worker.on('message', (message, next, id) => {
  console.log('Job:', message, id)
  db.Job.findOne({qid: id}, (err, foundJob) => {
    if (foundJob) {
      let requestUrl = foundJob.url
      request
        .get(requestUrl)
        .end((err, result) => {
          if (err) {
            foundJob.status = 'FAILED'
            foundJob.last_updated = getTimeString()
            let errorMsg = err.reason ? err.reason : err.code
            console.log("Failed to fetch data for "+id)
            console.log({error: true, reason: errorMsg})
          }
          else {
            foundJob.status = 'COMPLETED'
            foundJob.last_updated = getTimeString()
            foundJob.content = result.text
            console.log("Completed fetching data for "+id)
          }
          foundJob.save((err, updatedJob) => {
            if (err) {
              console.error({error: true, reason: "Failed to update job data"})
            }
            jobQueue.deleteMessage({qname, id}, (err, resp) => {
              if (resp === 1) {
                console.log("Removed job "+id+" from jobQueue\n")
              }
            })
          })
        })
    }
    else {
      console.error({error: true, reason: "Failed to find job to update."})
    }
  })
});
