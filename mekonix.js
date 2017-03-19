
var items = require('./items.json')

function getLevel(exp){
    // Increased by one so level is not zero
    var level = Math.floor(exp/100) + 1;
    return level;
}

function upgrade (item) {
    var tier = items[ item ].tier + 1;
    var type = items[ item ].type;
    var tmp = null;
    items.forEach((item)=> {
        if (item.type == type && item.tier == tier){
            tmp = item
        }
    })
    if(tmp == null)
        return item
    else
        return tmp
}

function canUpgrade (gold, item){
    var needToPay = items[item].cost;
    if (gold >= needToPay) {
        var newItem = upgrade(item);
        gold -= needToPay;
        console.log("Item has been upgraded\n");
    }else{
        gold -= needToPay;
        console.log("Not enough gold to upgrade desired item!\n");
    }
    return{gold:gold, item:newItem};
}

function getItem(name)
{
    var tmp = null
    items.forEach((item, i)=>
        {
            if(item.name == name)
                tmp = i
        })
    return tmp
}

module.exports = {getLevel, upgrade, canUpgrade, getItem}

