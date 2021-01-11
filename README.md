## Auto Cookie

**Auto Cookie** is an addon for Cookie Clicker that adds automation to certain aspects of the game. I created it as part of my run through with Cookie Clicker. I wanted to unlock all achievements quickly and I was okay with a very specific kind of cheating: If I could program it myself and it didn't I only cheated in ways that (inhumanly) sped up gameplay, I could do it. So autoclickers, buyers, and sellers were fine, but just cheating the achievements in wasn't. This also means I'm saving my save files for posterity, about once per day played.

## Features

Currently Auto Cookie can automate the following tasks.

* Automatically clicking the big cookie up to 100 times per second. As well as an option to click even faster when under a buff that affects the number of cookies earned when the big cookie is clicked.
* Automatically clicking golden cookies and wrath cookies when appropriate.
* Casting Force the Hand of Fate at opportune times.
* Spam buying/selling cursors with Godzamok, Spirit of Ruin in the pantheon to break the game.

## Source

There's just one javascript file: https://elekester.github.io/AutoCookie/AutoCookie.js

## Using Auto Cookie

### Bookmarklet

Copy this code and save it as a bookmark. Paste it in the URL section. To activate, click the bookmark when the game's open.

```javascript
javascript: (function () {
    Game.LoadMod('https://elekester.github.io/AutoCookie/AutoCookie.js');
}());
```

### Userscript

If you'd rather use the addon as a script via per example Greasemonkey or Tampermonkey, you can use the following script.

```javascript
// ==UserScript==
// @name Auto Cookie
// @namespace AutoCookie
// @include http://orteil.dashnet.org/cookieclicker/
// @include https://orteil.dashnet.org/cookieclicker/
// @author Elekester
// @version 1
// @grant none
// ==/UserScript==

(function() {
    const checkReady = setInterval(function() {
        if (typeof Game.ready !== 'undefined' && Game.ready) {
            Game.LoadMod('https://elekester.github.io/AutoCookie/AutoCookie.js');
            clearInterval(checkReady);
        }
    }, 1000);
})();
```
