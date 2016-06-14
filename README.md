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
```
Params:
{
  url: String (Required)
}
```

### `PUT` /api/jobs/:job_id
Edit and update an existing job.
```
Params:
{
  url: String (Optional)
}
```

### `DELETE` /api/jobs/:job_id
Delete an existing job.

### `DELETE` /api/jobs
Delete all existing jobs.

## Tests
```sh
# Run tests
npm test
```

## Todo (Future enhancements)
- Implement frontend UI with React
