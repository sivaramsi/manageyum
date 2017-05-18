// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import {
    app,
    Menu,
    dialog,
    Tray,
    BrowserWindow,
    shell,
    autoUpdater
} from 'electron';

var force_quit = false;


import {
    devMenuTemplate
} from './menu/dev_menu_template';
import {
    editMenuTemplate
} from './menu/edit_menu_template';
import {
    windowMenuTemplate
} from './menu/window_menu_template';
import {
    viewMenuTemplate
} from './menu/view_menu_template';

//import { fileMenuTemplate } from './menu/file_menu_template';

import {
    helpMenuTemplate
} from './menu/help_menu_template';

import createWindow from './helpers/window';


// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var mainWindow;


const path = require('path');



//var app = require('app');
var os = require('os');




var platform = os.platform() + '_' + os.arch();
var version = app.getVersion(); //app.getVersion();
var feedURL = '';
// console.log('appversion',app.getVersion());

if (env.name == 'production') {
    feedURL = process.platform === 'darwin' ?
        'https://updates.manageyum.com/update/osx/' + version :
        'https://updates.manageyum.com/update/win32/' + version;
    autoUpdater.setFeedURL(feedURL);
}

autoUpdater.on('update-available', () => {
    console.log('update available');
    // dialog.showErrorBox('my dialog', 'update available event triggered');
    var options = {
        type: 'info',
        title: 'Yay ! an update available feedURL' + feedURL,
        message: 'An update available for manageyum, We have intiated its download in background'
    };
    var my_window = BrowserWindow.getFocusedWindow();
    dialog.showMessageBox(my_window, options);
});


autoUpdater.on('update-not-available', () => {
    console.log('update not available');
    //dialog.showErrorBox('my dialog', 'update not available event triggered');
    var options = {
        type: 'info',
        title: 'No update available feedURL' + feedURL,
        message: 'No update available, Your software is upto date:)'
    };
    var my_window = BrowserWindow.getFocusedWindow();
    dialog.showMessageBox(my_window, options);
})



autoUpdater.on('update-downloaded', () => {
    console.log('update downloaded');
    var options = {
        type: 'info',
        title: 'Update downloaded',
        message: 'A new update has been downloaded',
        buttons: ['Install and Restart the app', 'Cancel']
    };
    var my_window = BrowserWindow.getFocusedWindow();
    dialog.showMessageBox(my_window, options, function(index) {
        if (index == 0) {
            autoUpdater.quitAndInstall()
        }
    });
})





const iconPath = path.join(__dirname, '/images/manageyum.png');
var appIcon = null;


var setApplicationMenu = function() {
    var fileMenuTemplate = {
        label: 'File',
        submenu: [{
            label: 'Check for updates',
            click: function() {
                if (process.platform == 'darwin' || process.platform == 'win32') {
                    autoUpdater.checkForUpdates();
                    var options = {
                        type: 'info',
                        title: 'checking for updates',
                        message: 'Hold on tight! we are checking for updates'
                    };
                    var my_window = BrowserWindow.getFocusedWindow();
                    dialog.showMessageBox(my_window, options);
                    return;
                }
                shell.openExternal('http://manageyum.com/updates.php?version=' + version);
            }
        }, {
            type: 'separator'
        }, {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click: function() {
                force_quit = true;
                app.quit();
            }
        }]
    };

    var menus = [fileMenuTemplate, editMenuTemplate, windowMenuTemplate, viewMenuTemplate, helpMenuTemplate];
    // if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    // }

    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));

    if (process.platform != 'darwin') {
        appIcon = new Tray(iconPath);
        var contextMenu = Menu.buildFromTemplate([{
            label: 'Show Manageyum',
            click: function() {

                var win = BrowserWindow.getAllWindows();
                win = win[0];
                console.log('window' + win);

                if (win) {
                    win.show();
                    win.focus();
                }
            }
        }, {
            label: 'Quit Manageyum',
            click: function() {
                force_quit = true;
                app.quit();
            }
        }]);
        appIcon.setToolTip('Manageyum');
        appIcon.setContextMenu(contextMenu);

        appIcon.on('click', function(e) {
            var win = BrowserWindow.getAllWindows();
            win = win[0];
            console.log('window' + win);
            if (win) {
                win.show();
                win.focus();
            }
        })
    }


};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

var mainWindow;



app.on('ready', function() {
    setApplicationMenu();

    const iconPath = path.join(__dirname, '/images/512x512.png');

    mainWindow = createWindow('main', {
        width: 1000,
        height: 600,
        icon: iconPath
    });

    mainWindow.loadURL('file://' + __dirname + '/app.html');

    if (env.name === 'development') {
        mainWindow.openDevTools();
    }



    mainWindow.on('close', function(e) {
        if (!force_quit) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('focus', function(e) {
        console.log('mainWindow focused');
        if (mainWindow.webContents) {
            mainWindow.webContents.send('focusCurrentWebview', {
                msg: 'hello from main process'
            })
        }
        // BrowserWindow.getFocusedWindow().webContents.;
    });




    // You can use 'before-quit' instead of (or with) the close event
    app.on('before-quit', function(e) {
        // Handle menu-item or keyboard shortcut quit here
        console.log('before-quit called');
        // if (!force_quit) {
        //     e.preventDefault();
        //     mainWindow.hide();
        // }
        force_quit = true;
    });

    mainWindow.webContents.on('new-window', function(e, url) {
        e.preventDefault();
        shell.openExternal(url);
    });

    // Remove mainWindow.on('closed'), as it is redundant

    app.on('activate', function() {
        console.log("app activate called");
        mainWindow.show();
    });


});


app.on('will-quit', function() {
    // This is a good place to add tests insuring the app is still
    // responsive and all windows are closed.
    console.log("will-quit");
    mainWindow = null;
});
