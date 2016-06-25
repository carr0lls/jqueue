// import React from 'react'
import { Job } from '..'

	export default class JobList extends React.Component {

		render() {
			let jobNodes = this.props.jobs.map((job, index) => {
									return <Job key={job._id} job={job} onUpdateJob={this.props.onUpdateJob} onDeleteJob={this.props.onDeleteJob}/>
								})

			return (
					<div className="job-list">
						{this.props.children}
						<ul>
							{jobNodes}
						</ul>
					</div>
			)
		}
	}