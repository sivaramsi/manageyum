'use strict';
var electron = require('electron'),
    ipcRenderer = electron['ipcRenderer'],
    webFrame = electron['webFrame'],
    _browser_zoomLevel = 0,
    _browser_maxZoom = 9,
    _browser_minZoom = -8;
ipcRenderer['on']('zoomIn', function() {
    _browser_maxZoom > _browser_zoomLevel && (_browser_zoomLevel += 1), webFrame['setZoomLevel'](_browser_zoomLevel), ipcRenderer['sendToHost']('zoom-level', {
        zoom: _browser_zoomLevel
    })
}), ipcRenderer['on']('zoomOut', function() {
    _browser_zoomLevel > _browser_minZoom && (_browser_zoomLevel -= 1), webFrame['setZoomLevel'](_browser_zoomLevel), ipcRenderer['sendToHost']('zoom-level', {
        zoom: _browser_zoomLevel
    })
}), ipcRenderer['on']('zoomReset', function() {
    _browser_zoomLevel = 0, webFrame['setZoomLevel'](_browser_zoomLevel), ipcRenderer['sendToHost']('zoom-level', {
        zoom: _browser_zoomLevel
    })
}), ipcRenderer['on']('setZoom', function(e, o) {
    _browser_zoomLevel = o, webFrame['setZoomLevel'](_browser_zoomLevel)
})
