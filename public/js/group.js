$(document).ready(function(){
	$('#getGroup').click(function(){
		$.get('/getGroup', function(data){
			$('#groupList').text(data);
		});
	});
});
