/*******************************************************************************
 *  Header
*******************************************************************************/
var AC = {
    "Auto": {},
    "Cache": {},
    "Config": {},
    "Data": {},
    "Helper": {}
}

/*******************************************************************************
 *  Auto
*******************************************************************************/
AC.Auto.click = undefined;
AC.Auto.clickGolden = undefined;
AC.Auto.clickBuff = undefined;
AC.Auto.castFtHoF = undefined;
AC.Auto.godzmazokLoop = undefined;

/***************************************
 *  This function (re)sets all of the autos.
 *  @global {int}   AC.Config.clicksPerSecond   How many times per second the auto clicker should click.
***************************************/
AC.Auto.load = function() {
    // Clear old timers and define variables.
    AC.Helper.resetTimer(AC.Auto.click)
    AC.Helper.resetTimer(AC.Auto.clickGolden)
    AC.Helper.resetTimer(AC.Auto.clickBuff)
    AC.Helper.resetTimer(AC.Auto.castFtHoF)
    AC.Helper.resetTimer(AC.Auto.godzmazokLoop)
    
    // Set the timers.
    AC.Auto.setClick();
    AC.Auto.setClickBuff();
    AC.Auto.setClickGolden();
    AC.Auto.setCastFtHoF();
    AC.Auto.setGodzmazokLoop();
}

/***************************************
 *  This function sets the auto clicker timer.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.clicksPerSecond   How many times per second the auto clicker should click.
***************************************/
AC.Auto.setClick = function() {
    if (AC.Config.clicksPerSecond) {
        AC.Auto.click = setInterval(Game.ClickCookie, 1000/AC.Config.clicksPerSecond);
    } else {
        AC.Auto.click = clearInterval(AC.Auto.click);
    }
}

/***************************************
 *  This function sets a buff to the auto clicker for when under the effects of a click boosting buff.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.clicksPerSecondBuff   How many more times per second the auto clicker should click.
***************************************/
AC.Auto.setClickBuff = function() {
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
 *  This function sets the automatic clicking of golden cookies.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.checkForGoldenTimer   How often the check for golden cookies triggers.
***************************************/
AC.Auto.setClickGolden = function() {
    if (AC.Config.checkForGoldenTimer) {
        AC.Auto.clickGolden = setInterval(function() {
            Game.shimmers.forEach(function(shimmer) {
                if (shimmer.type == "golden" && (shimmer.wrath == 0 ||
                    AC.Helper.isEmpty(Game.buffs) ||
                    Game.hasBuff("Cookie chain") ||
                    Game.hasBuff("Cookie storm"))) {
                    shimmer.pop();
                }
            });
        }, AC.Config.checkForGoldenTimer);
    } else {
        AC.Auto.clickGolden = clearInterval(AC.Auto.clickGolden);
    }
}

/***************************************
 *  This function sets the auto FtHoF caster.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.castFtHoFTimer    How often the check to for casting triggers.
***************************************/
AC.Auto.setCastFtHoF = function() {
    if (AC.Config.castFtHoFTimer) {
        AC.Auto.castFtHoF = setInterval(function() {
            var minigame = Game.Objects['Wizard tower'].minigame
            if(!AC.Helper.isEmpty(Game.buffs) && !AC.Helper.hasBadBuff() && minigame.magic >= (10 + 0.6*minigame.magicM)) {
                minigame.castSpell(minigame.spellsById[1]);
            }
        }, AC.Config.castFtHoFTimer);
    } else {
        AC.Auto.castFtHoF = clearInterval(AC.Auto.castFtHoF);
    }
}

/***************************************
 *  This function sets the broken auto godzmazok loop.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.godzmazokLoopCount	How many times to iterate buying and selling 100 cursors.
 *  @global {int}   AC.Config.godzmazokLoopTimer	How often the check to for casting triggers.
***************************************/
AC.Auto.setGodzmazokLoop = function() {
    AC.Cache.godzamokHasMouse = 0;
    if (AC.Config.godzmazokLoopCount && AC.Config.godzmazokLoopTimer) {
        AC.Auto.godzmazokLoop = setInterval(function() {
            if (AC.Cache.godzamokHasMouse == 0) {
                AC.Data.mouseUpgrades.forEach(function(upgrade) {if (Game.Has(upgrade)) {AC.Cache.godzamokHasMouse = 1}});
                if (AC.Cache.godzamokHasMouse == 0 && Game.HasUnlocked("Plastic mouse") && (Game.Upgrades["Plastic mouse"].getPrice() <= Game.cookies)) {
                    Game.Upgrades["Plastic mouse"].buy();
                    AC.Cache.godzamokHasMouse = 1;
                }
            }
            if (!Game.hasBuff("Devastation") && AC.Cache.godzamokHasMouse) {
                var i;
                var cursorAmount = Game.Objects.Cursor.amount
                Game.Objects.Cursor.sell(cursorAmount);
                for (i = 0; i < AC.godzmazokLoopCount; i++) {
                    Game.Objects.Cursor.buy(100);
                    Game.Objects.Cursor.sell(100);
                }
                Game.Objects.Cursor.buy(cursorAmount);
            }
        }, AC.Config.godzmazokLoopTimer);
    } else {
        AC.Auto.godzmazokLoop = clearInterval(AC.Auto.godzmazokLoop);
    }
}

/*******************************************************************************
 *  Cache
*******************************************************************************/
AC.Cache.godzamokHasMouse = 0;

/*******************************************************************************
 *  Config
*******************************************************************************/
/***************************************
 *  This function loads configuration data.
 *  @global {dict}  AC.Config   The configuration dictionary.
 *  @param  {dict}  obj The configuration options to load into AC.Config.
***************************************/
AC.Config.load = function(obj) {
    Object.assign(AC.Config, obj);
}

/*******************************************************************************
 *  Data
*******************************************************************************/
AC.Data.configDefault = {
    "clicksPerSecond": 0,
    "clicksPerSecondBuff": 10,
    "checkForGoldenTimer": 1000,
    "castFtHoFTimer": 1000,
    "godzmazokLoopCount": 0,
    "godzmazokLoopTimer": 0
}

AC.Data.configMax = {
    "clicksPerSecond": 100,
    "clicksPerSecondBuff": 0,
    "checkForGoldenTimer": 1000,
    "castFtHoFTimer": 1000,
    "godzmazokLoopCount": 1000,
    "godzmazokLoopTimer": 1000
}

AC.Data.configMin = {
    "clicksPerSecond":0,
    "clicksPerSecondBuff": 0,
    "checkForGoldenTimer": 0,
    "castFtHoFTimer": 0,
    "godzmazokLoopCount": 0,
    "godzmazokLoopTimer": 0
}

AC.Data.badBuffs = [
    "Slap to the face",
    "Senility",
    "Locusts",
    "Cave-in",
    "Jammed machinery",
    "Recession",
    "Crisis of faith",
    "Magivores",
    "Black holes",
    "Lab disaster",
    "Dimensional calamity",
    "Time jam",
    "Predictable tragedy",
    "Eclipse",
    "Dry spell",
    "Microcosm",
    "Antipattern",
    "Big crunch",
    "Clot"
]

AC.Data.mouseUpgrades = [
    "Plastic mouse",
    "Iron mouse",
    "Titanium mouse",
    "Adamantium mouse",
    "Unobtainium mouse",
    "Eludium mouse",
    "Wishalloy mouse",
    "Fantasteel mouse",
    "Nevercrack mouse",
    "Armythril mouse",
    "Technobsidian mouse",
    "Plasmarble mouse",
    "Miraculite mouse",
    "Fortune #104"
]

/*******************************************************************************
 *  Helper
*******************************************************************************/
/***************************************
 *  Thus function returns 0 if there is no active debuff and the number of debuffs otherwise.
 *  @global {list}  AC.Data.badBuffs    A list of debuffs.
***************************************/
AC.Helper.hasBadBuff = function() {
    var num = 0;
    AC.Data.badBuffs.forEach(function(buff) {
        if (Game.hasBuff(buff)) {num += 1}
    });
    return num;
}

/***************************************
 *  Thus function resets the timer at the given ID or sets obj to undefined if it hasn't been defined.
 *  @param {list}  obj  The ID of the timer to be reset.
***************************************/
AC.Helper.resetTimer = function(obj) {
    if (typeof obj !== "undefined") {obj = clearInterval(obj)} else {obj = undefined}
}

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
AC.Config.load(AC.Data.configDefault);
AC.Auto.load();
