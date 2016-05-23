var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var JobSchema = new Schema ({
  url: String,
  date: String,
  content: String
});

var Job = mongoose.model('Job', JobSchema);
module.exports = Job;