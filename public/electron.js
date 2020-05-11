const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const fs = require('fs');
const fsExtra = require('fs-extra');
const { dialog } = require('electron');

const acceptedImageTypes = ['gif', 'jpeg', 'png', 'jpg'];
const acceptedDocumentTypes = ['doc', 'docx', 'odt', 'pdf', 'txt'];
const acceptedSongTypes = ['m4a', 'mp3', 'aac', 'wav', 'flac', 'alac', 'dsd'];

var currentDevice = '';

var arrayOfImageFiles = [];
var currentImageFiles = [];
var currentImageDirectory = '';

var arrayOfDocumentFiles = [];
var currentDocumentFiles = [];
var currentDocumentDirectory = '';

var arrayOfSongFiles = [];
var currentSongFiles = [];
var currentSongDirectory = '';

function getAllFiles(dirPath, type) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      //console.log(files);
      if (err) {
        reject(err);
      }
      let promiseArray = [];
      files.forEach(function(file) {
        let filePromise = new Promise((resolve, reject) => {
          fs.stat(dirPath + "/" + file, (err, stats) => {
            if (stats.isDirectory()&&file[0]!='.'&&file!="Android") {
              let promise = getAllFiles(dirPath + "/" + file, type);
              promise.then(function(result) {
                resolve();
              }, function(err) {
                console.log(err);
              });
            } else if (type==0) {
              if (acceptedImageTypes.includes(file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2))) {
                var filePath = path.join(dirPath, "/", file);
        
                var fileSize = stats['size'];
                var fileLastModified = stats['mtime'];
                //console.log(arrayOfFiles); 
                arrayOfImageFiles.push({
                  name: filePath.replace(/^.*[\\\/]/, ''),
                  path: filePath,
                  size: parseInt(fileSize),
                  lastModified: fileLastModified
                });
                //console.log(file);
              }
              resolve();
            } else if (type==1) {
              if (acceptedDocumentTypes.includes(file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2))) {
                //console.log(file);
                var filePath = path.join(dirPath, "/", file);    
                var fileSize = stats['size'];
                var fileLastModified = stats['mtime']; 
                arrayOfDocumentFiles.push({
                    name: filePath.replace(/^.*[\\\/]/, ''),
                    path: filePath,
                    size: fileSize,
                    lastModified: fileLastModified
                });
              }
              resolve();
            } else {
              if (acceptedSongTypes.includes(file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2))) {
                //console.log(file);
                var filePath = path.join(dirPath, "/", file);    
                var fileSize = stats['size'];
                var fileLastModified = stats['mtime']; 
                arrayOfSongFiles.push({
                    name: filePath.replace(/^.*[\\\/]/, ''),
                    path: filePath,
                    size: fileSize,
                    lastModified: fileLastModified
                });
              }
              resolve();
            }
          });
        })
        promiseArray.push(filePromise);
      })
      Promise.all(promiseArray)
      .then(function(results) {
        //console.log(promiseArray);
        resolve('success')
        //console.log(dirPath);
      })
      .catch(function(error) {
        console.log(error);
      });
    })
  })
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
  /*const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);*/
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

function filterFiles(dirpath, type) {
  if (type==0) {
    var temp = [];
    for (var i=0; i<arrayOfImageFiles.length; i++) {
      if (arrayOfImageFiles[i].path.includes(dirpath)) {
        temp.push(arrayOfImageFiles[i]);
      }
    }
    currentImageFiles = temp;
  } else if(type==1) {
    var temp = [];
    for (var i=0; i<arrayOfDocumentFiles.length; i++) {
      if (arrayOfDocumentFiles[i].path.includes(dirpath)) {
        temp.push(arrayOfDocumentFiles[i]);
      }
    }
    currentDocumentFiles = temp;
  } else if(type==2) {
    var temp = [];
    for (var i=0; i<arrayOfSongFiles.length; i++) {
      if (arrayOfSongFiles[i].path.includes(dirpath)) {
        temp.push(arrayOfSongFiles[i]);
      }
    }
    currentSongFiles = temp;
  }
}

function base64_encode(index, file, pageNo) {
  fs.readFile(file, (err, bitmap) => {
    if (err) {
      console.log(err);
    } else {
      const base64 = new Buffer(bitmap).toString('base64');
      //console.log(base64);
      mainWindow.webContents.send('image', {
        id: index,
        key: file,
        value: base64,
        pageNo: pageNo
      });
    }
  });
}

function getBase64(startIndex, count, pageNo) {
  let k=0;
  for (var i = startIndex;i<(startIndex+count);i++) {
    //console.log(i);
    if (i>=currentImageFiles.length) {
      break;
    } else {
      base64_encode(k++, currentImageFiles[i].path, pageNo);
    }
  }
  mainWindow.webContents.send('no-of-image-loaded', k);  
}

function filterDir(dirpath, files) {
  let temp = [];
  for (var i=0; i<files.length; i++) {
    let filePath = path.join(dirpath, "/", files[i]);
    let stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      temp.push(files[i]);
    }
  }
  return temp;
}

ipcMain.on('change-image-directory', (event, arg) => {
  let toChange = true;
  if (arg.isChild) {
    let files = filterDir(currentImageDirectory, fs.readdirSync(currentImageDirectory));
    currentImageDirectory = path.join(currentImageDirectory, "/", arg.name);
    if (files.length==1)
      toChange = false;
  } else {
    let parentDir = currentImageDirectory.substring(0, currentImageDirectory.lastIndexOf("/"));
    let files = filterDir(parentDir, fs.readdirSync(parentDir));
    currentImageDirectory = parentDir;
    if (files.length==1)
      toChange = false;
  }

  if (toChange) {
    filterFiles(currentImageDirectory, 0);
    
    if (currentImageFiles.length==0) {
      mainWindow.webContents.send('image-directory-changed', {
        isEmpty: true
      });
      let directories = filterDir(currentImageDirectory, fs.readdirSync(currentImageDirectory));
      //console.log(directories);
      mainWindow.webContents.send('current-directory', {
        currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
        parent: currentImageDirectory.replace(/^.*[\\\/]/, ''),
        childs: directories
      });
      mainWindow.webContents.send('no-of-images', currentImageFiles.length);
    } else {
      mainWindow.webContents.send('image-directory-changed', {
        isEmpty: false
      });
    }
  } else {
    if (currentImageFiles.length==0) {
      mainWindow.webContents.send('image-directory-changed', {
        isEmpty: true
      });
      let directories = filterDir(currentImageDirectory, fs.readdirSync(currentImageDirectory));
      //console.log(directories);
      mainWindow.webContents.send('current-directory', {
        currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
        parent: currentImageDirectory.replace(/^.*[\\\/]/, ''),
        childs: directories
      });
      mainWindow.webContents.send('no-of-images', currentImageFiles.length);
    } else {
      mainWindow.webContents.send('image-directory-changed', {
        isEmpty: false
      });
    }
  }
})

ipcMain.on('get-images', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arrayOfImageFiles.length==0 || files[0]!=currentDevice) {
      storage_path = `/run/user/1000/gvfs/${files[0]}`;
      if (currentDevice!='' && files[0]!=currentDevice) {
        mainWindow.webContents.send('reset');
        arg.index=0;
        arg.pageNo=1;
      }
      currentDevice=files[0];
      currentImageDirectory = storage_path;
      let promise = getAllFiles(storage_path, 0);
      promise.then(function(result) {
        currentImageFiles = arrayOfImageFiles;
        if (currentImageFiles.length>0) {
          getBase64(arg.index, 12, arg.pageNo);
        }
        let directories = filterDir(currentImageDirectory, fs.readdirSync(currentImageDirectory));
        //console.log(directories);
        mainWindow.webContents.send('current-directory', {
          currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
          parent: currentImageDirectory.replace(/^.*[\\\/]/, ''),
          childs: directories
        });
        mainWindow.webContents.send('no-of-images', currentImageFiles.length);
      }, function(err) {
        console.log(err);
      })
    }
    else {
      getBase64(arg.index, 12, arg.pageNo);
      let directories = filterDir(currentImageDirectory, fs.readdirSync(currentImageDirectory));
      mainWindow.webContents.send('current-directory', {
        currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
        parent: currentImageDirectory.replace(/^.*[\\\/]/, ''),
        childs: directories
      });
      mainWindow.webContents.send('no-of-images', currentImageFiles.length);
    }
  }
});

ipcMain.on('get-more-images', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    getBase64(arg.index, 12, arg.pageNo);
    mainWindow.webContents.send('no-of-images', currentImageFiles.length);
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
    for (var i=0; i<currentImageFiles.length; i++) {
      result.push(currentImageFiles[i].path);
    }
    mainWindow.webContents.send('array-of-images', result);
  }
})

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

ipcMain.on('image-sort-by-name', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      currentImageFiles.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    } else {
      currentImageFiles.sort((a, b) => {
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
      currentImageFiles.sort((a, b) => {
        return (a.size - b.size);
      })
    } else {
      currentImageFiles.sort((a, b) => {
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
      currentImageFiles.sort((a, b) => {
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
      currentImageFiles.sort((a, b) => {
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

ipcMain.on('change-document-directory', (event, arg) => {
  let toChange = true;
  //console.log(arg);
  if (arg.isChild) {
    let files = filterDir(currentDocumentDirectory, fs.readdirSync(currentDocumentDirectory));;
    currentDocumentDirectory = path.join(currentDocumentDirectory, "/", arg.name);
    //console.log(currentDocumentDirectory);
    if (files.length==1)
      toChange = false;
  } else {
    let parentDir = currentDocumentDirectory.substring(0, currentDocumentDirectory.lastIndexOf("/"));
    let files = filterDir(parentDir, fs.readdirSync(parentDir));;
    currentDocumentDirectory = parentDir;
    if (files.length==1)
      toChange = false;
  }

  if (toChange) {
    filterFiles(currentDocumentDirectory, 1);
    if (currentDocumentFiles.length==0) {
      mainWindow.webContents.send('document-directory-changed', {
        isEmpty: true
      });
      let directories = filterDir(currentDocumentDirectory, fs.readdirSync(currentDocumentDirectory));
      //console.log(directories);
      mainWindow.webContents.send('current-directory', {
        currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
        parent: currentDocumentDirectory.replace(/^.*[\\\/]/, ''),
        childs: directories
      });
      mainWindow.webContents.send('no-of-documents', currentDocumentFiles.length);
    } else {
      mainWindow.webContents.send('document-directory-changed', {
        isEmpty: false
      });
    }
  } else {
    if (currentDocumentFiles.length==0) {
      mainWindow.webContents.send('document-directory-changed', {
        isEmpty: true
      });
      let directories = filterDir(currentDocumentDirectory, fs.readdirSync(currentDocumentDirectory));
      //console.log(directories);
      mainWindow.webContents.send('current-directory', {
        currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
        parent: currentDocumentDirectory.replace(/^.*[\\\/]/, ''),
        childs: directories
      });
      mainWindow.webContents.send('no-of-documents', currentDocumentFiles.length);
    } else {
      mainWindow.webContents.send('document-directory-changed', {
        isEmpty: false
      });
    }
  }
})

ipcMain.on('get-documents', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arrayOfDocumentFiles.length==0 || files[0]!=currentDevice) {
      storage_path = `/run/user/1000/gvfs/${files[0]}`;
      if (currentDevice!='' && files[0]!=currentDevice) {
        mainWindow.webContents.send('reset');
        arg=0;
      }
      currentDevice=files[0];
      currentDocumentDirectory = storage_path;
      //console.log(currentDocumentDirectory);
      let promise = getAllFiles(storage_path, 1);
      promise.then(function(result) {
        currentDocumentFiles = arrayOfDocumentFiles;
        if (currentDocumentFiles.length>0) {
          initialResult = [];
          for (var i=arg; i<(arg+30); i++) {
            if (i>=currentDocumentFiles.length) {
              break;
            } else {
              initialResult.push(currentDocumentFiles[i]);
            }
          }
          mainWindow.webContents.send('documents', initialResult);        
        }
        let directories = filterDir(currentDocumentDirectory, fs.readdirSync(currentDocumentDirectory));
        //console.log(directories);
        mainWindow.webContents.send('current-directory', {
          currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
          parent: currentDocumentDirectory.replace(/^.*[\\\/]/, ''),
          childs: directories
        });
        mainWindow.webContents.send('no-of-documents', currentDocumentFiles.length);
      }, function(err) {
        console.log(err);
      })
    } else {
      initialResult = [];
      for (var i=arg; i<(arg+30); i++) {
        if (i>=currentDocumentFiles.length) {
          break;
        } else {
          initialResult.push(currentDocumentFiles[i]);
        }
      }
      //console.log(initialResult);
      let directories = filterDir(currentDocumentDirectory, fs.readdirSync(currentDocumentDirectory));
      mainWindow.webContents.send('documents', initialResult);
      mainWindow.webContents.send('current-directory', {
        currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
        parent: currentDocumentDirectory.replace(/^.*[\\\/]/, ''),
        childs: directories
      });
      mainWindow.webContents.send('no-of-documents', currentDocumentFiles.length);
    }
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
      if (i>=currentDocumentFiles.length) {
        break;
      } else {
        result.push(currentDocumentFiles[i]);
      }
    }
    mainWindow.webContents.send('more-documents', result);
    mainWindow.webContents.send('no-of-documents', currentDocumentFiles.length);
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
    for (var i=0; i<currentDocumentFiles.length; i++) {
      result.push(currentDocumentFiles[i].path);
    }
    mainWindow.webContents.send('array-of-documents', result);
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
      currentDocumentFiles.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    } else {
      currentDocumentFiles.sort((a, b) => {
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
      currentDocumentFiles.sort((a, b) => {
        return (a.size - b.size);
      })
    } else {
      currentDocumentFiles.sort((a, b) => {
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
      currentDocumentFiles.sort((a, b) => {
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
      currentDocumentFiles.sort((a, b) => {
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

ipcMain.on('change-song-directory', (event, arg) => {
  let toChange = true;
  //console.log(arg);
  if (arg.isChild) {
    let files = filterDir(currentSongDirectory, fs.readdirSync(currentSongDirectory));;
    currentSongDirectory = path.join(currentSongDirectory, "/", arg.name);
    //console.log(currentSongDirectory);
    if (files.length==1)
      toChange = false;
  } else {
    let parentDir = currentSongDirectory.substring(0, currentSongDirectory.lastIndexOf("/"));
    let files = filterDir(parentDir, fs.readdirSync(parentDir));;
    currentSongDirectory = parentDir;
    if (files.length==1)
      toChange = false;
  }

  if (toChange) {
    filterFiles(currentSongDirectory, 2);
    if (currentSongFiles.length==0) {
      mainWindow.webContents.send('song-directory-changed', {
        isEmpty: true
      });
      let directories = filterDir(currentSongDirectory, fs.readdirSync(currentSongDirectory));
      //console.log(directories);
      mainWindow.webContents.send('current-directory', {
        currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
        parent: currentSongDirectory.replace(/^.*[\\\/]/, ''),
        childs: directories
      });
      mainWindow.webContents.send('no-of-songs', currentSongFiles.length);
    } else {
      mainWindow.webContents.send('song-directory-changed', {
        isEmpty: false
      });
    }
  } else {
    if (currentSongFiles.length==0) {
      mainWindow.webContents.send('song-directory-changed', {
        isEmpty: true
      });
      let directories = filterDir(currentSongDirectory, fs.readdirSync(currentSongDirectory));
      //console.log(directories);
      mainWindow.webContents.send('current-directory', {
        currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
        parent: currentSongDirectory.replace(/^.*[\\\/]/, ''),
        childs: directories
      });
      mainWindow.webContents.send('no-of-songs', currentSongFiles.length);
    } else {
      mainWindow.webContents.send('song-directory-changed', {
        isEmpty: false
      });
    }
  }
})

ipcMain.on('get-songs', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arrayOfSongFiles.length==0 || files[0]!=currentDevice) {
      storage_path = `/run/user/1000/gvfs/${files[0]}`;
      if (currentDevice!='' && files[0]!=currentDevice) {
        mainWindow.webContents.send('reset');
        arg=0;
      }
      currentDevice=files[0];
      currentSongDirectory = storage_path;
      //console.log(currentSongDirectory);
      let promise = getAllFiles(storage_path, 2);
      promise.then(function(result) {
        currentSongFiles = arrayOfSongFiles;
        //console.log(currentSongFiles);
        if (currentSongFiles.length>0) {
          initialResult = [];
          for (var i=arg; i<(arg+30); i++) {
            if (i>=currentSongFiles.length) {
              break;
            } else {
              initialResult.push(currentSongFiles[i]);
            }
          }
          mainWindow.webContents.send('songs', initialResult);        
        }
        let directories = filterDir(currentSongDirectory, fs.readdirSync(currentSongDirectory));
        //console.log(directories);
        mainWindow.webContents.send('current-directory', {
          currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
          parent: currentSongDirectory.replace(/^.*[\\\/]/, ''),
          childs: directories
        });
        mainWindow.webContents.send('no-of-songs', currentSongFiles.length);
      }, function(err) {
        console.log(err);
      })
    } else {
      initialResult = [];
      for (var i=arg; i<(arg+30); i++) {
        if (i>=currentSongFiles.length) {
          break;
        } else {
          initialResult.push(currentSongFiles[i]);
        }
      }
      //console.log(initialResult);
      let directories = filterDir(currentSongDirectory, fs.readdirSync(currentSongDirectory));
      mainWindow.webContents.send('songs', initialResult);
      mainWindow.webContents.send('current-directory', {
        currentDevice: currentDevice.replace(/^.*[\\\/]/, ''),
        parent: currentSongDirectory.replace(/^.*[\\\/]/, ''),
        childs: directories
      });
      mainWindow.webContents.send('no-of-songs', currentSongFiles.length);
    }
  }
});

ipcMain.on('get-more-songs', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    result = [];
    for (var i=arg; i<(arg+30); i++) {
      if (i>=currentSongFiles.length) {
        break;
      } else {
        result.push(currentSongFiles[i]);
      }
    }
    mainWindow.webContents.send('more-songs', result);
    mainWindow.webContents.send('no-of-songs', currentSongFiles.length);
    delete result;
  }
})

ipcMain.on('get-array-of-songs', (event) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    let result = [];
    for (var i=0; i<currentSongFiles.length; i++) {
      result.push(currentSongFiles[i].path);
    }
    mainWindow.webContents.send('array-of-songs', result);
  }
})


function copySongFile(song, i, arg) {
  return new Promise((resolve, reject) => {
    const fileName = song.replace(/^.*[\\\/]/, '');
    const downloadPath = path.join(arg, '/', fileName);
    try {
      var file = fs.readFileSync(downloadPath);
      if (file) {
        mainWindow.webContents.send('song-file-exist', song);
        ipcMain.once('song-overwrite', (event, arg) => {
          if (arg) {
            fsExtra.copy(song, downloadPath, { overwrite: true })
            .then(() => {
              mainWindow.webContents.send('song-downloaded-file-id', i+1);
              //console.log(i);
              resolve();
            })
            .catch(err => {
              reject(err);
            })
          } else {
            mainWindow.webContents.send('song-downloaded-file-id', i+1);
            //console.log(i);
            resolve();
          }
        })
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        fsExtra.copy(song, downloadPath)
        .then(() => {
          mainWindow.webContents.send('song-downloaded-file-id', i+1);
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

ipcMain.on('song-download', async (event, arg) => {
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
      await copySongFile(arg[i], i, downloadPath.filePaths[0]);
    }
  }
})

ipcMain.on('song-sort-by-name', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      currentSongFiles.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    } else {
      currentSongFiles.sort((a, b) => {
        return b.name.localeCompare(a.name);
      })
    }

    mainWindow.webContents.send('song-sorted');
  }
})

ipcMain.on('song-sort-by-size', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      currentSongFiles.sort((a, b) => {
        return (a.size - b.size);
      })
    } else {
      currentSongFiles.sort((a, b) => {
        return (b.size - a.size);
      })
    }

    mainWindow.webContents.send('song-sorted');
  }
})

ipcMain.on('song-sort-by-last-modified', (event, arg) => {
  let files = fs.readdirSync(`/run/user/1000/gvfs`);
  if (files.length==0) {
    mainWindow.webContents.send('device-not-connected');
  } else if (files[0]!=currentDevice) {
    mainWindow.webContents.send('device-not-connected');
  } else {
    if (arg) {
      currentSongFiles.sort((a, b) => {
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
      currentSongFiles.sort((a, b) => {
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

    mainWindow.webContents.send('song-sorted');
  }
})

