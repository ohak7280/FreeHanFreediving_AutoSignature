# 웹 배포 가이드

## GitHub Pages 배포 (무료)

### 1. GitHub 저장소 생성
1. GitHub.com에서 새 저장소 생성
2. 저장소 이름: `freediving-consent-form`
3. Public으로 설정

### 2. 파일 업로드
```bash
# 현재 디렉토리에서
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/사용자명/freediving-consent-form.git
git push -u origin main
```

### 3. GitHub Pages 활성화
1. 저장소 → Settings
2. Pages → Source: Deploy from a branch
3. Branch: main → Save

### 4. URL 확인
- `https://사용자명.github.io/freediving-consent-form`

## Netlify 배포 (무료, 추천)

### 1. Netlify 가입
1. [netlify.com](https://netlify.com) 방문
2. GitHub 계정으로 로그인

### 2. 사이트 배포
1. "New site from Git" 클릭
2. GitHub 선택
3. 저장소 선택
4. Build settings:
   - Build command: (비워둠)
   - Publish directory: (비워둠)
5. "Deploy site" 클릭

### 3. 커스텀 도메인 (선택사항)
1. Site settings → Domain management
2. "Add custom domain" 클릭
3. 도메인 입력

## Vercel 배포 (무료)

### 1. Vercel 가입
1. [vercel.com](https://vercel.com) 방문
2. GitHub 계정으로 로그인

### 2. 프로젝트 배포
1. "New Project" 클릭
2. GitHub 저장소 선택
3. "Deploy" 클릭

## 주의사항

### 데이터 저장
- 현재 로컬 스토리지 사용
- 브라우저별로 데이터 분리
- 서버 저장소 필요 시 백엔드 개발 필요

### 보안
- HTTPS 사용 권장
- 개인정보 처리방침 추가 고려

### 성능 최적화
- 이미지 압축
- CSS/JS 압축
- CDN 사용 