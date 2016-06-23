import RSMQ from 'rsmq'
import { Constants } from '../constants'
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

export const JobQueue = {
  init,
  createJobQueue,
  destroyJobQueue,
  addToJobQueue,
  removeFromJobQueue
}
