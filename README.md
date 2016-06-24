# Job Queue

A simple job queue with a RESTful API for retrieving and storing data from a specified URL.

## Prerequisites
These services most be installed and running prior to starting the server:
- [Redis](http://redis.io/)
- [MongoDB](https://www.mongodb.com/)

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
### `GET` /
A simple user interface that utilizes all of the API endpoints.

### `GET` /api
Describes all available API endpoints.

### `GET` /api/jobs
List all jobs.

### `GET` /api/jobs/:job_id
View data of a specific job.

### `POST` /api/jobs
Add a new job to the job queue.

Required parameters:
```json
{
  "url": "String"
}
```

### `PUT` /api/jobs/:job_id
Edit and update an existing job
(This endpoint will re-add the job to the queue to re-fetch the web data.
  If a url is given, it will refetch data with the new url instead of the original).

Optional parameters:
```json
{
  "url": "String"
}
```

### `DELETE` /api/jobs/:job_id
Delete an existing job (the job is deleted from the database and the job queue).

### `DELETE` /api/jobs
Delete all existing jobs (all jobs from the database and the job queue is deleted).

## Tests
```sh
# Run unit tests (Mocha, Chai, Sinon)
npm test
```

## Todo (future enhancements)
- Rewrite frontend UI with React
