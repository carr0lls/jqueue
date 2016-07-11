import React from 'react'

	export default class JobForm extends React.Component {
		constructor() {
			super()
			this.handleSubmit = this.handleSubmit.bind(this)
		}
		handleSubmit(e) {
			e.preventDefault()
			let url = this.refs.inputUrl.value.trim()

			if (!url)
				return alert('Type in a url to add to the job queue.')

			this.props.onSubmitJob({url: url})
			this.refs.inputUrl.value = ''
		}

		render() {
			return (
				<article className="job-form" onSubmit={this.handleSubmit}>
					<form id="add-form">
						<label htmlFor="url">URL:</label>
						<input ref="inputUrl" type="text" className="url" name="url"/>
						<input onClick={this.handleSubmit} type="submit" className="add" value="Add"/>
					</form>
					<button onClick={this.emptyJobs} className="delete-all">DELETE ALL</button>
				</article>
			)
		}
	}