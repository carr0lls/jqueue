export const Constants = {
  JOBQUEUE_NAME: 'JOBQUEUE',
  JOBQUEUE_PENDING_STATUS: 'PENDING',
  JOBQUEUE_UPDATE_STATUS: 'UPDATING',
  JOBQUEUE_COMPLETE_STATUS: 'COMPLETED',
  JOBQUEUE_FAIL_STATUS: 'FAILED',
  JOBQUEUE_HOST: '127.0.0.1',
  JOBQUEUE_PORT: 6379,
  JOBQUEUE_INTERVAL: [ 1, 2, 5 ],
  JOBQUEUE_INACTIVE_ERROR: 7,
  API_FETCH_URL: 'api/jobs',
  API_REFRESH_INTERVAL: 1000
}