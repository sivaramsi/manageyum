import { app, BrowserWindow, ipcRenderer, remote, autoUpdater, shell, dialog } from 'electron';

export var helpMenuTemplate = {
    label: 'Help',
    role: 'help',
    submenu: [{
        label: 'About - manageyum',
        click: function(e, l) {
            dialog['showMessageBox'](l, {
                type: 'info',
                title: 'Manageyum',
                message: 'Manageyum',
                detail: 'Manageyum\x0AVersion:2.0.1 ',
                defaultId: 0,
                cancelId: 0,
                buttons: ['Ok']
            })
        }
    }, {
        type: 'separator'
    }, {
        label: 'Terms of service',
        click: function() {
            shell.openExternal('http://www.manageyum.com/terms.html');
        }
    }, {
        type: 'separator'
    }, {
        label: 'Support',
        click: function() {
            shell.openExternal('http://docs.manageyum.com');
        }
    }]
};
