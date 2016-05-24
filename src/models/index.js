import mongoose from 'mongoose'
mongoose.connect(process.env.MONGODB_URI ||
                 process.env.MONGOHQ_URL ||
                "mongodb://localhost/job-queue")

export { Job } from './Job'
