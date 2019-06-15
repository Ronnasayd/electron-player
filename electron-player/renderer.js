// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron')

const dragDrop = require('drag-drop')
dragDrop('body', (files) => {
    console.log(files)

    ipcRenderer.send('files', files)
    // location.href = "player.html"
})