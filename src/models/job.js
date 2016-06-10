import mongoose from 'mongoose'
import { getTimeString } from '../helpers'
const Schema = mongoose.Schema

export const JobSchema = new Schema ({
  qid: String,
  url: String,
  created: {type: String, default: getTimeString()},
  last_updated: String,
  status: {type: String, default: 'PENDING'},
  content: String
})

export const Job = mongoose.model('Job', JobSchema)
