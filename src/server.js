import fs from 'fs'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import exphbr from 'express-handlebars'
import request from 'superagent'
import * as db from './models'
import { getTimeString } from './helpers'

const app = express()
const handlebars = exphbr.create({extname: '.html'})

app.set('port', (process.env.PORT || 4000))
app.use('/', express.static(path.join(__dirname, '../public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.engine('html', handlebars.engine)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, '../views'))

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/api/jobs', (req, res) => {
  db.Job.find({}, (err, foundJobs) => {
    if (err) {
      res.json({error: true, reason: err})
    }
    else {
      res.json(foundJobs)
    }
  })
})

app.get('/api/jobs/:job_id', (req, res) => {
  db.Job.findById(req.params.job_id, (err, foundJob) => {
    if (foundJob) {
      res.json({url: foundJob.url, date: foundJob.date, content: foundJob.content})
    }
    else {
      res.json({error: true, reason: "Failed to retrieve job."})
    }
  })
})

app.post('/api/jobs', (req, res) => {
  if (req.body.url) {
    request
      .get(req.body.url)
      .end((err, result) => {
        if (err) {
          let errorMsg = err.reason ? err.reason : err.code
          res.json({error: true, reason: errorMsg})
        }
        else {
          let newJob = new db.Job ({
            url: req.body.url,
            date: getTimeString(),
            content: result.text
          })

          newJob.save((err, job) => {
            if (err) {
              res.json({error: true, reason: "Failed to create new job."})
            }
            res.json({_id: job.id})
          })
        }
    })
  }
  else {
    res.json({ error: true, reason: "Fetch url is required."})
  }
})

app.put('/api/jobs/:job_id', (req, res) => {
  db.Job.findById(req.params.job_id, (err, foundJob) => {
    if (foundJob) {
      let requestUrl = req.body.url ? req.body.url : foundJob.url
      request
        .get(requestUrl)
        .end((err, result) => {
          if (err) {
            let errorMsg = err.reason ? err.reason : err.code
            res.json({error: true, reason: errorMsg})
          }
          else {
            foundJob.url = requestUrl
            foundJob.date = getTimeString()
            foundJob.content = result.text
            foundJob.save((err, updatedJob) => {
              if (err) {
                res.json({error: true, reason: "Failed to update job."})
              }
              else {
                res.json(updatedJob)
              }
            })
          }
        })
    }
    else {
      res.json({error: true, reason: "Failed to find job to update."})
    }
  })
})

app.delete('/api/jobs/:job_id', (req, res) => {
  db.Job.findByIdAndRemove(req.params.job_id, (err, removedJob) => {
    if (removedJob) {
      res.json({success: true})
    }
    else {
      res.json({error: true, reason: "Failed to delete job."})
    }
  })
})

app.delete('/api/jobs', (req, res) => {
  db.Job.remove({}, (err, removedJobs) => {
    if (err) {
      res.json({error: true, reason: err})
    }
    else {
      res.json(removedJobs)
    }
  })
})

app.listen(app.get('port'), () => {
  console.log('Server started: http://localhost:' + app.get('port') + '/')
})
