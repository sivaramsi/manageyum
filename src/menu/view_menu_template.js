import { app, BrowserWindow } from 'electron';

export var viewMenuTemplate = {
    label: 'View',
    submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(e, l) {
            console.log('reload current window');
            BrowserWindow.getFocusedWindow().webContents.send('reloadCurrentWebview', { msg: 'hello from main process' });
        }
    },{
        label: 'Hide',
        accelerator: 'Cmd+H',
        click: function(e, l) {
              app.hide()
        }
    }, {
        label: 'Reload Manageyum',
        accelerator: 'CmdOrCtrl+Shift+R',
        click: function(e, l) {
            // l && app['reload']()
            BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
        }
    }, {
        label: 'Next Tab',
        accelerator: 'Ctrl+Tab',
        click: function(e, l) {
            BrowserWindow.getFocusedWindow().webContents.send('switchTabsForward', { msg: 'hello from main process' });
        }
    }, {
        label: 'Previous Tab',
        accelerator: 'Ctrl+Shift+Tab',
        click: function(e, l) {
            BrowserWindow.getFocusedWindow().webContents.send('switchTabsBackward', { msg: 'hello from main process' });
        }
    }, {
        label: 'Forward History',
        accelerator: 'CmdOrCtrl+[',
        click: function(e, l) {
            BrowserWindow.getFocusedWindow().webContents.send('forwardHistory', { msg: 'hello from main process' });
        }
    }, {
        label: 'Backward History',
        accelerator: 'CmdOrCtrl+]',
        click: function(e, l) {
            BrowserWindow.getFocusedWindow().webContents.send('backwardHistory', { msg: 'hello from main process' });
        }
    }, {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        click: function(e, l) {
            BrowserWindow.getFocusedWindow().webContents.send('zoomIn', { msg: 'hello from main process' });
        }
    }, {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: function(e, l) {
            BrowserWindow.getFocusedWindow().webContents.send('zoomOut', { msg: 'hello from main process' });
        }
    }, {
        label: 'Zoom Reset',
        accelerator: 'CmdOrCtrl+0',
        click: function(e, l) {
            BrowserWindow.getFocusedWindow().webContents.send('zoomReset', { msg: 'hello from main process' });
        }
    }, {
        label: 'Toggle Fullscreen',
        accelerator: function() {
            return 'darwin' == process['platform'] ? 'Ctrl+Command+F' : 'F11'
        }(),
        click: function(e, l) {
            l && l['setFullScreen'](!l['isFullScreen']())
        }
    }]
};
