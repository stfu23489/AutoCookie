/*******************************************************************************
 *  MIT License
 *
 *  Copyright (c) 2021 Clayton Craig
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*******************************************************************************/

/*******************************************************************************
 *  To Do:
 *  (0) Add a checker to AC.Auto.Fns.castFtHoF and .godzamokLoop to see if the minigame is unlocked. For the latter maybe add a routine to swap Godzamok into the pantheon.
 *  (1) Fix the indentation of the code.
 *  (2) Fix the indentation of the function descriptors.
 *  (3) Decide what AC.Auto.Fns should be named. Leave it as is or something more descriptive like AC.Auto.TimerFunctions.
 *  (i) Beautify code.
*******************************************************************************/

/*******************************************************************************
 *  AC Declaration
*******************************************************************************/
var AC = {
    "Auto": {
        "Fns": {},
        "Timers": {}
    },
    "Cache": {},
    "Config": {
        "Options": {},
    },
    "Data": {},
    "Helper": {}
}

/*******************************************************************************
 *  Auto
 *  Functions and other objects to do with automation.
*******************************************************************************/
/***************************************
 *  This function (re)sets all of the autos.
 *  @param  {dict}  configuration   A configuration dictionary.
 *  @global {dict}  AC.Auto.Fns The automatic functions that are loaded.
 *  @global {dict}  AC.Auto.Timers  The timers associated to each function.
***************************************/
AC.Auto.load = function(configuration) {
    // Loads the configuration options
    Object.assign(AC.Config.Options.loaded, configuration);
    
    // Clear old timers and define AC.Auto.Timers.
    var autos = Object.keys(AC.Auto.Fns)
    autos.forEach(function(auto) {
        if (typeof AC.Auto.Timers[auto] !== "undefined") {
            AC.Auto.Timers[auto] = clearInterval(AC.Auto.Timers[auto]);
        } else {
            AC.Auto.Timers[auto] = undefined;
        }
    });
    
    // Set the timers.
    autos.forEach(function(auto) {
        eval("AC.Auto.Fns." + auto + "()");
    });
}

/***************************************
 *  Auto.Fns
 *  All functions in Auto.Fn are automatically associated with a timer ID in Auto.Timers with the same name for its own use.
 *  Each function in Auto.Fn should start a single timer and tie its given timer ID to it.
***************************************/

/*******************
 *  This function sets the auto FtHoF caster.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.Options.loaded.castFtHoFTimer How often the check to for casting triggers.
*******************/
AC.Auto.Fns.castFtHoF = function() {
    if (AC.Config.Options.loaded.castFtHoFTimer) {
        AC.Auto.Timers.castFtHoF = setInterval(function() {
            var minigame = Game.Objects['Wizard tower'].minigame
            if (!AC.Helper.isEmpty(Game.buffs) && !AC.Helper.hasBadBuff() && minigame.magic >= (10 + 0.6*minigame.magicM)) {
                minigame.castSpell(minigame.spellsById[1]);
            }
        }, AC.Config.Options.loaded.castFtHoFTimer);
    } else {
        AC.Auto.Timers.castFtHoF = clearInterval(AC.Auto.Timers.castFtHoF);
    }
}

/*******************
 *  This function sets the auto clicker timer.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.Options.loaded.clicksPerSecond    How many times per second the auto clicker should click.
*******************/
AC.Auto.Fns.click = function() {
    if (AC.Config.Options.loaded.clicksPerSecond) {
        AC.Auto.Timers.click = setInterval(Game.ClickCookie, 1000/AC.Config.Options.loaded.clicksPerSecond);
    } else {
        AC.Auto.Timers.click = clearInterval(AC.Auto.Timers.click);
    }
}

/*******************
 *  This function sets a buff to the auto clicker for when under the effects of a click boosting buff.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.Options.loaded.clicksPerSecondBuff    How many more times per second the auto clicker should click.
*******************/
AC.Auto.Fns.clickBuff = function() {
    if (AC.Config.Options.loaded.clicksPerSecondBuff) {
        AC.Auto.Timers.clickBuff = setInterval(function() {
            if (Game.hasBuff("Click frenzy") ||
                Game.hasBuff("Cursed finger") ||
                Game.hasBuff("Devastation") ||
                Game.hasBuff("Dragonflight")) {
                Game.ClickCookie();
            }
        }, 1000/AC.Config.Options.loaded.clicksPerSecondBuff);
    } else {
        AC.Auto.Timers.clickBuff = clearInterval(AC.Auto.Timers.clickBuff);
    }
}

/*******************
 *  This function sets the automatic clicking of golden cookies.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.Options.loaded.checkForGoldenTimer    How often the check for golden cookies triggers.
*******************/
AC.Auto.Fns.clickGolden = function() {
    if (AC.Config.Options.loaded.checkForGoldenTimer) {
        AC.Auto.Timers.clickGolden = setInterval(function() {
            Game.shimmers.forEach(function(shimmer) {
                if (shimmer.type == "golden" && (shimmer.wrath == 0 ||
                    AC.Helper.isEmpty(Game.buffs) ||
                    Game.hasBuff("Cookie chain") ||
                    Game.hasBuff("Cookie storm"))) {
                    shimmer.pop();
                }
            });
        }, AC.Config.Options.loaded.checkForGoldenTimer);
    } else {
        AC.Auto.Timers.clickGolden = clearInterval(AC.Auto.Timers.clickGolden);
    }
}

/*******************
 *  This function sets the broken auto godzmazok loop.
 *  It is called by AC.Auto.load()
 *  @global {int}   AC.Config.Options.loaded.godzmazokLoopCount How many times to iterate buying and selling 100 cursors.
 *  @global {int}   AC.Config.Options.loaded.godzmazokLoopTimer How often the check to for casting triggers.
*******************/
AC.Auto.Fns.godzmazokLoop = function() {
    AC.Cache.godzamokHasMouse = 0;
    if (AC.Config.Options.loaded.godzmazokLoopCount && AC.Config.Options.loaded.godzmazokLoopTimer) {
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
        }, AC.Config.Options.loaded.godzmazokLoopTimer);
    } else {
        AC.Auto.Timers.godzmazokLoop = clearInterval(AC.Auto.Timers.godzmazokLoop);
    }
}

/*******************************************************************************
 *  Cache
 *  Everything stored in AC.Cache is a variable that is referenced multiple times and should be stored here for optimization.
*******************************************************************************/
AC.Cache.godzamokHasMouse = 0;

/*******************************************************************************
 *  Config
 *  Functions and dictionaries that store the confriguration of this mod.
*******************************************************************************/
/***************************************
 *  Config.Options
 *  These dictionaries store the configuration options that the user has control over.
 *  default are the default options, while min and max are the minimum and maximum values.
***************************************/
AC.Config.Options.default = {
    "clicksPerSecond": 0,
    "clicksPerSecondBuff": 10,
    "checkForGoldenTimer": 1000,
    "castFtHoFTimer": 1000,
    "godzmazokLoopCount": 0,
    "godzmazokLoopTimer": 0
}

AC.Config.Options.max = {
    "clicksPerSecond": 100,
    "clicksPerSecondBuff": 100,
    "checkForGoldenTimer": 1000,
    "castFtHoFTimer": 1000,
    "godzmazokLoopCount": 10000,
    "godzmazokLoopTimer": 1000
}

AC.Config.Options.min = {
    "clicksPerSecond":0,
    "clicksPerSecondBuff": 0,
    "checkForGoldenTimer": 0,
    "castFtHoFTimer": 0,
    "godzmazokLoopCount": 0,
    "godzmazokLoopTimer": 0
}

AC.Config.Options.loaded = AC.Config.Options.default

/*******************************************************************************
 *  Data
 *  Game data that is difficult to rip from the game at runtime.
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
 *  Additional functions that aid in other calculations.
*******************************************************************************/
/***************************************
 *  Thus function returns 0 if there is no active debuff and the number of debuffs otherwise.
 *  This function is called by AC.Auto.Fns.castFtHoF().
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
 *  This function is called by AC.Auto.Fns.clickGolden(), AC.Auto.Fns.castFtHoF().
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
 *  Let's run the mod.
*******************************************************************************/
AC.Auto.load(AC.Config.Options.default);
if (Game.prefs.popups) {
    Game.Popup("Auto Cookie " + AC.Version + " loaded.");
} else {
    Game.Notify("Auto Cookie " + AC.Version + " loaded.", "", "", 1, 1);
}
// Figure out how the game wants you to register as mod. See Cookie monster as example.
