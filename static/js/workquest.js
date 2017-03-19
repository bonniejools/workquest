$( function() {
    $( ".tasks" ).sortable({
              connectWith: ".tasks",
              receive: (event, ui) => {
                  var task_id = ui.item.attr("task_id");
                  var moved_list = ui.item.parent().attr("list_name");
                  console.log("Task number " + task_id + " moved to " + moved_list);

                  if (moved_list == "available") {
                      $.post( '/api/release/', {'tId': task_id},
                          (data) => { console.log(data); runAjaxUpdate();});
                  } else if (moved_list == "current") {
                      $.post( '/api/take/', {'tId': task_id},
                          (data) => { console.log(data); runAjaxUpdate();});
                  } else if (moved_list == "finished") {
                      $.post( '/api/complete/', {'tId': task_id},
                          (data) => { console.log(data); runAjaxUpdate();});
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
    $(this).parent().remove();
});

var quotes = {
    'peasant': [
        "It's a simple life but a rewarding life",
        "I hope my potatoes don't die again",
        "I wish I wasn't so ugly",
        "Those knights are so mean",
        "I have only eaten soup for the last three months",
        "I wish my bread wasn't always moldy"
    ],
    'merchant': [
        "I look down on the Peasants",
        "Mo' money, mo' problems",
        "I come a long way since my Java days",
        "Those knights think they're so great...",
        "It's a lot of work running a business"
    ],
    'knight': [
        "I look down on the Merchants",
        "Life is good",
        "I wish people would call me Sir. more often",
        "Where did that chambermaid go?"
    ],
    'nobleman': [
        "I look down on the Knights",
        "I am looking for an eligible husband for my daughter",
        "I hope the peasants still look up to me"
    ],
    'king': [
        "I look down on the Nobles",
        "That awkward moment when you kill all your wives :/",
        "Where did I leave my crown",
        "Maybe I should learn Haskell",
        "It's good to be king",
        "I need an heir to my thrown",
        "I wonder if I can just start my own church..."
    ],
    'enlightenedone': [
        "Mongo.db is webscale",
        "/dev/null supports sharding",
        "I prefer functional programming languages",
        "I finally understand Monads",
        "Life is like a box of chocolates",
        "I have reached levels of productivity previously unheard of"
    ]
}


function setQuote() {
    $("#quote").fadeOut(1000, ()=> {
        var levelClass = $("#quote").attr('levelClass');
        var quoteList = quotes[levelClass];
        var random_quote = quoteList[Math.floor(Math.random()*quoteList.length)];
        $("#quote").text(random_quote);
        $("#quote").fadeIn(1000);
    });
}

setInterval(() => {
    setQuote();
}, 10000);
setQuote();

$(".upgrade-button").click(function() {
    var item_name = $(this).attr('item');
    if ($(this).text() == "Max") {
        console.log("Can't upgrade maxed out");
        return;
    }
    $.post('/api/upItem', {'piece': item_name},
            (data) => {
                if (data=="failed") {
                    console.log("Failed to upgrade");
                    return;
                }
                else {
                    console.log(item_name + " upgrade :D");
                    runAjaxUpdate();
                }
            });
});

// Calls /api/me and runs an update of variables
function runAjaxUpdate() {
    $.get('/api/me',(data)=> {
        console.log(data);
        $("#userGOLD").text(data.gold);
        $("#userDMG").text(data.dmg);
        $("#userHP").text(data.hp);
        $(".level").text(data.level);
        $(".xp-progress-text").text((data.xp % 100) + " / 100xp");

        // Update gear
        var helmet = $("#helmet");
        helmet.find("img").attr('src', "/assets/" + data.gear.helmet.src);
        helmet.find(".upgrade-button").text(data.gear.helmet.cost == 0 ? "Max" : data.gear.helmet.cost);
        var legs = $("#legs");
        legs.find("img").attr('src', "/assets/" + data.gear.legs.src);
        legs.find(".upgrade-button").text(data.gear.legs.cost == 0 ? "Max" : data.gear.legs.cost);
        var gloves = $("#gloves");
        gloves.find("img").attr('src', "/assets/" + data.gear.gloves.src);
        gloves.find(".upgrade-button").text(data.gear.gloves.cost == 0 ? "Max" : data.gear.gloves.cost);
        var chest = $("#chest");
        chest.find("img").attr('src', "/assets/" + data.gear.chest.src);
        chest.find(".upgrade-button").text(data.gear.chest.cost == 0 ? "Max" : data.gear.chest.cost);
        var weapon = $("#weapon");
        weapon.find("img").attr('src', "/assets/" + data.gear.weapon.src);
        weapon.find(".upgrade-button").text(data.gear.weapon.cost == 0 ? "Max" : data.gear.weapon.cost);
    });

}

