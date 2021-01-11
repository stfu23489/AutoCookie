/*******************************************************************************
 *  Header
*******************************************************************************/
var AC = {
    "Auto": {           // Things to do with automation.
        "Set": {},      // Functions that set-up timers for automation.
        "Timers": {}    // IDs of timers.
    },
    "Cache": {},        // Things that need to be referenced repeatedly, to speed up the game.
    "Config": {         // Things to do with the configuration of this mod.
        "Options:" {},  // Dictionaries of different user options
    },
    "Data": {},         // Things that are constant data from the game.
    "Helper": {}        // Helper functions.
}

/*******************************************************************************
 *  Auto
 *  All functions in Auto.Set are automatically associated with a timer ID in Auto.Timer with the same name for its own use.
*******************************************************************************/
/***************************************
 *  This function (re)sets all of the autos.
 *  @param  {dict}  configuration   A configuration dictionary.
 *  @global {dict}  AC.Auto.Set The automatic functions that are loaded.
 *  @global {dict}  AC.Auto.Timers  The timers associated to each function.
***************************************/
AC.Auto.load = function(configuration) {
    // Loads the configuration options
    Object.assign(AC.Config, configuration);
    
    // Clear old timers and define AC.Auto.Timers.
    var autos = Object.keys(AC.Auto.Set)
    autos.forEach(function(auto) {
        if (typeof AC.Auto.Timers[auto] !== "undefined") {
            AC.Auto.Timers[auto] = clearInterval(AC.Auto.Timers[auto]);
        } else {
            AC.Auto.Timers[auto] = undefined;
        }
    });
    
    // Set the timers.
    autos.forEach(function(auto) {
        eval("AC.Auto.Set." + auto + "()");
    });
}

/***************************************
 *  This function sets the auto FtHoF caster.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.castFtHoFTimer    How often the check to for casting triggers.
***************************************/
AC.Auto.Set.castFtHoF = function() {
    if (AC.Config.castFtHoFTimer) {
        AC.Auto.Timers.castFtHoF = setInterval(function() {
            var minigame = Game.Objects['Wizard tower'].minigame
            if(!AC.Helper.isEmpty(Game.buffs) && !AC.Helper.hasBadBuff() && minigame.magic >= (10 + 0.6*minigame.magicM)) {
                minigame.castSpell(minigame.spellsById[1]);
            }
        }, AC.Config.castFtHoFTimer);
    } else {
        AC.Auto.Timers.castFtHoF = clearInterval(AC.Auto.Timers.castFtHoF);
    }
}

/***************************************
 *  This function sets the auto clicker timer.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.clicksPerSecond   How many times per second the auto clicker should click.
***************************************/
AC.Auto.Set.click = function() {
    if (AC.Config.clicksPerSecond) {
        AC.Auto.Timers.click = setInterval(Game.ClickCookie, 1000/AC.Config.clicksPerSecond);
    } else {
        AC.Auto.Timers.click = clearInterval(AC.Auto.Timers.click);
    }
}

/***************************************
 *  This function sets a buff to the auto clicker for when under the effects of a click boosting buff.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.clicksPerSecondBuff   How many more times per second the auto clicker should click.
***************************************/
AC.Auto.Set.clickBuff = function() {
    if (AC.Config.clicksPerSecondBuff) {
        AC.Auto.Timers.clickBuff = setInterval(function() {
            if (Game.hasBuff("Click frenzy") ||
                Game.hasBuff("Cursed finger") ||
                Game.hasBuff("Devastation") ||
                Game.hasBuff("Dragonflight")) {
                Game.ClickCookie();
            }
        }, 1000/AC.Config.clicksPerSecondBuff);
    } else {
        AC.Auto.Timers.clickBuff = clearInterval(AC.Auto.Timers.clickBuff);
    }
}

/***************************************
 *  This function sets the automatic clicking of golden cookies.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.checkForGoldenTimer   How often the check for golden cookies triggers.
***************************************/
AC.Auto.Set.clickGolden = function() {
    if (AC.Config.checkForGoldenTimer) {
        AC.Auto.Timers.clickGolden = setInterval(function() {
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
        AC.Auto.Timers.clickGolden = clearInterval(AC.Auto.Timers.clickGolden);
    }
}

/***************************************
 *  This function sets the broken auto godzmazok loop.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.godzmazokLoopCount	How many times to iterate buying and selling 100 cursors.
 *  @global {int}   AC.Config.godzmazokLoopTimer	How often the check to for casting triggers.
***************************************/
AC.Auto.Set.godzmazokLoop = function() {
    AC.Cache.godzamokHasMouse = 0;
    if (AC.Config.godzmazokLoopCount && AC.Config.godzmazokLoopTimer) {
        AC.Auto.Timers.godzmazokLoop = setInterval(function() {
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
        AC.Auto.Timers.godzmazokLoop = clearInterval(AC.Auto.Timers.godzmazokLoop);
    }
}

/*******************************************************************************
 *  Cache
*******************************************************************************/
AC.Cache.godzamokHasMouse = 0;

/*******************************************************************************
 *  Config
*******************************************************************************/
AC.Config.Options.Default = {
    "clicksPerSecond": 0,
    "clicksPerSecondBuff": 10,
    "checkForGoldenTimer": 1000,
    "castFtHoFTimer": 1000,
    "godzmazokLoopCount": 0,
    "godzmazokLoopTimer": 0
}

AC.Config.Options.Max = {
    "clicksPerSecond": 100,
    "clicksPerSecondBuff": 0,
    "checkForGoldenTimer": 1000,
    "castFtHoFTimer": 1000,
    "godzmazokLoopCount": 10000,
    "godzmazokLoopTimer": 1000
}

AC.Config.Options.Min = {
    "clicksPerSecond":0,
    "clicksPerSecondBuff": 0,
    "checkForGoldenTimer": 0,
    "castFtHoFTimer": 0,
    "godzmazokLoopCount": 0,
    "godzmazokLoopTimer": 0
}

AC.Config.Options.User = {
    "clicksPerSecond": 0,
    "clicksPerSecondBuff": 10,
    "checkForGoldenTimer": 1000,
    "castFtHoFTimer": 1000,
    "godzmazokLoopCount": 0,
    "godzmazokLoopTimer": 0
}

/*******************************************************************************
 *  Data
*******************************************************************************/
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
 *  This function is called by AC.Auto.Set.CastFtHoF().
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
 *  Thus function returns 0 if the dictionary is empty and 1 if it has contents.
 *  This function is called by AC.Auto.Set.ClickGolden(), AC.Auto.Set.CastFtHoF().
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
AC.Auto.load(AC.Data.configDefault);
