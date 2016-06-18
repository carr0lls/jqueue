import mongoose from 'mongoose'
mongoose.connect('mongodb://localhost/job-queue')

export { Job } from './Job'
