import React from 'react'
import 'whatwg-fetch'
import { JobList, JobForm } from '../../components'

	export default class JobsListPane extends React.Component {
		constructor(props) {
			super(props)
			this.state = {
				jobs: props.containerData.jobs
			}
			this.api = {
				url: props.containerData.url, 
				refresh: props.containerData.pollInterval
			}

			this.renderJobs = this.renderJobs.bind(this)
			this.submitJob = this.submitJob.bind(this)
			this.updateJob = this.updateJob.bind(this)
			this.deleteJob = this.deleteJob.bind(this)
			this.emptyJobs = this.emptyJobs.bind(this)
		}
		renderJobs() {
			fetch(this.api.url)
				.then((response) => {
					return response.json()
				})
				.then((json) => {
					this.setState({jobs: json})
				})
				.catch((ex) => {
					console.log('parsing failed', ex)
				})
		}
		filterJobs() {
			this.jobs = {
				pending: [],
				updating: [],
				completed: [],
				failed: []				
			}

			this.state.jobs.filter((job, index) => {
				switch(job.status) {
					case 'PENDING':
						this.jobs.pending.push(job)
						break
					case 'UPDATING':
						this.jobs.updating.push(job)
						break
					case 'COMPLETED':
						this.jobs.completed.push(job)
						break
					case 'FAILED':
						this.jobs.failed.push(job)
						break

					default:
						break
				}
				return
			})
		}
		submitJob(job) {
			fetch(this.api.url, {
			  method: 'POST',
			  headers: {
			    'Accept': 'application/json',
			    'Content-Type': 'application/json'
			  },
			  body: JSON.stringify(job)
			})
				.then((response) => { 
					return response.json() 
				})
				.then((json) => {
					this.renderJobs()
				})
				.catch((ex) => {
					console.log('parsing failed', ex)
				})
		}
		updateJob(job_id) {
			fetch(this.api.url+'/'+job_id, {
			  method: 'PUT',
			  headers: {
			    'Accept': 'application/json',
			    'Content-Type': 'application/json'
			  }
			})
				.then((response) => { 
					return response.json() 
				})
				.then(({error}) => {
					if(error)
						alert(error.desc)

					this.renderJobs()
				})
				.catch((ex) => {
					console.log('parsing failed', ex)
				})
		}
		deleteJob(job_id) {
			fetch(this.api.url+'/'+job_id, {
			  method: 'DELETE'
			})
				.then((response) => { 
					return response.json() 
				})
				.then((json) => {
					this.renderJobs()
				})
				.catch((ex) => {
					console.log('parsing failed', ex)
				})
		}
		emptyJobs() {
			fetch(this.api.url, {
			  method: 'DELETE',
			  headers: {
			    'Accept': 'application/json',
			    'Content-Type': 'application/json'
			  }
			})
				.then((response) => { 
					return response.json() 
				})
				.then((json) => {
					this.setState({jobs: []})
					this.renderJobs()
				})
				.catch((ex) => {
					console.log('parsing failed', ex)
				})
		}

		componentDidMount() {
			this.renderJobs()			
			setInterval(this.renderJobs, this.api.refresh)
		}

		render() {
			this.filterJobs()

			return (
				<div className="jobs-list-pane">
					<h1>Job Queue</h1>
					<JobForm onSubmitJob={this.submitJob}/>
					<section className="job-lists">
						<JobList className="completed" jobs={this.jobs.completed} onUpdateJob={this.updateJob} onDeleteJob={this.deleteJob}>
							<div className="job-list-title">Completed</div>
						</JobList>
						<JobList className="pending" jobs={this.jobs.pending} onUpdateJob={this.updateJob} onDeleteJob={this.deleteJob}>
							<div className="job-list-title">Pending</div>
						</JobList>
						<JobList className="failed" jobs={this.jobs.failed} onUpdateJob={this.updateJob} onDeleteJob={this.deleteJob}>
							<div className="job-list-title">Failed</div>
						</JobList>
						<JobList className="updating" jobs={this.jobs.updating} onUpdateJob={this.updateJob} onDeleteJob={this.deleteJob}>
							<div className="job-list-title">Updating</div>
						</JobList>						
						<div className="clearfix"></div>
					</section>
				</div>
			)
		}
	}
