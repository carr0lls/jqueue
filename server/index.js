import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import * as controllers from './controllers'

const app = express()

app.set('port', 4000)
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Main page UI
app.get('/', controllers.Job.index)
// API routes
app.get('/api', controllers.Api.index)
app.get('/api/jobs', controllers.Job.list)
app.get('/api/jobs/:job_id', controllers.Job.show)
app.post('/api/jobs', controllers.Job.create)
app.put('/api/jobs/:job_id', controllers.Job.update)
app.delete('/api/jobs/:job_id', controllers.Job.destroy)
app.delete('/api/jobs', controllers.Job.empty)

app.listen(app.get('port'), () => {
  console.log('Server started: http://localhost:' + app.get('port') + '/')
})
