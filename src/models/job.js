import mongoose from 'mongoose'
import { getTimeString } from '../helpers'
const Schema = mongoose.Schema

export const JobSchema = new Schema ({
  qid: String,
  url: String,
  date: {type: String, default: getTimeString()},
  status: {type: String, default: 'PENDING'},
  content: String
})

export const Job = mongoose.model('Job', JobSchema)
