import { app, BrowserWindow } from 'electron';

export var windowMenuTemplate = {
    label: 'Window',
    submenu: [{
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    }, {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
    }]
};
