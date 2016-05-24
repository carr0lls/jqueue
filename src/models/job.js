import mongoose from 'mongoose'
const Schema = mongoose.Schema

export const JobSchema = new Schema ({
  url: String,
  date: String,
  content: String
})

export const Job = mongoose.model('Job', JobSchema)
