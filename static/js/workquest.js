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
