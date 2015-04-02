$(document).ready(function(){
	$('#getGroup').click(function(){
		$('#groupList').html('');
		$.get('/getGroup', function(data){
			for(var i = 0; i < data.length ;i++){
				$('#groupList').append("<h1 class='grp'>"+data[i].name+"</h1>");				
			}			
		});		
	});
	$('#groupList').on("click",'.grp', function(){		
		$('#groupName').val($(this).text());
	});
});
