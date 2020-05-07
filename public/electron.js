const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const fs = require('fs');
const fsExtra = require('fs-extra');
const {dialog} = require('electron'); 

const acceptedImageTypes = ['gif', 'jpeg', 'png', 'jpg'];
const acceptedDocumentTypes = ['doc', 'docx', 'odt', 'pdf', 'txt'];

var currentDevice = '';
var arrayOfImageFiles = [];
var arrayOfDocumentFiles = [];
var key = 0;

const base64_encode = function(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}

const getAllFiles = function(dirPath, arrayOfFiles, forImage) {
  files = fs.readdirSync(dirPath)
 
  arrayOfFiles = arrayOfFiles || {}
 
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()&&file[0]!='.'&&file!="Android"&&file!="Telegram") {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles, forImage);
      //console.log(file);
    } else if (forImage) {
      if (acceptedImageTypes.includes(file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2))) {
        var filePath = path.join(dirPath, "/", file);

        var stats = fs.statSync(filePath);

        var fileSize = stats['size'];
        var fileLastModified = stats['mtime']; 
        arrayOfFiles.push({
          key: key++,
          name: filePath.replace(/^.*[\\\/]/, ''),
          path: filePath,
          size: parseInt(fileSize),
          lastModified: fileLastModified
        });
        //console.log(file);
      }
    } else {
      if (acceptedDocumentTypes.includes(file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2))) {
        var filePath = path.join(dirPath, "/", file);

        var stats = fs.statSync(filePath);

        var fileSize = stats['size'];
        var fileLastModified = stats['mtime']; 
        arrayOfFiles.push({
           name: filePath.replace(/^.*[\\\/]/, ''),
           path: filePath,
           size: fileSize,
           lastModified: fileLastModified
        });
      }
    }
  })
 
  return arrayOfFiles
}

let mainWindow;

function createWindow(settings, url, page_path) {
  newWindow = new BrowserWindow(settings);
  newWindow.loadURL(isDev ? url : page_path);
  newWindow.on('closed', () => newWindow = null);

  return newWindow;
}

app.on('ready', () => {
    mainWindow = createWindow({
        width: 900,
        height: 680,
        webPreferences: {
            nodeIntegration: true,
            blinkFeatures: 'CSSStickyPosition'
        }
    }, "http://localhost:3000", `file://${path.join(__dirname, "../build/index.html#")}`);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function copyImageFile(image, i, arg) {
  return new Promise((resolve, reject) => {
    const fileName = image.replace(/^.*[\\\/]/, '');
    const downloadPath = path.join(arg, '/', fileName);
    try {
      var file = fs.readFileSync(downloadPath);
      if (file) {
        mainWindow.webContents.send('image-file-exist', image);
        ipcMain.once('image-overwrite', (event, arg) => {
          if (arg) {
            fsExtra.copy(image, downloadPath, { overwrite: true })
            .then(() => {
              mainWindow.webContents.send('image-downloaded-file-id', i+1);
              //console.log(i);
              resolve();
            })
            .catch(err => {
              reject(err);
            })
          } else {
            mainWindow.webContents.send('image-downloaded-file-id', i+1);
            //console.log(i);
            resolve();
          }
        })
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        fsExtra.copy(image, downloadPath)
        .then(() => {
          mainWindow.webContents.send('image-downloaded-file-id', i+1);
          //console.log(i);
          resolve();
        })
        .catch(err => {
          reject(err);
        })
      } else {
        reject(err);
      }
    }
  })
}

function openDialog(parentWindow, options, callback) {
  return new Promise((resolve, reject) => {
    let result = dialog.showOpenDialog(parentWindow, options, callback);
    resolve(result);  
  });
}

ipcMain.on('image-download', async (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    let downloadPath = await openDialog(mainWindow, {
      title: "Download Destination",
      properties: ["openDirectory"]
    }, () => {});
    //console.log(arg);
    for (let i=0; i<arg.length; i++) {
      await copyImageFile(arg[i], i, downloadPath.filePaths[0]);
    }
  }
})

function getBase64(startIndex, count) {
  
    var result = [];
    for (var i = startIndex;i<(startIndex+count);i++) {
      if (i>=arrayOfImageFiles.length) {
        break;
      } else {
        const data =base64_encode(arrayOfImageFiles[i].path);
        result.push({
          key: arrayOfImageFiles[i].path,
          value: data
        });
      }
      //console.log(i);
    }
    return (result);
  
}

ipcMain.on('image-sort-by-name', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      arrayOfImageFiles.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    } else {
      arrayOfImageFiles.sort((a, b) => {
        return b.name.localeCompare(a.name);
      })
    }

    mainWindow.webContents.send('image-sorted');
  }
})

ipcMain.on('image-sort-by-size', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      arrayOfImageFiles.sort((a, b) => {
        return (a.size - b.size);
      })
    } else {
      arrayOfImageFiles.sort((a, b) => {
        return (b.size - a.size);
      })
    }

    mainWindow.webContents.send('image-sorted');
  }
})

ipcMain.on('image-sort-by-last-modified', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      arrayOfImageFiles.sort((a, b) => {
        var aDate = new Date(a.lastModified);
        var bDate = new Date(b.lastModified);

        if (aDate < bDate)
          return -1;
        else if (aDate > bDate)
          return 1;
        else 
          return 0;
      })
    } else {
      arrayOfImageFiles.sort((a, b) => {
        var aDate = new Date(a.lastModified);
        var bDate = new Date(b.lastModified);

        if (aDate < bDate)
          return 1;
        else if (aDate > bDate)
          return -1;
        else 
          return 0;
      })
    }

    mainWindow.webContents.send('image-sorted');
  }
})

ipcMain.on('get-images', async (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arrayOfImageFiles.length==0 || files[0]!=currentDevice) {
      storage_path = `/run/user/1000/gvfs`;
      if (currentDevice!='' && files[0]!=currentDevice) {
        mainWindow.webContents.send('reset');
        arg=0;
      }
      currentDevice=files[0];
      arrayOfImageFiles = getAllFiles(storage_path, [], true);
    }
    initialResult = getBase64(arg, 12);
    mainWindow.webContents.send('images', initialResult);
    mainWindow.webContents.send('no-of-images', arrayOfImageFiles.length);
  
    delete initialResult;
  }
});

ipcMain.on('get-more-images', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    result =  getBase64(arg, 12);
    mainWindow.webContents.send('more-images', result);
    delete result;
  }
})

ipcMain.on('get-array-of-images', (event) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    let result = [];
    for (var i=0; i<arrayOfImageFiles.length; i++) {
      result.push(arrayOfImageFiles[i].path);
    }
    mainWindow.webContents.send('array-of-images', result);
  }
})

function copyDocumentFile(document, i, arg) {
  return new Promise((resolve, reject) => {
    const fileName = document.replace(/^.*[\\\/]/, '');
    const downloadPath = path.join(arg, '/', fileName);
    try {
      var file = fs.readFileSync(downloadPath);
      if (file) {
        mainWindow.webContents.send('document-file-exist', document);
        ipcMain.once('document-overwrite', (event, arg) => {
          if (arg) {
            fsExtra.copy(document, downloadPath, { overwrite: true })
            .then(() => {
              mainWindow.webContents.send('document-downloaded-file-id', i+1);
              //console.log(i);
              resolve();
            })
            .catch(err => {
              reject(err);
            })
          } else {
            mainWindow.webContents.send('document-downloaded-file-id', i+1);
            //console.log(i);
            resolve();
          }
        })
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        fsExtra.copy(document, downloadPath)
        .then(() => {
          mainWindow.webContents.send('document-downloaded-file-id', i+1);
          //console.log(i);
          resolve();
        })
        .catch(err => {
          reject(err);
        })
      } else {
        reject(err);
      }
    }
  })
}

ipcMain.on('document-download', async (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    let downloadPath = await openDialog(mainWindow, {
      title: "Download Destination",
      properties: ["openDirectory"]
    }, () => {});
    //console.log(arg);
    for (let i=0; i<arg.length; i++) {
      await copyDocumentFile(arg[i], i, downloadPath.filePaths[0]);
    }
  }
})

ipcMain.on('document-sort-by-name', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      arrayOfDocumentFiles.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    } else {
      arrayOfDocumentFiles.sort((a, b) => {
        return b.name.localeCompare(a.name);
      })
    }

    mainWindow.webContents.send('document-sorted');
  }
})

ipcMain.on('document-sort-by-size', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      arrayOfDocumentFiles.sort((a, b) => {
        return (a.size - b.size);
      })
    } else {
      arrayOfDocumentFiles.sort((a, b) => {
        return (b.size - a.size);
      })
    }

    mainWindow.webContents.send('document-sorted');
  }
})

ipcMain.on('document-sort-by-last-modified', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      arrayOfDocumentFiles.sort((a, b) => {
        var aDate = new Date(a.lastModified);
        var bDate = new Date(b.lastModified);

        if (aDate < bDate)
          return -1;
        else if (aDate > bDate)
          return 1;
        else 
          return 0;
      })
    } else {
      arrayOfDocumentFiles.sort((a, b) => {
        var aDate = new Date(a.lastModified);
        var bDate = new Date(b.lastModified);

        if (aDate < bDate)
          return 1;
        else if (aDate > bDate)
          return -1;
        else 
          return 0;
      })
    }

    mainWindow.webContents.send('document-sorted');
  }
})

ipcMain.on('get-documents', async (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arrayOfDocumentFiles.length==0 || files[0]!=currentDevice) {
      storage_path = `/run/user/1000/gvfs`;
      if (currentDevice!='' && files[0]!=currentDevice) {
        mainWindow.webContents.send('reset');
        arg=0;
      }
      currentDevice=files[0];
      arrayOfDocumentFiles = getAllFiles(storage_path, [], false);
    }
    initialResult = [];
    for (var i=arg; i<(arg+30); i++) {
      if (i>=arrayOfDocumentFiles.length) {
        break;
      } else {
        initialResult.push(arrayOfDocumentFiles[i].path);
      }
    }
    mainWindow.webContents.send('documents', initialResult);
    mainWindow.webContents.send('no-of-documents', arrayOfDocumentFiles.length);
  
    delete initialResult;
  }
});

ipcMain.on('get-more-documents', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    result = [];
    for (var i=arg; i<(arg+30); i++) {
      if (i>=arrayOfDocumentFiles.length) {
        break;
      } else {
        result.push(arrayOfDocumentFiles[i].path);
      }
    }
    mainWindow.webContents.send('more-documents', result);
    delete result;
  }
})

ipcMain.on('get-array-of-documents', (event) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    let result = [];
    for (var i=0; i<arrayOfDocumentFiles.length; i++) {
      result.push(arrayOfDocumentFiles[i].path);
    }
    mainWindow.webContents.send('array-of-documents', result);
  }
})

