import { app, BrowserWindow, Menu, MenuItem, ipcMain } from "electron";
import { performance } from "perf_hooks";
import * as path from "path";
import * as cluster from "cluster";

let mainWindow: Electron.BrowserWindow;
let mainMenu: Electron.Menu;

if ( cluster.isMaster ) {
	let worker = cluster.fork();
	function createMenu() {
		mainMenu = new Menu();
	
		mainMenu.items = [
			new MenuItem({ visible: true, label: "FirstMenu" }),
		];
	
		Menu.setApplicationMenu( mainMenu );
	}
	
	function createWindow() {
		// Create the browser window.
		mainWindow = new BrowserWindow({
			height: 600,
			width: 800,
			webPreferences: {
				nodeIntegrationInWorker: true
			}
		});
	
		// and load the index.html of the app.
		mainWindow.loadFile( path.join( __dirname, "../index.html" ) );
	
		// Open the DevTools.
		// mainWindow.webContents.openDevTools();

		mainWindow.webContents.send( 'message', 'Get the message :D' );
		cluster.on( 'message', ( worker, message, handle ) => {
			console.log( message );
		});
		worker.send( 'Magical Message' );
		worker.send( {value:'Message as object'});
	
		
		ipcMain.on( 'ping', ping => {
			return;
			let start = performance.now();
			setInterval( () => {
				mainWindow.webContents.send( 'ping', performance.now() - start );
			}, 10000 );
		});

		// Emitted when the window is closed.
		mainWindow.on("closed", () => {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			mainWindow = null;
		});
	}
	
	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on("ready", createWindow);
	
	// Quit when all windows are closed.
	app.on("window-all-closed", () => {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== "darwin") {
			app.quit();
		}
		app.quit();
		worker.kill();
	});
	
	app.on("activate", () => {
		// On OS X it"s common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (mainWindow === null) {
			createWindow();
		}
		if ( mainMenu === null ) {
			createMenu();
		}
	});
	
	// In this file you can include the rest of your app"s specific main process
	// code. You can also put them in separate files and require them here.
} else if ( cluster.isWorker ) {
	process.on( 'message', message => {
		console.log( message );
		process.send( `${process.pid} => ${message}` );
	});
}