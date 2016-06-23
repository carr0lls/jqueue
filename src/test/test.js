
/***************************** Unit Tests *****************************/
import sinon from 'sinon'
import { assert } from 'chai'
import * as Services from '../services'
import * as db from '../models'

// Mock objects
const JobQueue = {
  init: function(res) {},
  createJobQueue: function(job_id, res) {},
  destroyJobQueue: function(url, res) {},
  addToJobQueue: function(job_id, url, res) {},
  removeFromJobQueue: function(job_id, res) {},
  activeInstance: function(res) {}
}
const res = {
  json: function(data) { return data },
  status: function(code) { return this }
}
// Test data
const DATA = {
  job: {
    pending: {
      "_id": "576ae3b8397b1deefd8a3ab0",
      "status": "PENDING",
      "qid": "efvh9eifxattWUbCFPwwvNpAmENCASj1",
      "url": "example.com",
      "created": "Wed Jun 22 2016 12:15:04",
      "content": undefined,
      "last_updated": undefined
    },
    updating: {
      "_id": "576ae3b8397b1deefd8a3ab1",
      "status": "UPDATING",
      "qid": "efvh9eifxattWUbCFPwwvNpAmENCASj2",
      "url": "example.com",
      "created": "Wed Jun 22 2016 12:15:04",
      "content": undefined,
      "last_updated": "Wed Jun 22 2016 12:18:34"
    },
    completed: {
      "_id": "576ae3b8397b1deefd8a3ab2",
      "status": "COMPLETED",
      "qid": "efvh9eifxattWUbCFPwwvNpAmENCASj3",
      "url": "example.com",
      "created": "Wed Jun 22 2016 12:15:04",
      "content": "dummy content...",
      "last_updated": "Wed Jun 22 2016 12:18:34"
    },
    failed: {
      "_id": "576ae3b8397b1deefd8a3ab3",
      "status": "FAILED",
      "qid": "efvh9eifxattWUbCFPwwvNpAmENCASj4",
      "url": "example.com",
      "created": "Wed Jun 22 2016 12:15:04",
      "content": undefined,
      "last_updated": "Wed Jun 22 2016 12:18:34"
    }
  },
  jobs: [
    {
        "_id": "576ae3b8397b1deefd8a3ab0",
        "created": "Wed Jun 22 2016 12:15:04",
        "qid": "efvh9eifxattWUbCFPwwvNpAmENCASjT",
        "status": "PENDING",
        "url": "example.com"
    }
  ]
}

// Test cases
describe('JobController', function() {
  let connect, JobService, status, json

  before(function() {
    connect = sinon.stub(db, 'connect')
    JobService = new Services.Job(db, JobQueue)
  })
  after(function() {
    connect.restore()
  })
  beforeEach(function() {
    status = sinon.spy(res, 'status')
    json = sinon.spy(res, 'json')
  })
  afterEach(function() {
    status.restore()
    json.restore()
  })

  describe('fetchAllJobs', function() {
    it('should pass the database result into a json response', function() {
      const find = sinon.stub(db.Job, 'find')

      find.yields(null, DATA.jobs)
      JobService.fetchAllJobs(res)

      find.restore()

      sinon.assert.calledWith(find, {})
      sinon.assert.calledWith(json, DATA.jobs)
    })
  })
  describe('fetchJob', function() {
    it('should pass the database result into a json response', function() {
      const job_id = '576ae3b8397b1deefd8a3ab0'
      const findById = sinon.stub(db.Job, 'findById')

      findById.yields(null, DATA.job.pending)
      JobService.fetchJob(job_id, res)

      findById.restore()

      sinon.assert.calledWith(findById, job_id)
      sinon.assert.calledWith(json, DATA.job.pending)
    })
  })
  describe('fetchJobDoesNotExist', function() {
    it('should fail to find job in database and return a json response with a status code 400', function() {
      const job_id = '576ae3b8397b1deefd8a3ab0'
      const findById = sinon.stub(db.Job, 'findById')

      findById.yields(null, null)
      JobService.fetchJob(job_id, res)

      findById.restore()

      sinon.assert.calledWith(findById, job_id)
      sinon.assert.calledWith(status, 400)
      sinon.assert.calledWith(json, {error: {desc: "Job does not exist in database."}})
    })
  })
  describe('addJob', function() {
    it('should add url to job queue, save to database and return json with job id', function() {
      const data = {
        message: 'test.com'
      }
      // const job_id = '2342523'
      const addToJobQueue = sinon.stub(JobQueue, 'addToJobQueue')
      // const save = sinon.stub(db.Job.prototype, 'save')

      addToJobQueue.yields(null, {qid: 'e2342sfsf324sfdsytz'})
      // save.yields(null, {id: job_id})
      JobService.addJob(data.message, res)

      addToJobQueue.restore()
      // save.restore()

      sinon.assert.calledWith(addToJobQueue, data)
      // sinon.assert.calledOnce(save)
      // sinon.assert.calledWith(json, {job_id})
    })
  })
  describe('addJobWithoutURL', function() {
    it('should fail to add job without providing url and return json with a 400 status code', function() {
      JobService.addJob(null, res)

      sinon.assert.calledWith(status, 400)
      sinon.assert.calledWith(json, {error: {desc: "Fetch url is required."}})
    })
  })
  describe('updateJobFailAddToQueue', function() {
    it('should find job in database, add a new job to the queue, and save new status to database', function() {
      const findById = sinon.stub(db.Job, 'findById')
      const addToJobQueue = sinon.stub(JobQueue, 'addToJobQueue')

      findById.yields(null, DATA.job.completed)
      addToJobQueue.yields(true, null)
      JobService.updateJob(DATA.job.completed._id, null, res)

      findById.restore()
      addToJobQueue.restore()

      sinon.assert.calledWith(findById, DATA.job.completed._id)
      sinon.assert.calledWith(addToJobQueue, {message: DATA.job.completed.url})
    })
  })
  describe('updateJobDoesNotExist', function() {
    it('should fail to find job in database and return a json response with a status code 400', function() {
      const findById = sinon.stub(db.Job, 'findById')

      findById.yields(null, null)
      JobService.updateJob(DATA.job.completed._id, null, res)

      findById.restore()

      sinon.assert.calledWith(findById, DATA.job.completed._id)
      sinon.assert.calledWith(status, 400)
      sinon.assert.calledWith(json, {error: {desc: "Job does not exist in database."}})
    })
  })
  describe('updateJobFailByPendingStatus', function() {
    it('should fail to update jobs in `PENDING` status and return a json response with a status code 400', function() {
      const findById = sinon.stub(db.Job, 'findById')

      findById.yields(null, DATA.job.pending)
      JobService.updateJob(DATA.job.pending._id, null, res)

      findById.restore()

      sinon.assert.calledWith(findById, DATA.job.pending._id)
      sinon.assert.calledWith(status, 400)
      sinon.assert.calledWith(json, {error: {desc: "This job is already in the queue."}})
    })
  })
  describe('deleteJob', function() {
    it('should find job in database, delete from queue and database, and return a json reponse of the job url', function() {
      const findById = sinon.stub(db.Job, 'findById')
      const removeFromJobQueue = sinon.stub(JobQueue, 'removeFromJobQueue')

      findById.yields(null, DATA.job.completed)
      removeFromJobQueue.yields(true, null)
      JobService.deleteJob(DATA.job.completed._id, res)

      findById.restore()
      removeFromJobQueue.restore()

      sinon.assert.calledWith(findById, DATA.job.completed._id)
      sinon.assert.calledWith(removeFromJobQueue, DATA.job.completed.qid)
    })
  })
  describe('deleteJobDoesNotExist', function() {
    it('should fail to find job in database and return a json reponse with a status code 400', function() {
      const findById = sinon.stub(db.Job, 'findById')
      const removeFromJobQueue = sinon.stub(JobQueue, 'removeFromJobQueue')

      findById.yields(null, null)
      JobService.deleteJob(DATA.job.completed._id, res)

      findById.restore()

      sinon.assert.calledWith(findById, DATA.job.completed._id)
      sinon.assert.calledWith(status, 400)
      sinon.assert.calledWith(json, {error: {desc: "Job does not exist in database."}})
    })
  })
  describe('deleteAllJobs', function() {
    it('should delete and recreate job queue, delete all jobs in database and return the delete jobs in a json reponse', function() {
      const destroyJobQueue = sinon.stub(JobQueue, 'destroyJobQueue')
      const remove = sinon.stub(db.Job, 'remove')
      const createJobQueue = sinon.stub(JobQueue, 'createJobQueue')

      destroyJobQueue.yields(null, null)
      remove.yields(null, DATA.jobs)
      createJobQueue.yields(null, null)
      JobService.deleteAllJobs(res)

      destroyJobQueue.restore()
      remove.restore()
      createJobQueue.restore()

      sinon.assert.calledOnce(destroyJobQueue)
      sinon.assert.calledWith(remove, {})
      sinon.assert.calledOnce(createJobQueue)
      sinon.assert.calledWith(json, DATA.jobs)
    })
  })
  describe('errorHandler', function() {
    it('should pass the error result into a json response with a status code 500', function() {
      const error = {
        reason: {
          message: "Test error",
          eCode: -1
        }
      }

      JobService.errorHandler(error.reason, res)

      sinon.assert.calledWith(status, 500)
      sinon.assert.calledWith(json, {error})
    })
  })
  describe('runJob', function() {
    it('should find job by qid, make http request, save data and remove job from queue', function() {
      const findOne = sinon.stub(db.Job, 'findOne')

      findOne.yields(null, DATA.job.pending)
      JobService.runJob(DATA.job.pending.qid)

      findOne.restore()

      sinon.assert.calledWith(findOne, {qid: DATA.job.pending.qid})
    })
  })

})



/************************ Legacy End-to-End Tests ************************/

// import request from 'superagent'
//
// // Load test
// /*for (let i = 1; i <= 10; i++) {
//   let data = {
//     url: 'test'+i+'.com'
//   }
//   request.post('localhost:4000/api/jobs').send(data).end((err, res) => console.log(i))
// }
// */
// // Stress test
// /*for (let i = 1; i <= 2000; i++) {
//   let data = {
//     url: 'test'+i+'.com'
//   }
//   request.post('localhost:4000/api/jobs').send(data).end((err, res) => console.log(i))
// }*/
// let JOB_ID;
//
// // POST /api/jobs
// console.log("Testing: POST /api/jobs")
// console.log("Expected return value: job_id")
// let data = {
//   url: 'test.com'
// }
// request.post('localhost:4000/api/jobs').send(data).end((err, {body}) => {
//   JOB_ID = body.job_id
//   console.log(body)
//   if (!body.error) {
//     console.assert(JOB_ID !== undefined, "No `job_id` was returned.")
//   }
//
//   // GET /api/jobs/:job_id
//   console.log("\nTesting: GET /api/jobs/:job_id")
//   console.log("Expected return value: status, url=test.com, created, content (optional)")
//   request.get('localhost:4000/api/jobs/'+JOB_ID).end((err, {body}) => {
//     console.log(body)
//     if (!body.error) {
//       console.assert(body.status !== undefined, "No `status` was returned.")
//       console.assert(body.url !== undefined, "No `url` was returned.")
//       console.assert(body.url === 'test.com', "`url` did not match.")
//       console.assert(body.created !== undefined, "No `created` was returned.")
//     }
//
//     // PUT /api/jobs/:job_id
// /*    console.log("\nTesting: PUT /api/jobs/:job_id")
//     console.log("Expected return values: status=UPDATING, url=test.com, created, last_updated")
//     request.put('localhost:4000/api/jobs/'+JOB_ID).end((err, {body}) => {
//       console.log(body)
//       if (!body.error) {
//         console.assert(body.status !== undefined, "No `status` was returned.")
//         console.assert(body.status === 'UPDATING', "`status` did not match.")
//         console.assert(body.url !== undefined, "No `url` was returned.")
//         console.assert(body.url === 'test.com', "`url` did not match.")
//         console.assert(body.created !== undefined, "No `created` was returned.")
//         console.assert(body.last_updated !== undefined, "No `last_updated` was returned.")
//       }*/
//
//       // DELETE /api/jobs/:job_id
//       console.log("\nTesting: DELETE /api/jobs/:job_id")
//       console.log("Expected return values: success")
//       request.del('localhost:4000/api/jobs/'+JOB_ID).end((err, {body}) => {
//         console.log(body)
//         if (!body.error) {
//           console.assert(body.success, "Failed to delete job.")
//         }
//       })
//     // })
//   })
// })
//
// // PUT /api/jobs/:job_id url=test2.com
// /*console.log("\nTesting: PUT /api/jobs/:job_id")
// console.log("Expected return values: status=UPDATING, url=test2.com, created, last_updated")
// data = {
//   url: 'test2.com'
// }
// request.put('localhost:4000/api/jobs/'+JOB_ID).send(data).end((err, {body}) => {
//   console.log(body)
//   if (!body.error) {
//     console.assert(body.status !== undefined, "No `status` was returned.")
//     console.assert(body.status === 'UPDATING', "`status` did not match.")
//     console.assert(body.url !== undefined, "No `url` was returned.")
//     console.assert(body.url === 'test2.com', "`url` did not match.")
//     console.assert(body.created !== undefined, "No `created` was returned.")
//     console.assert(body.last_updated !== undefined, "No `last_updated` was returned.")
//   }
// })*/
