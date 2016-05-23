var mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI ||
                 process.env.MONGOHQ_URL ||
                "mongodb://localhost/job-queue");


module.exports.Job = require("./job.js");