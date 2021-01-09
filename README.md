## Auto Cookie

**Auto Cookie** is an addon for Cookie Clicker that adds automation to certain aspects of the game.

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
