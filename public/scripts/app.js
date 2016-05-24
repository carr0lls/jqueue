$(document).ready(function() {

	$('.list').on('click', function() {
		$.ajax({
			url: 'api/jobs',
			method: 'GET',
			success: function(res) {
				console.log(res);
			}
		});
	});

	$('.create').on('click', function() {
		var data = {url: 'example.com'};
		$.ajax({
			url: 'api/jobs',
			method: 'POST',
			data: data,
			success: function(res) {
				console.log(res);
			}
		});
	});

	$('.retrieve').on('click', function() {
		$.ajax({
			url: 'api/jobs/5743587bb2bc9f4d501d11bf',
			method: 'GET',
			success: function(res) {
				console.log(res);
			}
		});
	});

	$('.update').on('click', function() {
		$.ajax({
			url: 'api/jobs/5743587bb2bc9f4d501d11bf',
			method: 'PUT',
			success: function(res) {
				console.log(res);
			}
		});
	});

	$('.delete').on('click', function() {
		$.ajax({
			url: 'api/jobs/57435881b2bc9f4d501d11c0',
			method: 'DELETE',
			success: function(res) {
				console.log(res);
			}
		});
	});
});
