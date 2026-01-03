const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const packageJson = require('./package.json')

// 로그 설정
log.transports.file.level = 'info'
autoUpdater.logger = log

// package.json에서 GitHub 정보 읽어오기
if (packageJson.build && packageJson.build.publish) {
  const { owner, repo } = packageJson.build.publish
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: owner,
    repo: repo
  })
}

// 개발 환경에서는 업데이트 체크 비활성화
if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
}

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    // 창 크기
    width: 1000,                  // 가로
    height: 800,                  // 세로
    minWidth: 900,                // 최소 가로
    minHeight: 700,               // 최소 세로
    
    // 웹 설정
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    
    // 아이콘
    icon: path.join(__dirname, 'assets/icon.png')
  })

  // 메뉴바 숨기기
  Menu.setApplicationMenu(null)
  
  // 개발자 도구 열기
  // mainWindow.webContents.openDevTools()

  mainWindow.loadFile('index.html')
  
  // 업데이트 체크 (앱 시작 후 3초 뒤)
  if (!process.argv.includes('--dev')) {
    setTimeout(() => {
      checkForUpdates()
    }, 3000)
  }
}

// IPC 통신으로 링크 열기 처리
ipcMain.on('open-external-link', (event, url) => {
  shell.openExternal(url)
})

ipcMain.on('open-docs-window', (event, url) => {
  const docsWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  
  docsWindow.loadURL(url)
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// 업데이트 체크 함수
function checkForUpdates() {
  autoUpdater.checkForUpdates()
}

// 업데이트 이벤트 핸들러
autoUpdater.on('checking-for-update', () => {
  log.info('업데이트 확인 중...')
  sendStatusToWindow('checking-for-update')
})

autoUpdater.on('update-available', (info) => {
  log.info('업데이트 발견:', info.version)
  sendStatusToWindow('update-available', info)
})

autoUpdater.on('update-not-available', (info) => {
  log.info('최신 버전입니다')
  sendStatusToWindow('update-not-available', info)
})

autoUpdater.on('error', (err) => {
  log.error('업데이트 중 오류 발생:', err)
  sendStatusToWindow('error', err.toString())
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "다운로드 속도: " + progressObj.bytesPerSecond
  log_message = log_message + ' - 다운로드 ' + progressObj.percent + '%'
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
  log.info(log_message)
  sendStatusToWindow('download-progress', progressObj)
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('업데이트 다운로드 완료')
  sendStatusToWindow('update-downloaded', info)
})

// 렌더러에 업데이트 상태 전송
function sendStatusToWindow(status, data) {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status, data })
  }
}

// IPC 채널 - 수동 업데이트 체크
ipcMain.on('check-for-updates', () => {
  checkForUpdates()
})

// IPC 채널 - 업데이트 설치 및 재시작
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})