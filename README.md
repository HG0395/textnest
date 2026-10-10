# TextNest

한국어 글자 수·UTF-8 바이트 계산, 공백·줄바꿈 정리, 문자열 바꾸기, 복사·TXT 저장 도구입니다. 가입·결제·API 키·서버 데이터베이스가 필요하지 않습니다. 입력은 브라우저 메모리에서 처리되며 새로고침하면 사라집니다.

## 실행

Node.js 22 이상에서 다음 명령을 차례대로 실행하세요. 외부 npm 의존성이 없습니다.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

http://127.0.0.1:4178 에 접속합니다. 종료는 Ctrl+C입니다. `dist/index.html`을 직접 열면 모듈과 절대 경로가 동작하지 않을 수 있으므로 HTTP 서버로 실행하세요.

## Cloudflare Pages

- GitHub 저장소: https://github.com/HG0395/textnest
- 프로덕션 브랜치: `main`
- 프레임워크: None
- 루트 디렉터리: 저장소 루트 (비워 두기)
- 빌드 명령: `npm run build`
- 출력 디렉터리: `dist`
- 권장 환경변수: `NODE_VERSION=22`, `SITE_URL=실제 공개 사이트 주소`
- Git 연동 프로젝트로 생성해야 GitHub의 main 업데이트가 자동 배포됩니다.

`SITE_URL` 기본값은 https://textnest.pages.dev 입니다. 실제 주소가 다르면 Cloudflare 환경변수에 정확한 주소를 넣고 재배포하세요. SEO canonical, sitemap, robots가 해당 주소로 생성됩니다.

## 구조

`src/core.mjs`: 계산·문자열 처리 / `src/app.mjs`: UI 동작 / `src/style.css`: 반응형 디자인 / `scripts/build.mjs`: 실제 HTML 콘텐츠와 배포 파일 생성 / `tests`: 계산·공백·교체 검증.

콘텐츠 페이지 8개와 광고 없는 404를 생성합니다. 도움말은 실제 기능의 기준·제한을 설명합니다. 외부 API와 AI를 사용하지 않습니다. 문의는 실제 GitHub 공개 이슈 링크를 사용합니다.

## 광고 연결

사용자 제공 AdSense 스크립트와 확인 메타 태그를 콘텐츠 페이지의 head에 포함하며 루트 ads.txt를 생성합니다. 404에는 광고를 넣지 않습니다. 광고 단위나 Auto ads는 이 코드에서 활성화하지 않았습니다. 표시 여부는 Google 승인과 계정 설정에 따릅니다.

공개 배포 이후 운영자가 AdSense에서 사이트를 추가·확인하고 심사를 요청해야 합니다. EEA·영국·스위스 등 동의 대상 지역에서 광고를 게재하려면 AdSense 개인정보 보호 및 메시지에서 인증 CMP를 설정해야 합니다. 자체 동의 배너가 인증 CMP를 대체하지 않습니다. 실제 수집·동의 설정이 바뀌면 `/privacy/`도 수정하세요. 코드 반영은 승인이나 수익을 보장하지 않습니다.

## 개인정보

입력 본문을 자체 서버에 전송하거나 자동 저장하지 않습니다. 외부 광고 스크립트는 Google에 요청을 보내며 Cloudflare는 사이트를 제공합니다. 외부 스크립트까지 무수집을 보장하지 않습니다. 민감한 문서를 입력하지 마세요. 복사·다운로드는 사용자가 직접 실행하며 기기에 내용이 남을 수 있습니다.
