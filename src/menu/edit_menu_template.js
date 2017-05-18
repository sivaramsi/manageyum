import { app, BrowserWindow } from 'electron';

export var editMenuTemplate = {
    label: 'Edit',
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" }, {
            label: "Copy Current Page URL",
            click: function(e, l) {
                console.log('Copy current page url');
                BrowserWindow.getFocusedWindow().webContents.send('copyCurrentPageURL', { msg: 'hello from main process' });
            }
        },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
};
