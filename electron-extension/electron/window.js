const { BrowserWindow, app } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const url = require('url');

exports.createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 500,
        minWidth: 500,
        icon: path.join(__dirname, '../', '/logos/Vehicle_GoGo_128.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, '../', '/preload.js'),
        },
    });

    mainWindow.on('close', function (event) {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }

        return false;
    })

    mainWindow.loadURL(
        isDev ? 'http://localhost:3000' :
            url.format({
                pathname: path.join(__dirname, '/../../build/index.html'),
                protocol: 'file:',
                slashes: true,
            })
    );

     if(isDev) mainWindow.webContents.openDevTools();
     
    return mainWindow
}
