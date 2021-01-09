var AC = {};

// Auto-Clicking Options
AC.clicksPerSecond = 0;
AC.autoClickGoldenOn = true;
AC.clicksPerSecondBuff = 10;
AC.checkForGoldenTimer = 1000;

AC.isEmpty = function(obj) {
    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

AC.autoClickFunc = function() {
    Game.ClickCookie();
}

AC.autoClickGoldenFunc = function() {
    Game.shimmers.forEach(function(shimmer) {
        if (shimmer.type == "golden" && (shimmer.wrath ==0 || isEmpty(Game.buffs))) {
            shimmer.pop();
        }
    })
}

AC.autoClickBuffFunc = function() {
    if (Game.hasBuff("Click frenzy") ||
        Game.hasBuff("Cursed finger") ||
        Game.hasBuff("Devastation") ||
        Game.hasBuff("Dragonflight")) {
        Game.ClickCookie();
    }
}

AC.init = function() {
    if (AC.clicksPerSecond != 0) {
        AC.autoClick = setInterval(AC.autoClickFunc, 1000/AC.clicksPerSecond);
    }
    if (AC.autoClickGoldenOn) {
        AC.autoClickGolden = setInterval(AC.autoClickGoldenFunc, AC.checkForGoldenTimer);
    }
    if (AC.clicksPerSecondBuff != 0) {
        AC.autoClickBuff = setInterval(AC.autoClickBuffFunc, 1000/AC.clicksPerSecondBuff);
    }
}

AC.init();
