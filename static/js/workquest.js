$( function() {
    $( ".tasks" ).sortable({
              connectWith: ".tasks",
              receive: (event, ui) => {
                  var task_id = ui.item.attr("task_id");
                  var moved_list = ui.item.parent().attr("list_name");
                  console.log("Task number " + task_id + " moved to " + moved_list);

                  if (moved_list = "avaliable") {
                      $.post( '/api/release/', {'tId': task_id},
                              (data) => console.log(data))
                  }
                  if (moved_list = "current") {
                      $.post( '/api/take/', {'tId': task_id},
                              (data) => console.log(data))
                  }
                  if (moved_list = "complete") {
                      $.post( '/api/complete/', {'tId': task_id},
                              (data) => console.log(data))
                  }
              }
      }).disableSelection();

} );

$("#newTaskForm").submit((e) => {
    var form = $(this);
    var data = $("#newTaskForm :input").serializeArray();
    console.log(data);

    $.ajax({
        type: "POST",
        url: '/api/add',
        data: {
            'name': data[0].value,
            'hours': data[1].value,
            'priority': data[2].value
        },
        success: (data, status, jqXHR) => {console.log(data); location.reload()}
    });

    // Validation is performed by html5
    // We just send it to the server
    return false;
});

$(".taskDelete").click( function() {
    var task_id = $(this).attr('task_id');
    $.post('/api/delete', {'tId': task_id}, (err,data)=>console.log(data));
    $(this).parent().parent().remove();
});

