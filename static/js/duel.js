var chp = hp
var chp2 = hp2
var turn = 0

function update()
{
    document.getElementById("userHealth").style.width = Math.floor((chp/hp)*100) + "%"
    document.getElementById("opponentHealth").style.width = Math.floor((chp2/hp2)*100) + "%"
}

var attack = function ()
{
    if(turn)
    {
        if(dmg < chp2)
        {
            turn = 0
            chp2 -= dmg;
        }
        else
        {
            chp2 = 0
            attack = function(){}
        }
        update()
    }
    else
    {
        if(dmg2 < chp)
        {
            turn = 1
            chp -= dmg2;
        }
        else
        {
            chp = 0
            attack = function(){}
        }
        update()
    }
}

setInterval(attack, 1000)
