import mongoose from 'mongoose'

export const connect = () => {
  mongoose.connect('mongodb://localhost/job-queue')
  console.log('Connected to database.')
}
export { Job } from './Job'
