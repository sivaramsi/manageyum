require('./utils/spellcheck.js');
require('./utils/zoom.js');

const { ipcRenderer } = require('electron');
function getMessages() {
    var e = 0,
        r = document['querySelector']('.dashboard-top-panel .indicators .stats-group .cell-value');
    r && (e = r['innerHTML']), ipcRenderer['sendToHost']('message-zendesk', {
        count: e
    })
}

zendesk = {
    init: function() {
        setInterval(getMessages, 1000);
        console.log("zendesk preloader initialized");
    }
}
