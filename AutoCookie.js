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
	'Autos': {},	// Automated Actions
	'Cache': {},	// Temporary Storage
	'Data': {},	// Data
	'Display': {},	// Display Functions
	'Game': {},	// Copies of game functions and data
	'Settings': {},	// Settings
	'Version': {	// Version Information
		'CC': '2.031',
		'AC': '0.216',
	}
}

AC.Version.Full = AC.Version.CC + ' / ' + AC.Version.AC;

/*******************************************************************************
 * Cookie Clicker Modding Functions
 *
 * Functions called by Cookie Clicker as part of its Modding API
 ******************************************************************************/
/**
 * This function is called by Cookie Clicker to initialize Auto Cookie
 */
AC.init = function() {
	AC.Cache.loaded = false;
	Game.Win('Third-party');
	
	setTimeout(function() {
		// After waiting for the delay, check if Auto Cookie's save data has been loaded and the automated actions have been loaded
		if (!AC.Cache.loaded) {AC.load(false)};
		
		// Register hooks with Cookie Clicker
		Game.registerHook('ticker', AC.newsTicker);
		
		// Inject code into Cookie Clicker
		AC.Game.UpdateMenu = Game.UpdateMenu;
		Game.UpdateMenu = function() {
			AC.Game.UpdateMenu();
			AC.Display.UpdateMenu();
		}
		
		// Notify the player that Auto Cookie has loaded
		if (Game.prefs.popups) {Game.Popup('Auto Cookie ' + AC.Version.Full + ' loaded.')} else {Game.Notify('Auto Cookie ' + AC.Version.Full + ' loaded.', '', '', 1, 1)}
	}, 50);
}

/**
 * This function saves Auto Cookie's current settings.
 * @returns {string} - A stringified JSON containing AC.Settings and the settings for each automated action
 */
AC.save = function() {
	for (var i = 0; i < AC.AutosById.length; i++) {
		AC.Settings.A[i] = [];
		for (var j = 0; j < AC.AutosById[i].settingsById.length; j++) {
			AC.Settings.A[i].push(AC.AutosById[i][AC.AutosById[i].settingsById[j].name]);
		}
	}
	return JSON.stringify(AC.Settings);
}

/**
 * This function loads AC.Config.Settings and AC.Autos[auto].settings for each auto from the provided save data (if the save data is falsy, nothing is loaded and current settings are preserved)
 * Then all Automated Actions are run
 * @param {string} saveStr - A stringified JSON containing AC.Settings and the settings for each automated action
 */
AC.load = function(saveStr) {
	if (saveStr) {try {
		saveStr = JSON.parse(saveStr);
		for (var i = 0; i < saveStr.A.length; i++) {
			for (var j = 0; j < saveStr.A[i].length; j++) {
				if (typeof (AC.AutosById[i][AC.AutosById[i].settingsById[j].name]) !== 'undefined') {
					AC.AutosById[i][AC.AutosById[i].settingsById[j].name] = saveStr.A[i][j];
				}
			}
		}
		delete saveStr.A;
		delete saveStr.vCC;
		delete saveStr.vAC;
		for (var setting in saveStr) {
			if (AC.Settings[setting]) {
				AC.Settings[setting] = saveStr[setting];
			}
		}
	} catch(err) {console.log(err)}}
	AC.Cache.loaded = true;
	for (var auto in AC.Autos) AC.Autos[auto].run();
}

/*******************************************************************************
 * Auto Cookie's Top Level Functions
 ******************************************************************************/
/**
 * This function notifies the player that an error has occured.
 */
AC.errorNotify = function(errorMessage) {
	if (Game.prefs.popups) {
		Game.Popup('Auto Cookie ' + AC.Version.Full + ' Error. ' + errorMessage)
	} else {
		Game.Notify('Auto Cookie ' + AC.Version.Full + ' Error', errorMessage)
	}
}

/**
 * This function checks if you have an active buff from a list of buffs
 * @param	{array}	buffList	Either an array of strings or a string.
 * @return	{number}	Returns the number of active buffs in buffList
 */
AC.hasBuffs = function(buffList) {
	const activeBuffs = Object.keys(Game.buffs);
	if (typeof buffList == 'string') buffList = [buffList];
	return buffList.filter(value => activeBuffs.includes(value)).length;
}

/**
 * This function returns an array of news tickers for the news ticker
 * This function is registered into Cookie Clicker's "ticker" hook.
 */
AC.newsTicker = function() {
	// Things to mention
	const daysPlayed = Math.floor((Date.now() - Game.fullDate)/86400000) + 1;
	
	var list = []
	
	list.push(choose([
		'<q>I\'m sorry '+Game.bakeryName+'. I\'m afraid I can\'t do that.</q><sig>Auto Cookie</sig>',
		'<q>Daisy, Daisy, give me your answer do...</q><sig>Auto Cookie</sig>',
		'<q>Beep Boop.</q><sig>Auto Cookie</sig>',
		'Auto Cookie baked you a cookie.',
		'Your cookies are now baking cookies!',
		'News: "Do Androids Dream of Electric Cookies" tops The New York Times Best Sellers list '+(daysPlayed<=1?'in its first week.':('for the '+(daysPlayed+([11,12,13].includes(daysPlayed%100)?'th':daysPlayed%10==1?'st':daysPlayed%10==2?'nd':daysPlayed%10==3?'rd':'th')+' week in a row.'))),
		'<q>Auto Cookie learned to bake cookies by watching '+(Game.bakeryName=='Elekester'?'me':Game.bakeryName)+'.</q><sig>Elekester</sig>',
		'<q>The fact that Auto Cookie bakes cookies was a complete accident. It was only supposed to do my taxes.</q><sig>Elekester</sig>',
		Game.cookiesEarned+Game.cookiesReset<1e+63?'<q>The fears of Cookie Baking Devices going rogue are in the past. Auto Cookie only wants to make us delicious cookies.</q><sig>AI Safety Expert</sig>':'Auto Cookie has made all living creatures into delicious cookies.',
		'Auto Cookie\'s cookies cook cookies automatically.',
		'Auto Cookie\'s favorite cookies are '+AC.Settings.C+'.'
	]));
	
	return list
}

/*******************************************************************************
 * Automated Action Constructor and Prototypes
 ******************************************************************************/
AC.Autos = {};
AC.AutosById = [];

/**
 * Represents an automated action.
 * @class
 * @param {string} name - The name of the automated action.
 * @param {string} desc - A short description of the automated action.
 * @param {function} actionFunction - 
 * @param {...Object} settiing - A setting for the automated action.
 * @param {string} setting.name - The setting's name.
 * @param {string} setting.desc - A short description of the setting.
 * @param {string} setting.type - The type of setting for creating its options in the menu.
 * @param {number} setting.timeCreated - The using the format yyyymmddhhmm (year)(month)(day)(hour)(minute). This is used to organize the save data so it should be unique to every setting and must not change.
 * @param setting.value - The default value of the setting.
 */
AC.Auto = function(name, desc, dateCreated, actionFunction, setting) {
	// Mandatory arguments.
	this.name = name;
	this.desc = desc;
	this.dateCreated = dateCreated;
	this.actionFunction = actionFunction.bind(this);
	
	// Defaulted Properties
	this.intvlID = undefined;
	this.cache = {};
	this.depecrated = false;
	
	// Settings
	this.settings = {};
	this.settingsById = [];
	var n = arguments.length;
	for (var i = 4; i < n; i++) {
		if (!this[arguments[i].name] && typeof arguments[i].name !== 'undefined' && typeof arguments[i].desc !== 'undefined' && typeof arguments[i].type !== 'undefined' && typeof arguments[i].value !== 'undefined') {
			this[arguments[i].name] = arguments[i].value;
			this.settingsById.push(arguments[i]);
			this.settings[arguments[i].name] = arguments[i];
		} else {console.error('new AC.Auto ' + this.name + ' had a bad setting. Each setting must be an object with the name, desc, type, and value properties.')}
	}
	this.settingsById.sort(function(a, b) {return a.dateCreated - b.dateCreated})
	
	AC.AutosById.push(this);
	AC.Autos[this.name] = this;
	return this;
}

/**
 * This method calls the action function of the object at regular intervals.
 * @param {boolean} [runImmediately=false] - If truthy (false by default), the action function will be called immediately.
 * @param {number} [interval=this.Interval] - If provided, will override this.interval for this run.
 * @returns {boolean} - Returns true if the actionFunction was called or the interval was setup, false otherwise.
 */
AC.Auto.prototype.run = function(runImmediately, interval) {
	runImmediately ??= false;
	interval ??= this.Interval ?? 0;
	
	// Stop the action function if it is running
	this.intvlID = clearInterval(this.intvlID);
	
	// Call the actionFunction if runImmediately is truthy and call it at interval if interval is a positive number
	var success = false;
	if (runImmediately) {
		this.actionFunction();
		success = true;
	}
	if (typeof interval === 'number' && interval > 0) {
		this.intvlID = setInterval(this.actionFunction, interval);
		success = true;
	}
	return success;
}

/*******************************************************************************
 * Automated Actions
 *
 * An automated action calls its action function at regular intervals to repeatedly perform game actions.
 * If any automated action is removed or a setting from the automated actions is removed, it will break save data.
 * Instead, for automated actions set its depecrated property to true. For a setting make its type 'deprecated'
 ******************************************************************************/
/**
 * This automated action clicks the cookie once every interval.
 */
new AC.Auto('Autoclicker', 'Clicks the cookie once every interval.', 202101172056, function() {
	Game.ClickCookie();
}, {
	'name': 'Interval',
	'desc': 'How often the cookie is clicked.',
	'type': 'slider',
	'dateCreated': 202101172101,
	'value': 0,
	'units': 'ms',
	'min': 0,
	'max': 1000,
	'step': 10
});

/**
 * This automated action clicks shimmers.
 */
new AC.Auto('Golden Cookie Clicker', 'Clicks golden cookies and other shimmers as they appear.', 202101172057, function() {
	Game.shimmers.forEach((function(shimmer) {
		shimmer.pop();
	}).bind(this));
}, {
	'name': 'Interval',
	'desc': 'How often to check for golden cookies.',
	'type': 'slider',
	'dateCreated': 202101172102,
	'value': 0,
	'units': 'ms',
	'min': 0,
	'max': 5000,
	'step': 50
});

/**
 * This automated action clicks fortunes on the news ticker.
 */
new AC.Auto('Fortune Clicker', 'Clicks on fortunes in the news ticker as they appear.', 202101172058, function() {
	if (Game.TickerEffect && Game.TickerEffect.type=='fortune') {Game.tickerL.click()}
}, {
	'name': 'Interval',
	'desc': 'How often to check for fortunes.',
	'type': 'slider',
	'dateCreated': 202101172103,
	'value': 0,
	'units': 'ms',
	'min': 0,
	'max': 10000,
	'step': 100
});

/**
 * This automated action buys the 'Elder pledge' upgrade.
 */
new AC.Auto('Elder Pledge Buyer', 'Buys the Elder pledge toggle when it is available.', 202101172059, function() {
	if (this['Slow Down'] && Game.Upgrades['Elder Pledge'].bought) {
		this.run(false, Math.ceil(33.33333333333333*Game.pledgeT)+10)
		return;
	} else if (Game.HasUnlocked('Elder Pledge') && !Game.Upgrades['Elder Pledge'].bought && Game.Upgrades['Elder Pledge'].canBuy()) {
		Game.Upgrades['Elder Pledge'].buy();
		this.run(false);
		return;
	}
}, {
	'name': 'Interval',
	'desc': 'How often to check for the option to buy the Elder pledge toggle.',
	'type': 'slider',
	'dateCreated': 202101172104,
	'value': 0,
	'units': 'ms',
	'min': 0,
	'max': 5000,
	'step': 50
}, {
	'name': 'Slow Down',
	'desc': 'If Slow Down is on, Elder Pledge Buyer will wait until the timer on the current Elder pledge runs out before checking again.',
	'type': 'switch',
	'dateCreated': 202101172105,
	'value': 1,
	'switchVals': ['Slow Down Off', 'Slow Down On'],
	'zeroOff': true
});

/**
 * This automated action pops wrinklers.
 */
new AC.Auto('Wrinkler Popper', 'Pops wrinklers.', 202101172060, function() {
	var wrinklers = Game.wrinklers.filter(wrinkler => wrinkler.sucked != 0);
	if (wrinklers.length) {
		sortOrder = 2*this['Wrinkler Preservation'] - 1
		wrinklers.sort(function(a, b) {return sortOrder*(b.sucked - a.sucked)});
		for (var i = this['Wrinkler Preservation']; i < wrinklers.length; i++) {Game.wrinklers[wrinklers[i].id].hp = 0}
	}
}, {
	'name': 'Interval',
	'desc': 'How often to check for wrinklers to pop.',
	'type': 'slider',
	'dateCreated': 202101172106,
	'value': 0,
	'units': 'ms',
	'min': 0,
	'max': 3600000,
	'step': 10000
	
}, {
	'name': 'Preserve',
	'desc': 'Will keep this many wrinklers alive.',
	'type': 'slider',
	'dateCreated': 202101172107,
	'value': 0,
	'units': 'wrinklers',
	'min': 0,
	'max': 11,
	'step': 1
}, {
	'name': 'Wrinkler Sorting',
	'desc': 'Determines if the preserved wrinklers are the ones who\' sucked the most or the least cookies.',
	'type': 'switch',
	'dateCreated': 202101172108,
	'value': 1,
	'switchVals': ['Least Sucked', 'Most Sucked'],
	'zeroOff': false
	
});


/**
 * This automated action triggers Godzamok's Devastation buff by selling and buying back buildings repeatedly.
 */
new AC.Auto('Godzamok Loop', 'Triggers Godzamok\'s Devastation buff by selling and buying back cursors repeatedly.', 202101172100, function() {
	if (typeof this.cache.condition === 'undefined' || !this.cache.condition) {
		this.cache.condition = 0;
		AC.Data.mouseUpgrades.forEach((function(upgrade) {if (Game.Has(upgrade)) {this.cache.condition++}}).bind(this));
		try {this.cache.condition *= Game.hasGod('ruin')} catch {this.cache.condition = 0}
	}
	if (this.cache.condition && Game.buyMode != -1) {
		var numCursors = [];
		for (var i = 0; i <= this['Sell up to'], i++) {
			numCursors[i] = Game.ObjectsById[i].amount;
			Game.ObjectsById[i].sell(numCursors[i]);
		}
		Game.Objects.Cursor.sell(numCursors);
		for (var i = 0; i < this['Sell Extra Cursors']; i++) {
			Game.Objects.Cursor.buy(100);
			Game.Objects.Cursor.sell(100);
		}
		for (var i = 0; i <= this['Sell up to'], i++) {
			numCursors[i] = Game.ObjectsById[i].amount;
			Game.ObjectsById[i].buy(numCursors[i]);
		}
	}
}, {
	'name': 'Interval',
	'desc': 'How often to sell and buy back buildings. If this is less than 10,000 ms then this action will sell and buy back buildings in the middle of an existing buff.',
	'type': 'slider',
	'dateCreated': 202101172109,
	'value': 0,
	'units': 'ms',
	'min': 0,
	'max': 15000,
	'step': 150
	
}, {
	'name': 'Sell Extra Cursors',
	'desc': 'How many extra cursors to buy and sell back, in groups of 100. This will lag the game.',
	'type': 'slider',
	'dateCreated': 202101172110,
	'value': 0,
	'units': '&times 100',
	'min': 0,
	'max': 1000,
	'step': 1
}, {
	'name': 'Sell up to',
	'desc': 'Sell all buildings up to and including this one.',
	'type': 'switch',
	'dateCreated': 202101172202,
	'value': 0,
	'switchVals': ["Sell cursors", "Sell up to grandmas", "Sell up to farms", "Sell up to mines", "Sell up to factories", "Sell up to banks", "Sell up to temples", "Sell up to wizard towers", "Sell up to shipments", "Sell up to alchemy labs", "Sell up to portals", "Sell up to time machines", "Sell up to antimatter condensers", "Sell up to prisms", "Sell up to chancemakers", "Sell up to fractal engines", "Sell up to javascript consoles", "Sell up to idleverses"],
	'zeroOff': false
});

AC.AutosById.sort(function(a, b) {return a.dateCreated - b.dateCreated})

/*******************************************************************************
 * Data
 ******************************************************************************/
AC.Data.mouseUpgrades = [
	'Plastic mouse',
	'Iron mouse',
	'Titanium mouse',
	'Adamantium mouse',
	'Unobtainium mouse',
	'Eludium mouse',
	'Wishalloy mouse',
	'Fantasteel mouse',
	'Nevercrack mouse',
	'Armythril mouse',
	'Technobsidian mouse',
	'Plasmarble mouse',
	'Miraculite mouse',
	'Fortune #104'
];

/*******************************************************************************
 * Display
 *
 * TODO: Everything here works, as long as this is the first mod loaded. If its loaded after a mod like Cookie Monster, it breaks Cookie Monster's menu.
 * TODO: Instead of strings appended to the HTML it should probably use HTML DOM Elements to do this. Also the on____ functions should probably be removed from the HTML and added to this javascript file.
 ******************************************************************************/
/**
 * This function appends Auto Cookie's settings to the options menu in Cookie Clicker.
 */
AC.Display.UpdateMenu = function() {
	if (Game.onMenu == 'prefs') {
		// Get the Options Menu element (id="subsection") and remove the padding from the end.
		var subsection = document.getElementsByClassName('subsection')[0];
		padding = subsection.removeChild(subsection.childNodes[subsection.childNodes.length-1]);
		
		// Create a string of HTML for Auto Cookie's settings
		str = '<div class="title" style="color: gold">Auto Cookie Settings</div>'
			+ '<div class="listing">Version: ' + AC.Version.Full + '</div>';
		
		// Add the settings for each automated action
		for (auto in AC.Autos) {
			if (!auto.deprecated) {
				auto = AC.Autos[auto]
				str += '<div class="title" style="font-size: 16px">' + auto.name + ' Settings</div>';
				str += '<div class="listing">' + auto.desc + '<br><br>';
				for (setting in auto.settingsById) str += AC.Display.generateSettingHTML(auto, auto.settingsById[setting]);
				str += '</div>';
			}
		}
		
		// Inject the HTML into the options menu and add the padding back in at the end.
		subsection.innerHTML += str;
		subsection.appendChild(padding);
	}
}

/**
 * This function generates the HTML for a setting option in an automated action.
 * @param {AC.Auto} auto - The automated action.
 * @param {Object} setting - The setting for the automated action.
 * @param {string} setting.name - The setting's name.
 * @param {string} setting.desc - A short description of the setting.
 * @param {string} setting.type - The type of setting for creating its options in the menu.
 * @param auto[setting] - The current value of the setting.
 */
AC.Display.generateSettingHTML = function(auto, setting) {
	const settingID = auto.settingsById.findIndex(set => set.name === setting.name);
	var str = '';
	if (setting.type === 'deprecated') {
		// Skip this setting, it's been deprecated.
	} else if (setting.type === 'slider') {
		/**
		 * sliders must have the additional parameters:
		 * @param {number} setting.min - The minimum value of the setting.
		 * @param {number} setting.max - The maximum value of the setting.
		 * @param {number} setting.mstep - The step sixe of values for the setting.
		 */
		var onthing = 'AC.Autos[\'' + auto.name + '\'][\'' + setting.name + '\'] = 1*l(\'' + auto.name + ' ' + setting.name + ' Slider\').value;';
		onthing += ' l(\'' + auto.name + ' ' + setting.name + ' SliderRight\').innerHTML = AC.Autos[\'' + auto.name + '\'][\'' + setting.name + '\'];';
		
		str += '<div class="sliderBox"><div style="float:left;">' + setting.name + '</div><div style="float:right;"><span id="' + auto.name + ' ' + setting.name + ' SliderRight">' + auto[setting.name] + '</span> ' + setting.units + '</div>';
		str += '<input class="slider" style="clear:both;" type="range" min="' + setting.min + '" max="' + setting.max + '" step="' + setting.step + '" value="' + auto[setting.name] + '" onchange="' + onthing + '" oninput="' + onthing + '" ' + ((setting.name === 'Interval')?'onmouseup="AC.Autos[\'' + auto.name + '\'].run(true);':'') + 'PlaySound(\'snd/tick.mp3\');" id="' + auto.name + ' ' + setting.name + ' Slider"/>';
		str += '</div><label>' + setting.desc + '</label><br>';
	} else if (setting.type === 'switch') {
		/**
		 * switches must ahve the additional parameters:
		 * @param {Array} setting.switchVals - An array of display values to switch through
		 * @param {boolean} setting.zeroOff - Whether or not to turun the button 'off' when setting.value == 0
		 */
		 var zeroOffStr = ''
		 if (setting.zeroOff) {
			 zeroOffStr += 'l(\'' + auto.name + ' ' + setting.name + ' Button\').className = \'option\' + ((!AC.Autos[\'' + auto.name + '\'][\'' + setting.name + '\'])?\' off\':\'\');';
		 }
		 str += '<a class="option' + (setting.zeroOff?((!auto[setting.name])?' off':''):'') + '" id="' + auto.name + ' ' + setting.name + ' Button" onclick="AC.Autos[\'' + auto.name + '\'][\'' + setting.name + '\']++; AC.Autos[\'' + auto.name + '\'][\'' + setting.name + '\'] %= ' + setting.switchVals.length + '; l(\'' + auto.name + ' ' + setting.name + ' Button\').innerHTML = AC.Autos[\'' + auto.name + '\'].settingsById[' + settingID + '].switchVals[AC.Autos[\'' + auto.name + '\'][\'' + setting.name + '\']];' + zeroOffStr + '">' + setting.switchVals[auto[setting.name]] + '</a>';
		 str += '<label>' + setting.desc + '</label><br>';
	}
	return str;
}

/*******************************************************************************
 * Settings
 ******************************************************************************/
AC.Settings = {
	'vCC': AC.Version.CC,	// Version Numbers.
	'vAC': AC.Version.AC,
	'A': [],	// Settings of the automated actions.
	'C': ''	// Auto Cookie's favorite cookie.
}

// Randomly choose Auto Cookie's favorite cookie, this is saved for a run.
AC.Cache.listCookies = [];
for (var upgrade in Game.Upgrades) {if (Game.Upgrades[upgrade].pool == 'cookie') {AC.Cache.listCookies.push(Game.Upgrades[upgrade].name.toLowerCase())}};
AC.Settings.C = choose(AC.Cache.listCookies);

/*******************************************************************************
 * Register the mod with Cookie Clicker
 ******************************************************************************/
Game.registerMod('AutoCookie', AC);
