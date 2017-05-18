setTimeout(()=>{
// import {SpellCheckHandler, ContextMenuListener, ContextMenuBuilder} from 'electron-spellchecker';
const SpellCheckHandler = require('electron-spellchecker').SpellCheckHandler;
const ContextMenuListener = require('electron-spellchecker').ContextMenuListener;
const ContextMenuBuilder = require('electron-spellchecker').ContextMenuBuilder;
window.spellCheckHandler = new SpellCheckHandler();
window.spellCheckHandler.attachToInput();

// Start off as US English, America #1 (lol)
window.spellCheckHandler.switchLanguage('en-US');

let contextMenuBuilder = new ContextMenuBuilder(window.spellCheckHandler);
let contextMenuListener = new ContextMenuListener((info) => {
  contextMenuBuilder.showPopupMenu(info);
});


},1000);
