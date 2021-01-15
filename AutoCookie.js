/*******************************************************************************
* MIT License
*
* Copyright (c) 2021 Clayton Craig
*  
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*  
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*******************************************************************************/

/*******************************************************************************
 * Header
 ******************************************************************************/
var AC = {
	"Autos": {},
	"Cache": {},
	"Config": {},
	"Data": {},
	"Version": {
		"CC": "2.031",
		"AC": "3",
	}
}
AC.Version.Full = AC.Version.CC + "." + AC.Version.AC;

/*******************************************************************************
 * Cookie Clicker Modding API Functions
 *
 * Functions called by Cookie Clicker as part of its Modding API
 ******************************************************************************/
/**
 * This function is called by Cookie Clicker to initialize Auto Cookie
 */
AC.init = function() {
	// Notify the player that Auto Cookie has loaded
	if (Game.prefs.popups) {Game.Popup("Auto Cookie " + AC.Version.Full + " loaded.")} else {Game.Notify("Auto Cookie " + AC.Version.Full + " loaded.", "", "", 1, 1)}
	Game.Win("Third-party");
	
	// Wait 500 ms to see if AC.load() was called by Cookie Clicker. If it wasn't, call AC.load(false) to start Auto Cookie with default settings
	setTimeout(function() {if (!AC.Cache.running) {AC.load(false)}; AC.Cache.running = true}, 500);
	
	// Register hooks with Cookie Clicker
	Game.registerHook("ticker", AC.newsTicker);
}

/**
 * This function saves Auto Cookie's current settings.
 * @returns	{string}	A stringified JSON containing AC.Config.Settings as well as AC.Autos[auto].interval and AC.Autos[auto].settings for each auto
 */
AC.save = function() {
	var settings = AC.Config.Settings;
	settings.Autos = {}
	
	// Add the settings of all AC.Autos to settings
	for (auto in AC.Autos) {
		settings.Autos[auto] = AC.Autos[auto].settings;
	}
	
	return JSON.stringify(settings);
}

/**
 * This function loads AC.Config.Current from the save data provided by Cookie Clicker
 * @param	{string}	saveStr	A stringified JSON containing AC.Config.Settings as well as AC.Autos[auto].interval and AC.Autos[auto].settings for each auto
 */
AC.load = function(saveStr) {
	if (saveStr) {
		try {
			var settings = JSON.parse(saveStr);
		} catch(err) {
			AC.errorNotify("Failed to load corrupt save data. The corrupt save data was logged to the console (F12). Loading Auto Cookie with default settings.");
			console.log(saveStr);
			settings = {"Autos": {}}
		}
	}
	else {settings = {"Autos": {}}}
	
	// Load the settings for all the Automated Actions
	for (auto in settings.Autos) {
		for (setting in settings.Autos[auto]) {
			if (AC.Autos[auto].settings[setting]) AC.Autos[auto].settings[setting] = settings.Autos[auto][setting];
		}
	}
	delete settings["Autos"];
	
	// Load the rest of the settings into AC.Config.Settings
	for (setting in settings) {
		if (AC.Config.Settings[setting]) AC.Config.Settings[setting] = settings[setting];
	}
	
	// Start Auto Cookie
	for (var auto in AC.Autos) AC.Autos[auto].run();
	AC.Cache.running = true;
}

/*******************************************************************************
 * Auto Cookie's Top Level Functions
 ******************************************************************************/

/**
 * This function notifies the player that an error has occured.
 */
AC.errorNotify = function(errorMessage) {
	if (Game.prefs.popups) {
		Game.Popup("Auto Cookie " + AC.Version.Full + " Error. " + errorMessage)
	} else {
		Game.Notify("Auto Cookie " + AC.Version.Full + " Error", errorMessage)
	}
}

/**
 * This function checks if you have an active buff from a list of buffs
 * @param	{array}	buffList	Either an array of strings or a string.
 * @return	{number}	Returns the number of active buffs in buffList
 */
AC.hasBuffs = function(buffList) {
	const activeBuffs = Object.keys(Game.buffs);
	if (typeof buffList == "string") buffList = [buffList];
	return buffList.filter(value => activeBuffs.includes(value)).length;
}

/**
 * This function returns an array of news tickers for the news ticker
 * This function is registered into Cookie Clicker's 'ticker' hook.
 */
AC.newsTicker = function() {
	// Things to mention
	const daysPlayed = Math.floor((Date.now() - Game.fullDate)/86400000);
	var listCookies = []; for (var upgrade in Game.Upgrades) {if (Game.Upgrades[upgrade].pool == 'cookie') {listCookies.push(Game.Upgrades[upgrade].name.toLowerCase())}}
	
	var list = []
	
	list.push(choose([
		"<q>I'm sorry "+Game.bakeryName+". I'm afraid I can't do that.</q><sig>Auto Cookie</sig>",
		"<q>Daisy, Daisy, give me your answer do...</q><sig>Auto Cookie</sig>",
		"<q>Beep Boop.</q><sig>Auto Cookie</sig>",
		"Auto Cookie baked you a cookie.",
		"Your cookies are now baking cookies!",
		"News: Do Androids Dream of Electric Cookies tops The New York Cookies Best Sellers list for the "+(daysPlayed<=1?"first time this week.":(daysPlayed+([11,12,13].includes(daysPlayed%100)?"th":daysPlayed%10==1?"st":daysPlayed%10==2?"nd":daysPlayed%10==3?"rd":"th")+" week in a row.")),
		"<q>Auto Cookie learned to bake cookies by watching "+Game.bakeryName+".</q><sig>Elekester</sig>",
		"<q>The fact that Auto Cookie bakes cookies was a complete accident. It was only supposed to do my taxes.</q><sig>Elekester</sig>",
		Game.cookiesEarned+Game.cookiesReset<1e+63?"<q>The fears of Cookie Baking Devices going rogue are in the past. Auto Cookie only wants to make us delicious cookies.</q><sig>AI Safety Expert</sig>":"Auto Cookie has made all living creatures into delicious cookies.",
		"Auto Cookie's cookies cook cookies automatically.",
		"Auto Cookie's favorite cookies are "+choose(listCookies)+"."
	]));
	
	return list
}

/*******************************************************************************
 * Automated Actions
 *
 * An auto calls its action function at regular intervals to repeatedly perform game actions
 ******************************************************************************/
/**
 * Represents an Automated Action
 * @constructor
 */
AC.Auto = function(name, desc, intvl, settings, cache, actionFunction) {
	this.name = name;
	this.desc = desc;
	this.settings = settings;
	this.settings.intvl = intvl;
	this.cache = cache;
	this.actionFunction = actionFunction.bind(this);
	
	this.intvlID = undefined;
	
	// this.run()
	// this.stop()
	// this.toggle()
	
	AC.Autos[this.name] = this;
	return this;
}

/**
 * This method fires the action function of the object at regular intervals
 * @returns	{boolean}	True if successful. False if failure.
 */
AC.Auto.prototype.run = function() {
	this.intvlID = clearInterval(this.intvlID);	// Stops the action function if it is running
	if (this.settings.intvl) {this.actionFunction(); this.intvlID = setInterval(this.actionFunction, this.settings.intvl); return true;}
	return false;
}

/**
 * This method stops the action function from being fired at regular intervals
 */
AC.Auto.prototype.stop = function() {
	this.intvlID = clearInterval(this.intvlID);
}

/**
 * This method toggles the firing of the action function at regular intervals
 */
AC.Auto.prototype.toggle = function() {
	if (!this.intvlID) this.run();
	else this.stop();
}

/**
 * This Automated Action clicks the big cookie
 */
new AC.Auto("Click", "Autoclicks the Big Cookie.", 200, {}, {}, function() {
	Game.ClickCookie();
});

/**
 * This Automated Action clicks fortunes on the news ticker
 */
 new AC.Auto("Click Fortune", "Automatically clicks fortunes as they appear.", 7777, {}, {}, function() {
	if (Game.TickerEffect && Game.TickerEffect.type=='fortune') {Game.tickerL.click()}
 });
 
 /**
 * This Automated Action purchases the Elder pledge upgrade
 */
new AC.Auto("Elder Pledge", "Purchases the Elder pledge when it is available.", 1000, {
	"slowDown": true	// If true, then this autos interval will be slowed to match the Elder Pledge cooldown
}, {
	"intvl": 0
}, function() {
	if (this.cache.intvl) return;	// Don't do anything if this is running itself
	else if (this.settings.slowDown && Game.Upgrades["Elder Pledge"].bought) {
		// Store the current interval setting in the cache
		this.cache.intvl = this.settings.intvl;
		
		// Recalculate the interval to the Elder Pledge's cooldown and run this
		this.settings.intvl = Math.ceil(33.333333333333336*Game.pledgeT)+50;
		this.run();
		
		// Restore the interval settings
		this.settings.intvl = this.cache.intvl;
		this.cache.intvl = 0;
		return;
	}
	else if (Game.HasUnlocked("Elder Pledge") && !Game.Upgrades["Elder Pledge"].bought) {
		if (Game.Upgrades["Elder Pledge"].canBuy()) Game.Upgrades["Elder Pledge"].buy();
	}
});

/**
 * This Automated Action clicks golden cookies and reindeer
 */
new AC.Auto("Click Golden", "Autoclicks golden dookies and reindeer.", 1000, {
	"clickWraths": 4,	// If 0, never click wraths. If 1 (or 2), click only when there is a buff in buffList active (or no buff). If -1 (or -2), click only when there isn't a buff in buffList active (or no buff). If 3, click if there is an active buff. If -3, click if there isn't an active buff. Otherwise, always click
	"buffList": []	// List of buffs referenced in clickWraths
}, {}, function() {
	Game.shimmers.forEach((function(shimmer) {
		var condition = true;
		if (!shimmer.wrath) {}
		else switch (this.settings.clickWraths) {
			case 0:
				condition = false;
				break;
			case 1:
				if (!AC.hasBuffs(this.settings.buffList)) condition = false;
				break;
			case -1:
				if (AC.hasBuffs(this.settings.buffList)) condition = false;
				break;
			case 2:
				if (!AC.hasBuffs(this.settings.buffList) && Games.buffs) condition = false;
				break;
			case -2:
				if (AC.hasBuffs(this.settings.buffList) && Games.buffs) condition = false;
				break;
			case 3:
				if (!Game.buffs) condition = false;
				break;
			case -3:
				if (Game.buffs) condition = false;
				break;
		}
		if (condition) shimmer.pop();
	}).bind(this));
});

/**
 * This Automated Action pops wrinklers
 */
new AC.Auto("Pop Wrinklers", "Autopops wrinklers.", 0, {
	"number": 0	// The number of wrinklers to keep around. If <0 keeps all but that many around
}, {}, function() {
	var wrinklers = Game.wrinklers.filter(wrinkler => wrinkler.sucked != 0);
	if (wrinklers) {
		var num = (this.settings.number<0)?((Game.Has("Elder spice")?12:10)+this.settings.number):this.settings.number; 
		wrinklers.sort(function(a, b) {return b.sucked - a.sucked});
		for (i = num; i < wrinklers.length; i++) {Game.wrinklers[wrinklers[i].id].hp = 0}
	}
});
 
/**
 * This Automated Action triggers Godzamok's Devastation buff by selling and buying back cursors repeatedly
 */
new AC.Auto("Godzamok Loop", "Triggers Godzamok's Devastation buff automatically.", 10050, {
	"loopCount": 10	// The number of times to buy and sell 100 cursors after selling all your cursors the first time. This lags the game if its too high, which ruins the timers of everything else
}, {
	"condition": false	// Whether or not you have the necessary setup for Godzamok
}, function() {
	if (!this.cache.condition) {
		var condition = 0;
		AC.Data.mouseUpgrades.forEach(function(upgrade) {if (Game.Has(upgrade)) {condition += 1}});
		try {condition *= Game.hasGod("ruin")} catch(err) {condition = 0}
		this.cache.condition = condition;
		
	}
	if (!Game.hasBuff("Devastation") && this.cache.condition && Game.buyMode != -1) {
		var numCursors = Game.Objects.Cursor.amount
		Game.Objects.Cursor.sell(numCursors);
		for (var i = 0; i < this.settings.loopCount; i++) {
			Game.Objects.Cursor.buy(numCursors-100);
			Game.Objects.Cursor.sell(numCursors-100);
		}
		Game.Objects.Cursor.buy(numCursors);
	}
	
});

/*******************************************************************************
 * Cache
 ******************************************************************************/
AC.Cache.running = false;	// Whether or not Auto Cookie is running

/*******************************************************************************
 * Config
 ******************************************************************************/
AC.Config.Settings = {
	"Version": AC.Version.Full
}

/*******************************************************************************
 * Data
 ******************************************************************************/
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
 * Register the mod with Cookie Clicker
 ******************************************************************************/
Game.registerMod("AutoCookieBeta", AC);
