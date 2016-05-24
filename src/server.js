import fs from 'fs'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import exphbr from 'express-handlebars'
import request from 'superagent'
import * as db from './models'

// 9:20pm sat 5/21/16

const app = express()

const handlebars = exphbr.create({extname: '.html'})

function addZero(i) {
  if (i < 10) {
      i = "0" + i
  }
  return i
}

function getTimeString() {
  let d = new Date()
  let h = addZero(d.getHours())
  let m = addZero(d.getMinutes())
  let s = addZero(d.getSeconds())
  return d.toDateString() + " " + h + ":" + m + ":" + s
}

app.set('port', (process.env.PORT || 4000))
app.use('/', express.static(path.join(__dirname, '../public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.engine('html', handlebars.engine)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, '../views'))

// Client-side rendering (only) of comments
app.get('/', function(req, res) {
  res.render('index')
})

app.get('/api/jobs', function(req, res) {
  db.Job.find({}, function (err, foundJobs) {
    if (err) {
      console.log('foundJobs error: ', err)
    }
    res.json(foundJobs)
  })
})

app.get('/api/jobs/:job_id', function(req, res) {
  db.Job.findById({_id: req.params.job_id}, function (err, foundJob) {
    if (foundJob) {
      res.json({url: foundJob.url, date: foundJob.date, content: foundJob.content})
    }
    else {
      res.json({error: true, reason: "Failed to retrieve job."})
    }
  })
})

app.post('/api/jobs', function(req, res) {
  if (req.body.url) {
    request
      .get(req.body.url)
      .end(function(err, result) {
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

          newJob.save(function(err, job){
            if (err) {
              res.json({error: true, reason: "Failed to create new job."})
            }
            res.json({job_id: job.id})
          })
        }
    })
  }
  else {
    res.json({ error: true, reason: "Fetch url is required."})
  }
})

app.put('/api/jobs/:job_id', function(req, res) {
  db.Job.findById({_id: req.params.job_id}, function(err, foundJob) {
    if (foundJob) {
      foundJob.url = req.body.url
      foundJob.date = getTimeString()
      foundJob.content = "mango melons"
      foundJob.save(function(err, updatedJob) {
        if (err) {
          res.json({error: true, reason: "Failed to update job."})
        }
        else {
          res.json(updatedJob)
        }
      })
    }
    else {
      res.json({error: true, reason: "Failed to find job to update."})
    }
  })
})

app.delete('/api/jobs/:job_id', function(req, res) {
  db.Job.remove({_id: req.params.job_id}, function (err, removedJob) {
    if (removedJob) {
      res.json(removedJob)
    }
    else {
      res.json({error: true, reason: "Failed to delete job."})
    }
  })
})

app.delete('/api/jobs', function(req, res) {
  db.Job.remove({}, function (err, removedJobs) {
    if (err) {
      console.log('removedJobs error: ', err)
    }
    res.json(removedJobs)
  })
})

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/')
})
