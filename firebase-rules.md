# Firebase Firestore 보안 규칙 설정

## 문제 해결을 위한 임시 규칙 (테스트용)

Firebase 콘솔에서 다음 규칙을 설정하세요:

### 1. Firebase 콘솔 접속
- https://console.firebase.google.com/
- 프로젝트 선택: `freediving-consent`

### 2. Firestore Database → 규칙 탭
- "규칙 편집" 클릭

### 3. 다음 규칙으로 교체:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 모든 읽기/쓰기 허용 (테스트용)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. "게시" 클릭

## 주의사항
- 이 규칙은 **테스트용**입니다
- 실제 운영 시에는 더 엄격한 보안 규칙이 필요합니다
- 문제 해결 후 보안 규칙을 다시 설정하세요

## 확인 방법
1. 모바일에서 동의서 작성
2. 관리자 페이지에서 데이터 확인
3. 콘솔에서 에러 메시지 확인 