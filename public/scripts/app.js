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
			url: 'api/jobs/5743f617c83dcd63c6099518',
			method: 'GET',
			success: function(res) {
				console.log(res);
			}
		});
	});

	$('.update').on('click', function() {
		$.ajax({
			url: 'api/jobs/5743f9a218d0e1ddd8f4490b',
			method: 'PUT',
			success: function(res) {
				console.log(res);
			}
		});
	});

	$('.delete').on('click', function() {
		$.ajax({
			url: 'api/jobs/5743f984e6df629bd88dc09d',
			method: 'DELETE',
			success: function(res) {
				console.log(res);
			}
		});
	});
});
