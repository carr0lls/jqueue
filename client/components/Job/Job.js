import React from 'react'

	export default class Job extends React.Component {
		constructor() {
			super()
			this.handleUpdate = this.handleUpdate.bind(this)
			this.handleDelete = this.handleDelete.bind(this)
		}
		handleUpdate(e) {
			e.preventDefault()

			this.props.onUpdateJob(this.refs.updateJobBtn.value)
		}
		handleDelete(e) {
			e.preventDefault()

			this.props.onDeleteJob(this.refs.deleteJobBtn.value)
		}

		render() {
			return (
				<li>
					<a href={"api/jobs/"+this.props.job._id+""}>{this.props.job.url}</a>
					<button onClick={this.handleDelete} ref="deleteJobBtn" className="delete" value={this.props.job._id}>Delete</button>
					<button onClick={this.handleUpdate} ref="updateJobBtn" className="update" value={this.props.job._id}>Refresh</button>					
				</li>				
			)
		}
	}