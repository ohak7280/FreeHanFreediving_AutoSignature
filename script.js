// 전자서명 관련 변수
let isDrawing = false;
let signatureData = null;

// DOM 요소들
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearSignature');
const saveBtn = document.getElementById('saveSignature');
const form = document.getElementById('consentForm');
const submitBtn = document.getElementById('submitForm');
const downloadBtn = document.getElementById('downloadPDF');

// 캔버스 초기화
function initCanvas() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// 마우스 이벤트 리스너
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// 터치 이벤트 리스너 (모바일 지원)
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                    e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// 서명 지우기
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureData = null;
});

// 서명 저장
saveBtn.addEventListener('click', () => {
    signatureData = canvas.toDataURL();
    alert('서명이 저장되었습니다.');
});

// 폼 제출 처리
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 모든 필수 체크박스 확인
    const requiredCheckboxes = form.querySelectorAll('input[type="checkbox"][required]');
    let allChecked = true;
    
    requiredCheckboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            allChecked = false;
        }
    });
    
    if (!allChecked) {
        alert('모든 동의 항목에 체크해주세요.');
        return;
    }
    
    // 필수 입력 필드 확인
    const name = document.getElementById('name').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const experienceDate = document.getElementById('experience-date').value;
    
    if (!name || !contact || !experienceDate) {
        alert('모든 필수 정보를 입력해주세요.');
        return;
    }
    
    // 서명 확인
    if (!signatureData) {
        alert('전자서명을 완료해주세요.');
        return;
    }
    
    // 데이터 수집
    const formData = {
        timestamp: new Date().toISOString(),
        name: name,
        contact: contact,
        experienceDate: experienceDate,
        signature: signatureData,
        consent: {
            physicalContact: document.getElementById('physical-contact').checked,
            refundPolicy: document.getElementById('refund-policy').checked,
            guidance: document.getElementById('guidance').checked,
            mediaConsent: document.getElementById('media-consent').checked,
            finalConsent: document.getElementById('final-consent').checked
        }
    };
    
    try {
        // 로컬 스토리지에 저장
        saveToLocalStorage(formData);
        
        // JSON 파일로 다운로드
        downloadJSON(formData);
        
        alert('동의서가 성공적으로 제출되었습니다!');
        
        // 폼 초기화
        form.reset();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        signatureData = null;
        
    } catch (error) {
        console.error('Error saving data:', error);
        alert('데이터 저장 중 오류가 발생했습니다.');
    }
});

// 로컬 스토리지에 저장
function saveToLocalStorage(data) {
    const existingData = JSON.parse(localStorage.getItem('freedivingConsents') || '[]');
    existingData.push(data);
    localStorage.setItem('freedivingConsents', JSON.stringify(existingData));
}

// JSON 파일 다운로드
function downloadJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freediving_consent_${data.name}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// PDF 다운로드 기능
downloadBtn.addEventListener('click', () => {
    // jsPDF 라이브러리가 필요하지만, 여기서는 간단한 구현
    alert('PDF 다운로드 기능은 jsPDF 라이브러리 설치가 필요합니다.');
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('experience-date').value = today;
    
    // 입력 필드 유효성 검사
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
    });
});

// 필드 유효성 검사
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    if (!value && field.hasAttribute('required')) {
        field.style.borderColor = '#dc3545';
    } else {
        field.style.borderColor = '#e9ecef';
    }
}

// 데이터 조회 기능 (관리자용)
function viewAllConsents() {
    const consents = JSON.parse(localStorage.getItem('freedivingConsents') || '[]');
    console.log('모든 동의서 데이터:', consents);
    return consents;
}

// 특정 참가자의 동의서 조회
function findConsentByName(name) {
    const consents = viewAllConsents();
    return consents.filter(consent => 
        consent.name.toLowerCase().includes(name.toLowerCase())
    );
}

// 날짜별 동의서 조회
function findConsentsByDate(date) {
    const consents = viewAllConsents();
    return consents.filter(consent => 
        consent.experienceDate === date
    );
}

// 전역 함수로 노출 (개발자 도구에서 사용 가능)
window.viewAllConsents = viewAllConsents;
window.findConsentByName = findConsentByName;
window.findConsentsByDate = findConsentsByDate; 