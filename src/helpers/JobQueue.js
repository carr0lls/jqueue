import RSMQ from 'rsmq'
import request from 'superagent'
import RSMQWorker from 'rsmq-worker'
import * as db from '../models'
import { Constants } from '../constants'
import { getTimeString } from './Utils'
const qname = Constants.JOBQUEUE_NAME
let jqueue

const init = () => {
  jqueue = new RSMQ({
    host: Constants.JOBQUEUE_HOST,
    port: Constants.JOBQUEUE_PORT,
    ns: 'rsmq'
  })
  console.log("Initialized "+ qname +".")
}
const createJobQueue = (cb) => {
  if (!activeInstance(cb)) return
  jqueue.createQueue({qname}, (err, resp) => {
    if (resp === 1) {
      console.log(qname +" created.")
    }
    return typeof cb === 'function' && cb(err, resp)
  })
}
const destroyJobQueue = (cb) => {
  if (!activeInstance(cb)) return
  jqueue.deleteQueue({qname}, (err, resp) => {
    if (resp === 1) {
      console.log(qname +" deleted.")
    }
    return typeof cb === 'function' && cb(err, resp)
  })
}
const addToJobQueue = ({message, delay}, cb) => {
  if (!activeInstance(cb)) return
  let data = {qname, message, delay}
  jqueue.sendMessage(data, (err, qid) => {
    if (qid) {
      console.log("Added job "+qid+" to "+ qname +".\n")
    }
    return typeof cb === 'function' && cb(err, {qid})
  })
}
const removeFromJobQueue = (id, cb) => {
  if (!activeInstance(cb)) return
  jqueue.deleteMessage({qname, id}, (err, resp) => {
    if (resp === 1) {
      console.log("Removed job "+id+" from "+ qname +".\n")
    }
    return typeof cb === 'function' && cb(err, resp)
  })
}
const activeInstance = (cb) => {
  if (!jqueue) {
    let err = {eCode: Constants.JOBQUEUE_INACTIVE_ERROR}
    console.log(qname +" has not been initialized.")
    cb(err, null)
    return false
  }
  return true
}

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
            console.log("Failed to fetch data for "+ id +".")
            console.log({error: {reason: err, desc: errorMsg}})
          }
          else {
            foundJob.status = Constants.JOBQUEUE_COMPLETE_STATUS
            foundJob.last_updated = getTimeString()
            foundJob.content = result.text
            console.log("Completed fetching data for "+ id +".")
          }
          foundJob.save((err, updatedJob) => {
            if (err) {
              console.error({error: {reason: err, desc: "Failed to update job in database."}})
            }
            removeFromJobQueue(id)
          })
        })
    }
    else {
      console.error({error: {desc: "Failed to locate job to update."}})
    }
  })
})

export const JobQueue = {
  init,
  createJobQueue,
  destroyJobQueue,
  addToJobQueue,
  removeFromJobQueue
}
