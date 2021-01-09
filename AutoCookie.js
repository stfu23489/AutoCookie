/*******************************************************************************
 *  Header
*******************************************************************************/
var AC = {
    "Auto": {},
    "Config": {},
    "Helper": {}
}

/*******************************************************************************
 *  Auto
*******************************************************************************/
// Variables for timers.
AC.Auto.click = undefined;
AC.Auto.clickGolden = undefined;
AC.Auto.clickBuff = undefined;

/***************************************
 *  This function (re)loads all of the autos.
 *  @global {int}   AC.Config.clicksPerSecond   How many times per second the auto clicker should click.
***************************************/
AC.Auto.load = function() {
    AC.Auto.toggleClick()
    AC.Auto.toggleClickBuff()
    AC.Auto.toggleClickGolden()
}

/***************************************
 *  This function toggles the auto clicker timer.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.clicksPerSecond   How many times per second the auto clicker should click.
***************************************/
AC.Auto.toggleClick = function() {
    if (AC.Config.clicksPerSecond) {
        AC.Auto.click = setInterval(Game.ClickCookie, 1000/AC.Config.clicksPerSecond);
    } else {
        AC.Auto.click = clearInterval(AC.Auto.click);
    }
}

/***************************************
 *  This function toggles a buff to the auto clicker for when under the effects of a click boosting buff.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.clicksPerSecondBuff   How many more times per second the auto clicker should click.
***************************************/
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

/***************************************
 *  This function toggles the automatic clicking of golden cookies.
 *  It is called by AC.Auto.load()
 *  @global {bool}  AC.Config.autoClickGolden   0 if off. 1 if on.
 *  @global {int}   AC.Config.checkForGoldenTimer   How often the check for golden cookies triggers.
***************************************/
AC.Auto.toggleClickGolden = function() {
    if (AC.Config.autoClickGolden) {
        AC.Auto.clickGolden = setInterval(function() {
            Game.shimmers.forEach(function(shimmer) {
                if (shimmer.type == "golden" && (shimmer.wrath == 0 || AC.Helper.isEmpty(Game.buffs))) {
                    shimmer.pop();
                }
            });
        }, AC.Config.checkForGoldenTimer);
    } else {
        AC.Auto.clickGolden = clearInterval(AC.Auto.clickGolden);
    }
}

/*******************************************************************************
 *  Config
*******************************************************************************/
// Auto-Clicking Options.
AC.Config.clicksPerSecond = 0;
AC.Config.autoClickGolden = 1;
AC.Config.clicksPerSecondBuff = 10;
AC.Config.checkForGoldenTimer = 1000;

/*******************************************************************************
 *  Helper
*******************************************************************************/

/***************************************
 *  Thus function returns 0 if the dictionary is empty and 1 if it has contents.
 *  @param  {dict}  obj The dictionary to be checked.
***************************************/
AC.Helper.isEmpty = function(obj) {
    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return 0;
        }
    }
    return 1;
}

/*******************************************************************************
 *  Main
*******************************************************************************/
AC.Auto.load();
