import fs from 'fs'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import exphbr from 'express-handlebars'
import request from 'superagent'
import { JobQueue, getTimeString } from './helpers'
import * as controllers from './controllers'
import * as db from './models'
import * as Constants from './constants'
const qname = Constants.JobQueue.QUEUE_NAME

const app = express()
const handlebars = exphbr.create({extname: '.html'})

app.set('port', (process.env.PORT || 4000))
app.use('/', express.static(path.join(__dirname, '../public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.engine('html', handlebars.engine)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, '../views'))

// Maing page UI
app.get('/', (req, res) => {
  res.render('index')
})
// API routes
app.get('/api', controllers.Api.index)
app.get('/api/jobs', controllers.Job.index)
app.get('/api/jobs/:job_id', controllers.Job.show)
app.post('/api/jobs', controllers.Job.create)
app.put('/api/jobs/:job_id', controllers.Job.update)
app.delete('/api/jobs/:job_id', controllers.Job.destroy)
app.delete('/api/jobs', controllers.Job.empty)

app.listen(app.get('port'), () => {
  console.log('Server started: http://localhost:' + app.get('port') + '/')
})

// Job worker
var RSMQWorker = require('rsmq-worker');
var worker = new RSMQWorker(qname, {
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
            JobQueue.jobQueue.deleteMessage({qname, id}, (err, resp) => {
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
