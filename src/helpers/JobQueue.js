import RSMQ from 'rsmq'
import request from 'superagent'
import RSMQWorker from 'rsmq-worker'
import * as db from '../models'
import { Constants } from '../constants'
import { getTimeString } from './Utils'
const qname = Constants.JOBQUEUE_NAME

export const jobQueue = new RSMQ({
  host: Constants.JOBQUEUE_HOST,
  port: Constants.JOBQUEUE_PORT,
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

// Start job queue
createJobQueue()

// Job worker
const worker = new RSMQWorker(qname, {
  interval: Constants.JOBQUEUE_INTERVAL,
  autostart: true
})

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
            foundJob.status = Constants.JOBQUEUE_FAIL_STATUS
            foundJob.last_updated = getTimeString()
            let errorMsg = err.reason ? err.reason : err.code
            console.log("Failed to fetch data for "+id)
            console.log({error: {reason: err, desc: errorMsg}})
          }
          else {
            foundJob.status = Constants.JOBQUEUE_COMPLETE_STATUS
            foundJob.last_updated = getTimeString()
            foundJob.content = result.text
            console.log("Completed fetching data for "+id)
          }
          foundJob.save((err, updatedJob) => {
            if (err) {
              console.error({error: {reason: err, desc: "Failed to update job data"}})
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
      console.error({error: {desc: "Failed to locate job to update."}})
    }
  })
})
