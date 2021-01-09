var AC = {
    "Auto": {},
    "Config": {},
    "Helper": {}
}

// Variables for timers.
AC.Auto.click = undefined;
AC.Auto.clickGolden = undefined;
AC.Auto.clickBuff = undefined;

// Auto-Clicking Options.
AC.Config.clicksPerSecond = 0;
AC.Config.autoClickGolden = 1;
AC.Config.clicksPerSecondBuff = 10;
AC.Config.checkForGoldenTimer = 1000;

AC.Helper.isEmpty = function(obj) {
    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return 0;
        }
    }
    return 1;
}

AC.Auto.toggleClick = function() {
    if (AC.Config.clicksPerSecond) {
        AC.Auto.click = setInterval(Game.ClickCookie, 1000/AC.Config.clicksPerSecond);
    } else {
        AC.Auto.click = clearInterval(AC.Auto.click);
    }
}

AC.Auto.toggleClickGolden = function() {
    if (AC.Config.autoClickGolden) {
        AC.Auto.clickGolden = setInterval(function() {
            Game.shimmers.forEach(function(shimmer) {
                if (shimmer.type == "golden" && (shimmer.wrath ==0 || AC.Helper.isEmpty(Game.buffs))) {
                    shimmer.pop();
                }
            });
        }, AC.Config.checkForGoldenTimer);
    } else {
        AC.Auto.clickGolden = clearInterval(AC.Auto.clickGolden);
    }
}

AC.Auto.toggleClickBuff = function() {
    if (AC.Config.clicksPerSecondBuff) {
        AC.Auto.clickBuff = setInterval(function() {
            if (Game.hasBuff("Click frenzy") ||
                Game.hasBuff("Cursed finger") ||
                Game.hasBuff("Devastation") ||
                Game.hasBuff("Dragonflight")) {
                Game.ClickCookie();
            }
        }, 1000/AC.Config.clicksPerSecondBuff);
    } else {
        AC.Auto.clickBuff = clearInterval(AC.Auto.clickBuff);
    }
}

AC.Auto.load = function() {
    AC.Auto.toggleClick()
    AC.Auto.toggleClickBuff()
    AC.Auto.toggleClickGolden()
}

AC.Auto.load();
