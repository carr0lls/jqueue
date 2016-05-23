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
		$.ajax({
			url: 'api/jobs',
			method: 'POST',
			success: function(res) {
				console.log(res);
			}
		});
	});

	$('.retrieve').on('click', function() {
		$.ajax({
			url: 'api/jobs/2',
			method: 'GET',
			success: function(res) {
				console.log(res);
			}
		});
	});

	$('.update').on('click', function() {
		$.ajax({
			url: 'api/jobs/3',
			method: 'PUT',
			success: function(res) {
				console.log(res);
			}
		});
	});

	$('.delete').on('click', function() {
		$.ajax({
			url: 'api/jobs/1',
			method: 'DELETE',
			success: function(res) {
				console.log(res);
			}
		});
	});
});