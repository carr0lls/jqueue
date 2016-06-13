import fs from 'fs'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import exphbr from 'express-handlebars'
import * as controllers from './controllers'

const app = express()
const handlebars = exphbr.create({extname: '.html'})

app.set('port', (process.env.PORT || 4000))
app.use('/', express.static(path.join(__dirname, '../public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.engine('html', handlebars.engine)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, '../views'))

// Main page UI
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
