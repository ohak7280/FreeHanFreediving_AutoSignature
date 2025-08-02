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
        id: `${name}_${experienceDate}_${Date.now()}`, // 고유 ID 생성
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
    
    // 서버에도 저장 시도 (선택사항)
    saveToServer(data);
}

// 서버에 저장 (선택사항)
async function saveToServer(data) {
    try {
        // 여기에 실제 서버 엔드포인트를 추가할 수 있습니다
        // 예: fetch('/api/consents', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        
        console.log('서버 저장 시도:', data);
    } catch (error) {
        console.log('서버 저장 실패 (로컬 스토리지만 사용):', error);
    }
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

// html2canvas 라이브러리 추가
function loadHtml2Canvas() {
    const script = document.createElement('script');
    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    document.head.appendChild(script);
}

// 페이지 로드 시 html2canvas 로드
loadHtml2Canvas();

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

// 모든 데이터 내보내기
function exportAllData() {
    const consents = JSON.parse(localStorage.getItem('freedivingConsents') || '[]');
    if (consents.length === 0) {
        alert('내보낼 데이터가 없습니다.');
        return;
    }
    
    const dataStr = JSON.stringify(consents, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `freediving_all_consents_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`${consents.length}개의 동의서 데이터가 내보내졌습니다.`);
}

// 데이터 가져오기 버튼 클릭
function importData() {
    document.getElementById('importFile').click();
}

// 파일 가져오기 처리
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            const existingData = JSON.parse(localStorage.getItem('freedivingConsents') || '[]');
            
            // 중복 제거 (ID 기반)
            const existingIds = new Set(existingData.map(item => item.id));
            const newData = importedData.filter(item => !existingIds.has(item.id));
            
            if (newData.length === 0) {
                alert('가져올 새로운 데이터가 없습니다.');
                return;
            }
            
            // 기존 데이터와 병합
            const mergedData = [...existingData, ...newData];
            localStorage.setItem('freedivingConsents', JSON.stringify(mergedData));
            
            alert(`${newData.length}개의 새로운 동의서가 추가되었습니다.`);
            
            // 파일 입력 초기화
            event.target.value = '';
            
        } catch (error) {
            alert('파일 형식이 올바르지 않습니다. JSON 파일을 선택해주세요.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

// 전역 함수로 노출
window.exportAllData = exportAllData;
window.importData = importData;
window.handleFileImport = handleFileImport; 

// 폼을 이미지로 변환하고 메일 전송
async function captureFormAndSendEmail() {
    try {
        // html2canvas가 로드될 때까지 대기
        if (typeof html2canvas === 'undefined') {
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (typeof html2canvas !== 'undefined') {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }

        // 폼 영역 캡처
        const formElement = document.getElementById('consentForm');
        const canvas = await html2canvas(formElement, {
            scale: 2, // 고해상도
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        // 캔버스를 이미지로 변환
        const imageData = canvas.toDataURL('image/png');
        
        // 메일 전송
        sendEmailWithImage(imageData);
        
    } catch (error) {
        console.error('이미지 캡처 실패:', error);
        alert('이미지 캡처 중 오류가 발생했습니다.');
    }
}

// 메일로 이미지 전송
function sendEmailWithImage(imageData) {
    const name = document.getElementById('name').value || '참가자';
    const contact = document.getElementById('contact').value || '연락처 없음';
    const experienceDate = document.getElementById('experience-date').value || '날짜 없음';
    
    const subject = `프리다이빙 체험 동의서 - ${name}`;
    const body = `
안녕하세요,

${name}님의 프리다이빙 체험 동의서가 제출되었습니다.

참가자 정보:
- 이름: ${name}
- 연락처: ${contact}
- 체험일: ${experienceDate}
- 제출시간: ${new Date().toLocaleString('ko-KR')}

첨부된 이미지를 확인해주세요.

감사합니다.
    `.trim();

    // 메일 링크 생성
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // 새 창에서 메일 클라이언트 열기
    window.open(mailtoLink, '_blank');
    
    // 이미지 다운로드도 함께 제공
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `freediving_consent_${name}_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('동의서가 이미지로 저장되었고, 메일 클라이언트가 열렸습니다. 메일에 이미지를 첨부하여 전송하세요.');
}

// 전역 함수로 노출
window.captureFormAndSendEmail = captureFormAndSendEmail; 