import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Html from '../../client/helpers/Html'
import * as Services from '../services'
import * as db from '../models'
import { JobQueue } from '../helpers'
import { Constants } from '../constants'
const JobService = new Services.Job(db, JobQueue)

const index = (req, res) => {
  JobService.fetchAllJobs((err, data) => {
    let containerData = {
      jobs: data,
      url: Constants.API_FETCH_URL,
      pollInterval: Constants.API_REFRESH_INTERVAL
    }
    let html = ReactDOMServer.renderToStaticMarkup(<Html containerData={containerData} />)

    res.end(html)
  })
}

// Error handlers
const errorHandler = (err, res) => {
  return res.status(err.code).json({error: err.error})
}

const list = (req, res) => {
  JobService.fetchAllJobs((err, data) => {
    if (err) return errorHandler(err, res)

    res.json(data)
  })
}

const show = (req, res) => {
  JobService.fetchJob(req.params.job_id, (err, data) => {
    if (err) return errorHandler(err, res)

    res.json(data)
  })
}

const create = (req, res) => {
  JobService.addJob(req.body.url, (err, data) => {
    if (err) return errorHandler(err, res)

    res.json(data)
  })
}

const update = (req, res) => {
  JobService.updateJob(req.params.job_id, req.body.url, (err, data) => {
    if (err) return errorHandler(err, res)

    res.json(data)
  })
}

const destroy = (req, res) => {
  JobService.deleteJob(req.params.job_id, (err, data) => {
    if (err) return errorHandler(err, res)

    res.json(data)
  })
}

const empty = (req, res) => {
  JobService.deleteAllJobs((err, data) => {
    if (err) return errorHandler(err, res)

    res.json(data)
  })
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
