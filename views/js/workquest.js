$( function() {
        $( ".tasks" ).sortable({
                  connectWith: ".tasks",
                  receive: (event, ui) => console.log(ui.item)
                          }).disableSelection();
          } );
