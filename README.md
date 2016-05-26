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
# GET /
A simple user interface that uses all API endpoints.

# GET /api
Describes available endpoints.

# GET api/jobs
List all jobs.

# GET api/jobs/:job_id
View data of a specific job.

# POST api/jobs
Add a new job to the job queue.

# PUT api/jobs/:job_id
Edit and update an existing job.

# DELETE api/jobs/:job_id
Delete an existing job.

# DELETE api/jobs
Delete all existing jobs.
```

### Tests
```sh
# Run tests
npm run tests
```
