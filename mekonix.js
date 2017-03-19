
var items = require('./items.json')

function levelUp (exp){
    var level = Math.floor(exp/100);
    return level;
}

function upgrade (item) {
    var tier = getItem(item).tier + 1;
    var type = getItem(item).type;
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
    var needToPay = getItem(item).cost;
    if (gold >= needToPay) {
        var newItem = upgrade(item);
        gold -= needToPay;
        console.log("Item has been upgraded\n");
    }else{
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

function fight (stats1, stats2){
    var hp1 = stats1.hp;
    var dmg2 = stats2.dmg;
    var tmpHp1 = loseHealth(hp1, dmg2);
    var hp2 = stats2.hp;
    var dmg1 = stats1.dmg;
    var tmpHp2 = loseHealth(hp2, dmg1);
    return [{tmpHp1},{tmpHp2}];
}

function loseHealth (hp, dmg) {
    hp -= dmg;
    return hp;
}

module.exports = {levelUp, upgrade, canUpgrade, getItem}
