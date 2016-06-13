# Job Queue

A simple job queue with a RESTful API for retrieving and storing data from a specified URL.

## Prerequisites
```
redis
mongodb
```

## To run

```sh
npm install

# Transpile server-side files from ES6 to ES5
npm run build

# Start mongo server
mongod

# Start server
npm start
```

And visit <http://localhost:4000/>.

## Routes
```
# A simple user interface that uses all API endpoints.
GET /

# Describes available endpoints.
GET /api

# List all jobs.
GET /api/jobs

# View data of a specific job.
GET /api/jobs/:job_id

# Add a new job to the job queue.
POST /api/jobs
Params:
{
  url: String (Required)
}

# Edit and update an existing job.
PUT /api/jobs/:job_id
Params:
{
  url: String (Optional)
}

# Delete an existing job.
DELETE /api/jobs/:job_id

# Delete all existing jobs.
DELETE /api/jobs
```

## Tests
```sh
# Run tests
npm test
```

## Todo (Future enhancements)
- Implement frontend UI with React
