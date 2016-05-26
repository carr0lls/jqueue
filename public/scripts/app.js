var renderJobs = function() {
	$.ajax({
		url: 'api/jobs',
		method: 'GET',
		success: function(jobs) {
			// console.log(jobs);
			jobs.map(function(job) {
				var refresh_link = '<button onclick="updateJob(this)" class="update" value="'+job._id+'">Refresh</button>';
				var del_link = '<button onclick="deleteJob(this)" class="delete" value="'+job._id+'">Delete</button>';
				var link = '<li><a href="api/jobs/'+job._id+'">'+job.url+'</a>'+refresh_link+del_link+'</li>';
				$('ul.job-list').append(link);
			});
		}
	});
};

var deleteJob = function(job) {
	var job_id = $(job).val();
	$.ajax({
		url: 'api/jobs/'+job_id,
		method: 'DELETE',
		success: function(res) {
			// console.log(res);
			$(job).parent().remove();
		}
	});
};

var updateJob = function(job) {
	var job_id = $(job).val();
	$.ajax({
		url: 'api/jobs/'+job_id,
		method: 'PUT',
		success: function(job) {
			// console.log(job);
			if (job.error) {
				alert(job.reason);
			}
		}
	});
};

$(document).ready(function() {

	renderJobs();

	$('.add').on('click', function() {
		var fetchUrl = $('input.url').val();
		if (fetchUrl) {
			var data = {url: fetchUrl};
			$.ajax({
				url: 'api/jobs',
				method: 'POST',
				data: data,
				success: function(job) {
					// console.log(job);
					if (job.error) {
						alert(job.reason);
					}
					else {
						var refresh_link = '<button onclick="updateJob(this)" class="update" value="'+job._id+'">Refresh</button>';
						var del_link = '<button onclick="deleteJob(this)" class="delete" value="'+job._id+'">Delete</button>';
						var link = '<li><a href="api/jobs/'+job._id+'">'+job.url+'</a>'+refresh_link+del_link+'</li>';
						$('ul.job-list').append(link);
						$('input.url').val('');
					}
				}
			});
		}
		else {
			alert('Type in a url to add to the job queue.')
		}
	});

	$('.delete-all').on('click', function() {
		$.ajax({
			url: 'api/jobs',
			method: 'DELETE',
			success: function(res) {
				// console.log(res);
				$('ul.job-list').empty();
			}
		});
	});

});
