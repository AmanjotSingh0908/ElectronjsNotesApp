let { app , BrowserWindow, ipcMain } = require('electron')
let Datastore = require('nedb')

let win;
let datastore;

function createWindow(){
    win = new BrowserWindow({
        widht: 800,
        height: 600,
        webPreferences : {
            nodeIntegration : true,
            contextIsolation: false,
        },
        autoHideMenuBar : true
    })

    win.loadFile(__dirname + '/renderer/index.html')

    win.addListener('ready-to-show', ()=> {
        win.show()
    })
}

function initDatastore() {

    let path = app.getPath('userData')
    
    
    datastore = new Datastore({
        filename : path + '/notes.json'
    })

    datastore.loadDatabase((err) => {
        if(err) {
            window.alert("Something went wrong. Please try again")
            throw err;
        } else {
            console.log("Datastore loaded successfully")
        }
    })
}

app.whenReady().then(() => {
    initDatastore();
    createWindow()
})

app.addListener('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        app.quit()
    }
})

//ipc calls
ipcMain.on('save_note' , (e , note) => {
    datastore.insert(note, (err, new_doc) => {
        console.log(new_doc);
        if(err) {
            console.log("There was some error in inserting the data")
            throw err
        } else {
            console.log("Data inserted successfully.")
        }
    });
});

ipcMain.handle("get_data" , (e) => {
    return new Promise((resolve , reject) => {
        datastore.find({}, (err, docs) => {
            if(err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
});