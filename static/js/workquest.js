$( function() {
    $( ".tasks" ).sortable({
              connectWith: ".tasks",
              receive: (event, ui) => {
                  var task_id = ui.item.attr("task_id");
                  var moved_list = ui.item.parent().attr("list_name");
                  console.log("Task number " + task_id + " moved to " + moved_list);
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

