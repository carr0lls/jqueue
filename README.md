# Job Queue

A simple RESTful API for retrieving and storing data from a specified URL.

## Prerequisites
```sh
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
```sh
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

# Edit and update an existing job.
PUT /api/jobs/:job_id

# Delete an existing job.
DELETE /api/jobs/:job_id

# Delete all existing jobs.
DELETE /api/jobs
```

### Tests
```sh
# Run tests
npm run tests
```
