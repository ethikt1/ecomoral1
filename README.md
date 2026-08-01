# EcoMoral Lab

Google Apps Script(구글 시트)와 Firebase Firestore를 서로 독립적인 저장 경로로 사용하는 Vite/React 앱입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

Firebase를 사용하려면 `.env.example`을 `.env.local`로 복사하고 Firebase 웹 앱 설정값을 입력합니다. 값을 입력하지 않으면 Firebase 저장만 건너뛰며 Google Sheets 연동은 계속 작동합니다.

## Netlify + Firebase 설정

1. Firebase Console의 **Authentication > Sign-in method**에서 **익명(Anonymous)** 로그인을 활성화합니다.
2. **Authentication > Settings > Authorized domains**에 실제 Netlify 도메인(예: `사이트명.netlify.app`)과 사용자 도메인을 추가합니다.
3. Firebase Console의 **Firestore Database > Rules**에 프로젝트의 `firestore.rules` 내용을 반영하고 게시합니다.
4. Netlify의 **Site configuration > Environment variables**에 `.env.example`의 `VITE_FIREBASE_*` 여섯 값을 등록합니다.
5. Netlify에서 **Clear cache and deploy site**로 다시 배포합니다. Vite 환경변수는 빌드할 때 포함되므로 재배포가 필요합니다.

> `VITE_*` 값은 브라우저에 포함되는 공개 Firebase 웹 설정입니다. 서비스 계정 비밀키는 Netlify 환경변수나 프론트엔드 코드에 넣지 마세요.

## Google Sheets 설정

앱의 **연동 설정**에서 Apps Script 웹 앱의 `/exec` URL을 입력합니다. 스프레드시트 주소나 Apps Script 편집기 `/edit` 주소가 아닙니다. Apps Script 배포는 실행 사용자를 본인으로 하고 접근 권한을 앱 사용자에게 맞게 설정합니다.

Google Sheets 요청과 Firebase 요청은 별도로 실행됩니다. 한쪽 설정이 없거나 실패해도 다른 쪽 저장을 막지 않습니다.
