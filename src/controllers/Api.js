
const index = (req, res) => {
  res.json({
    name: 'Job Queue',
    documentation_url: 'https://github.com/carr0lls/jqueue',
    base_url: 'http://localhost:4000/',
    endpoints: [
      {method: 'GET', path: '/', description: 'A simple user interface that uses all API endpoints.'},
      {method: 'GET', path: '/api', description: 'Describes available endpoints.'},
      {method: 'GET', path: '/api/jobs', description: 'List all jobs.'},
      {method: 'GET', path: '/api/jobs/:job_id', description: 'View data of a specific job.'},
      {method: 'POST', path: '/api/jobs', description: 'Add a new job to the job queue.'},
      {method: 'PUT', path: '/api/jobs/:job_id', description: 'Edit and update an existing job.'},
      {method: 'DELETE', path: '/api/jobs/:job_id', description: 'Delete an existing job.'},
      {method: 'DELETE', path: '/api/jobs', description: 'Delete all existing jobs.'}
    ]
  });
}

module.exports.Api = {
  index: index
}
