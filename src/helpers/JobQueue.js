import rsmq from 'rsmq'
import * as Constants from '../constants'

const jobQueue = new rsmq({host: '127.0.0.1', port: 6379, ns: 'rsmq'})
const qname = Constants.JobQueue.QUEUE_NAME

const createQueue = () => {
  jobQueue.createQueue({qname}, (err, resp) => {
    if (resp === 1) {
      console.log("jobQueue created")
    }
  })
}
const destroyQueue = () => {
  jobQueue.deleteQueue({qname}, (err, resp) => {
    if (resp === 1) {
      console.log("jobQueue deleted")
    }
  })
}

module.exports.JobQueue = {
  jobQueue: jobQueue,
  createQueue: createQueue,
  destroyQueue: destroyQueue
}
