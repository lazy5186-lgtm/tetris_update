# TTJ Electron Basic

Electron을 사용한 기본 데스크톱 애플리케이션 템플릿입니다.

## 기능

- Electron 기반 크로스 플랫폼 데스크톱 앱
- Windows, macOS, Linux 지원
- 아이콘 자동 생성 및 패키징
- NSIS 기반 Windows 설치 프로그램

## 필수 조건

- Node.js (v14 이상)
- npm 또는 yarn

## 설치

```bash
# 저장소 클론
git clone [your-repo-url]
cd ttj_electron_basic

# 의존성 설치
npm install
```

## 개발

```bash
# Electron 앱 실행
npm start
```

## 아이콘 생성

프로젝트에는 아이콘 자동 생성 도구가 포함되어 있습니다.

```bash
# assets/icon.png 파일을 기반으로 모든 플랫폼용 아이콘 생성
npm run build-icon
```

아이콘 생성 전 준비사항:
1. `assets/icon.png` 파일을 준비합니다 (최소 1024x1024 권장)
2. 위 명령어를 실행하면 자동으로 다음 파일들이 생성됩니다:
   - Windows용: `icon.ico`
   - macOS용: `icon.icns`
   - Linux용: 다양한 크기의 PNG 파일들

## 빌드 및 패키징

```bash
# Windows용 빌드 (.exe 설치 파일 생성)
npm run build:win

# macOS용 빌드 (.dmg 파일 생성)
npm run build:mac

# Linux용 빌드 (AppImage 생성)
npm run build:linux

# 모든 플랫폼용 빌드 (Windows, macOS, Linux)
npm run build:all

# 개발용 빌드 (패키징 없이)
npm run build
```

빌드 결과물은 `dist` 폴더에 생성됩니다.

## 프로젝트 구조

```
ttj_electron_basic/
├── assets/               # 아이콘 및 리소스 파일
│   ├── icon.png         # 원본 아이콘 (1024x1024 권장)
│   ├── icon.ico         # Windows용 아이콘 (자동 생성)
│   ├── icon.icns        # macOS용 아이콘 (자동 생성)
│   └── icons/           # 다양한 크기의 아이콘 (자동 생성)
├── dist/                # 빌드 결과물
├── main.js              # Electron 메인 프로세스
├── index.html           # 애플리케이션 UI
├── package.json         # 프로젝트 설정 및 빌드 구성
└── README.md            # 프로젝트 문서

```

## 빌드 설정

`package.json`의 `build` 섹션에서 다양한 빌드 옵션을 설정할 수 있습니다:

- **appId**: 애플리케이션 고유 식별자
- **productName**: 제품명
- **win**: Windows 빌드 설정
  - NSIS 설치 프로그램 생성
  - 32비트(ia32) 및 64비트(x64) 지원
- **mac**: macOS 빌드 설정
  - DMG 파일 생성
- **linux**: Linux 빌드 설정
  - AppImage 형식 생성

## Windows 설치 프로그램 특징

- 설치 디렉토리 선택 가능
- 시작 메뉴 바로가기 자동 생성
- 제거 프로그램 등록
- 32비트 및 64비트 시스템 지원

## 앱 설치 및 데이터 경로

### Windows
- **앱 설치 경로**: 
  - 64비트: `C:\Program Files\TTJ Electron Basic\`
  - 32비트: `C:\Program Files (x86)\TTJ Electron Basic\`
  - 사용자별 설치: `C:\Users\[username]\AppData\Local\Programs\TTJ Electron Basic\`
- **사용자 데이터 경로**: `C:\Users\[username]\AppData\Roaming\ttj_electron_basic\`

### macOS
- **앱 설치 경로**: `/Applications/TTJ Electron Basic.app`
- **사용자 데이터 경로**: `~/Library/Application Support/ttj_electron_basic/`

### 경로
```javascript
// 앱 설치 경로
const appPath = app.getAppPath();

// 사용자 데이터 경로
const userDataPath = app.getPath('userData');

// 기타 유용한 경로들
const desktop = app.getPath('desktop');
const documents = app.getPath('documents');
const downloads = app.getPath('downloads');
const temp = app.getPath('temp');
```

## 문제 해결

### 빌드 실패 시
1. `node_modules` 폴더 삭제 후 재설치
   ```bash
   rm -rf node_modules
   npm install
   ```

2. 캐시 정리
   ```bash
   npm cache clean --force
   ```

### 아이콘이 표시되지 않을 때
1. 아이콘 파일이 올바른 위치에 있는지 확인
2. 아이콘 재생성: `npm run build-icon`
3. 빌드 재실행: `npm run dist`

## 라이센스

ISC