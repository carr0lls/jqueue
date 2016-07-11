import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Html from '../../client/helpers/Html'
import * as Services from '../services'
import * as db from '../models'
import { JobQueue } from '../helpers'
const JobService = new Services.Job(db, JobQueue)

const index = (req, res) => {
  JobService.fetchAllJobs((err, data) => {
    let containerData = {
      jobs: data,
      url: '/api/jobs',
      pollInterval: 1000
    }
    let html = ReactDOMServer.renderToStaticMarkup(<Html containerData={containerData} />)

    res.end(html)
  })
}

const list = (req, res) => {
  JobService.fetchAllJobs(res)
}

const show = (req, res) => {
  JobService.fetchJob(req.params.job_id, res)
}

const create = (req, res) => {
  JobService.addJob(req.body.url, res)
}

const update = (req, res) => {
  JobService.updateJob(req.params.job_id, req.body.url, res)
}

const destroy = (req, res) => {
  JobService.deleteJob(req.params.job_id, res)
}

const empty = (req, res) => {
  JobService.deleteAllJobs(res)
}

export const Job = {
  index,
  list,
  show,
  create,
  update,
  destroy,
  empty
}
