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
*******************************************************************************/
var AC = {
	"Auto": {},
	"Cache": {"Auto": {}},
	"Config": {},
	"Data": {},
	"Mod": {},
	"Version": {
		"CC": "2.031",
		"AC": "001"
	}
}

/*******************************************************************************
* Cookie Clicker Modding API Functions
*
* Functions called by Cookie Clicker as part of its Modding API
*******************************************************************************/
/*
* This function is called by Cookie Clicker to initialize Auto Cookie
*/
AC.init = function() {
	// Notify the player that Auto Cookie has loaded
	if (Game.prefs.popups) {Game.Popup("Auto Cookie " + AC.Version.CC + "." + AC.Version.AC + " loaded.")} else {Game.Notify("Auto Cookie " + AC.Version.CC + "." + AC.Version.AC + " loaded.", "", "", 1, 1)}
	Game.Win("Third-party");
	
	// Initialize the cache for each function in AC.Auto
	for (const f in AC.Auto) {
		AC.Cache.Auto[f] = {}
	}
	
	// Wait 500 ms to see if AC.load() was called by Cookie Clicker. If it wasn't, call AC.load(false) to start Auto Cookie with default settings
	setTimeout(function() {if (!AC.Cache.running) {AC.load(false)}; AC.Cache.running = true}, 500);
	
	// Register hooks with Cookie Clicker
	Game.registerHook("ticker", AC.newTickers);
}

/*
* This function returns AC.Config.Current as a stringified JSON as requested by Cookie Clicker
*/
AC.save = function() {
	return JSON.stringify(AC.Config.Current);
}

/*
* This function loads AC.Config.Current from the save data provided by Cookie Clicker
* @param	{str}	saveStr	Setting data in the same format as AC.Config.Default as a stringified JSON
*/
AC.load = function(saveStr) {
	// Reset the settings to the default
	AC.Config.Current = AC.Config.Default;
	
	// Try to load the settings provided by Cookie Clicker
	if (saveStr) {
		try {
			AC.Config.Current = JSON.parse(saveStr);
		} catch(err) {
			AC.errorNotify("Failed to load mod save data. ${err}");
		}
	}
	
	// Start Auto Cookie
	for (const f in AC.Auto) {AC.setAuto(f)}
	AC.Cache.running = true;
}

/*******************************************************************************
* Auto Cookie
*
* Top level functions
*******************************************************************************/

/*
* This function notifies the player that an error has occured.
*/
AC.errorNotify = function(errorMessage) {
	if (Game.prefs.popups) {
		Game.Popup("Auto Cookie " + AC.Version.CC + "." + AC.Version.AC + " Error. " + errorMessage)
	} else {
		Game.Notify("Auto Cookie " + AC.Version.CC + "." + AC.Version.AC + " Error", errorMessage)
	}
}

/* 
* This function returns an array of new tickers for the news ticker
* This function is registered into Cookie Clicker's 'ticker' hook.
*/
AC.newTickers = function() {
	const daysPlayed = Math.floor((Date.now() - Game.fullDate)/86400000);
	return [
		"<q>I'm sorry " + Game.bakeryName + ". I'm afraid I can't do that.</q><sig>Auto Cookie</sig>",
		"<q>Daisy, Daisy, give me your answer do...</q><sig>Auto Cookie</sig>",
		"News: Do Androids Dream of Electric Cookies tops The New York Times Best Sellers list for the " + (daysPlayed<=1?"first time this week.":(daysPlayed+([11,12,13].includes(daysPlayed%100)?"th":daysPlayed%10==1?"st":daysPlayed%10==2?"nd":daysPlayed%10==3?"rd":"th")+" week in a row."))
	]
}

/*
* This function sets the interval at which to call f, based on the setting AC.Config.Current.Auto[f].interval, the ID to clear this interval is stored in AC.Cache.Auto[f].ID
* @param	{func}	f	The function to be started
*/
AC.setAuto = function(f) {
	if (typeof AC.Cache.Auto[f].ID !== "undefined") {AC.Cache.Auto[f].ID = clearInterval(AC.Cache.Auto[f].ID)} else {AC.Cache.Auto[f].ID = undefined}
	if (AC.Config.Current.Auto[f].interval != 0) {AC.Cache.Auto[f].ID = setInterval(AC.Auto[f], AC.Config.Current.Auto[f].interval)}
}

/*******************************************************************************
* AC.Auto
*
* Functions that are called by AC.setAuto() to automatically perform game actions
*
* For each AC.Auto.f, the following data is generated
*	AC.Cache.Auto.f   	{dict}	Generated by AC.init(), stores any local information required by f between calls
*	AC.Cache.Auto.f.ID	{num} 	Generated by AC.setAuto(), stores the ID used by clearInterval() to stop the function from being called
*
* For each AC.Auto.f, unique settings should be stored in the following places as a dictionary
*	AC.Config.Default.Auto.f	{dict}	The default settings
*	AC.Config.Current.Auto.f	{dict}	The current settings
*
* For each AC.Auto.f, the following data is expected
*	AC.Config.Default.Auto.f.interval	{num}	The default interval (in ms) at which to call f. If == 0, f is not called by default
*	AC.Config.Current.Auto.f.interval	{num}	The current interval (in ms) at which to call f. If == 0, f is not called
*******************************************************************************/
/*
* This function clicks the cookie
*/
AC.Auto.clickCookie = function() {Game.ClickCookie()}

/*
* This function buys Elder Pledges
* @setting	{bool}	checkHalloween	If true, will check if the current season is Halloween. If it is then it will only pledge if all Halloween cookies have been obtained
* @setting	{bool}	slowInterval	If true, this function will change its own interval to match how long the Elder Pledge will last. This will not change the interval in the settings
*/
AC.Auto.elderPledge = function() {
	if (!AC.Config.Current.Auto.elderPledge.checkHalloween || !(Game.season === "halloween") || (Game.GetHowManyHalloweenDrops() === Game.halloweenDrops.length)) {
		if (Game.HasUnlocked("Elder Pledge") && Game.Upgrades["Elder Pledge"].canBuy() && Game.elderWrath != 0) {
			Game.Upgrades["Elder Pledge"].buy(true);	// Buy Elder Pledge
			if (AC.Config.Current.Auto.elderPledge.slowInterval = true) {
				// reset this function's interval to buy the next time Elder Pledge is bought
				AC.Cache.Auto.elderPledge.ID = clearInterval(AC.Cache.Auto.elderPledge.ID);
				AC.Cache.Auto.elderPledge.ID = setInterval(AC.Auto.elderPledge, Game.pledgeT/Game.fps*1000+1000);
			}
		}
	}
}

/*******************************************************************************
* AC.Cache
*
* Data that is generated during runtime
*******************************************************************************/
AC.Cache.running = false;	// Whether or not Auto Cookie is running

/*******************************************************************************
* AC.Config
*
* Functions and dictionaries that store the confriguration of this mod
*******************************************************************************/
AC.Config.Default = {	// The default configiguration
	"Auto": {
		"clickCookie": {"interval": 0},
		"elderPledge": {"interval": 0, "checkHalloween": true, "slowInterval": true}
	}
}

AC.Config.Current = AC.Config.Default;	// The current configuration, initialized to the default configuration

/*******************************************************************************
* AC.Data
*
* Data that is created before runtime
*******************************************************************************/

/*******************************************************************************
* Register the mod with Cookie Clicker
*******************************************************************************/
Game.registerMod("AutoCookieBeta", AC);
