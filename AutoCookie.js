var AC = {};

// Auto-Clicking Options
AC.Config.clicksPerSecond = 0;
AC.Config.autoClickGoldenOn = true;
AC.Config.clicksPerSecondBuff = 10;
AC.Config.checkForGoldenTimer = 1000;

AC.Helper.isEmpty = function(obj) {
    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

AC.Auto.clickFunc = function() {
    Game.ClickCookie();
}

AC.Auto.clickGoldenFunc = function() {
    Game.shimmers.forEach(function(shimmer) {
        if (shimmer.type == "golden" && (shimmer.wrath ==0 || AC.Helper.isEmpty(Game.buffs))) {
            shimmer.pop();
        }
    })
}

AC.Auto.clickBuffFunc = function() {
    if (Game.hasBuff("Click frenzy") ||
        Game.hasBuff("Cursed finger") ||
        Game.hasBuff("Devastation") ||
        Game.hasBuff("Dragonflight")) {
        Game.ClickCookie();
    }
}

AC.Auto.init = function() {
    if (AC.Config.clicksPerSecond != 0) {
        AC.Auto.click = setInterval(AC.Auto.clickFunc, 1000/AC.Config.clicksPerSecond);
    }
    if (AC.Config.autoClickGoldenOn) {
        AC.Auto.clickGolden = setInterval(AC.Auto.clickGoldenFunc, AC.Config.checkForGoldenTimer);
    }
    if (AC.Config.clicksPerSecondBuff != 0) {
        AC.Auto.clickBuff = setInterval(AC.Auto.clickBuffFunc, 1000/AC.Config.clicksPerSecondBuff);
    }
}

AC.Auto.init();
