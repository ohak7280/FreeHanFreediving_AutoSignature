

// 전자서명 관련 변수
let isDrawing = false;
let signatureData = null;
let currentStep = 1;
const totalSteps = 3;

// DOM 요소들
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearSignature');
const saveBtn = document.getElementById('saveSignature');
const form = document.getElementById('consentForm');
const submitBtn = document.getElementById('submitForm');
const progressFill = document.getElementById('progressFill');

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

// 진행률 업데이트
function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = progress + '%';
}

// 다음 단계로 이동
function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }
    
    if (currentStep < totalSteps) {
        document.getElementById(`step${currentStep}`).style.display = 'none';
        currentStep++;
        document.getElementById(`step${currentStep}`).style.display = 'block';
        updateProgress();
    }
}

// 이전 단계로 이동
function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).style.display = 'none';
        currentStep--;
        document.getElementById(`step${currentStep}`).style.display = 'block';
        updateProgress();
    }
}

// 현재 단계 유효성 검사
function validateCurrentStep() {
    clearErrors();
    
    switch (currentStep) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        default:
            return true;
    }
}

// 1단계 유효성 검사 (참가자 정보)
function validateStep1() {
    let isValid = true;
    
    const name = document.getElementById('name').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const experienceDate = document.getElementById('experience-date').value;
    
    // 이름 검사
    if (!name) {
        showError('nameError', '이름을 입력해주세요.');
        isValid = false;
    } else if (name.length < 2) {
        showError('nameError', '이름은 2글자 이상 입력해주세요.');
        isValid = false;
    }
    
    // 연락처 검사
    if (!contact) {
        showError('contactError', '연락처를 입력해주세요.');
        isValid = false;
    } else if (!/^[0-9-]+$/.test(contact)) {
        showError('contactError', '올바른 연락처 형식을 입력해주세요.');
        isValid = false;
    }
    
    // 체험일 검사
    if (!experienceDate) {
        showError('dateError', '체험일을 선택해주세요.');
        isValid = false;
    } else {
        const selectedDate = new Date(experienceDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showError('dateError', '오늘 이후 날짜를 선택해주세요.');
            isValid = false;
        }
    }
    
    return isValid;
}

// 2단계 유효성 검사 (동의 항목)
function validateStep2() {
    const checkboxes = [
        'physical-contact',
        'refund-policy', 
        'guidance',
        'media-consent'
    ];
    
    for (let checkboxId of checkboxes) {
        if (!document.getElementById(checkboxId).checked) {
            alert('모든 동의 항목에 체크해주세요.');
            return false;
        }
    }
    
    return true;
}

// 3단계 유효성 검사 (서명)
function validateStep3() {
    if (!signatureData) {
        alert('전자서명을 완료해주세요.');
        return false;
    }
    
    if (!document.getElementById('final-consent').checked) {
        alert('최종 동의 항목에 체크해주세요.');
        return false;
    }
    
    return true;
}

// 에러 메시지 표시
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// 에러 메시지 초기화
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

// 폼 제출 처리
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // 제출 버튼 비활성화 (중복 제출 방지)
    const submitButton = document.getElementById('submitForm');
    submitButton.disabled = true;
    submitButton.textContent = '제출 중...';
    
    // 데이터 수집
    const formData = {
        id: `${document.getElementById('name').value}_${document.getElementById('experience-date').value}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        name: document.getElementById('name').value.trim(),
        contact: document.getElementById('contact').value.trim(),
        experienceDate: document.getElementById('experience-date').value,
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
        console.log('동의서 제출 시작:', formData.name);
        
        // 중복 제출 체크
        const existingData = JSON.parse(localStorage.getItem('freedivingConsents') || '[]');
        const isDuplicate = existingData.some(item => 
            item.name === formData.name && 
            item.experienceDate === formData.experienceDate &&
            item.timestamp.split('T')[0] === formData.timestamp.split('T')[0]
        );
        
        if (isDuplicate) {
            alert('이미 제출된 동의서입니다.');
            submitButton.disabled = false;
            submitButton.textContent = '제출';
            return;
        }
        
        // 로컬 스토리지에 저장
        saveToLocalStorage(formData);
        
        // 이미지 캡처
        await captureFormImage(formData);
        
        alert('동의서가 성공적으로 제출되었습니다!');
        
        // 폼 초기화
        resetForm();
        
    } catch (error) {
        console.error('Error saving data:', error);
        alert('데이터 저장 중 오류가 발생했습니다.');
    } finally {
        // 제출 버튼 다시 활성화
        submitButton.disabled = false;
        submitButton.textContent = '제출';
    }
});

// 이미지 캡처
async function captureFormImage(formData) {
    try {
        // 모바일에서는 이미지 캡처를 건너뛰고 기본 데이터만 저장
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            console.log('모바일 환경에서는 이미지 캡처를 건너뜁니다.');
            return;
        }

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
        
        // 캡처된 이미지를 formData에 저장
        formData.capturedImage = imageData;
        
        // 로컬 스토리지에 업데이트된 데이터 저장 (이미지 포함)
        updateLocalStorageWithImage(formData);
        
    } catch (error) {
        console.error('이미지 캡처 실패:', error);
        // 이미지 캡처 실패해도 동의서 제출은 계속 진행
    }
}



// 폼 초기화
function resetForm() {
    form.reset();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    signatureData = null;
    currentStep = 1;
    updateProgress();
    
    // 모든 단계 숨기고 1단계만 표시
    for (let i = 1; i <= totalSteps; i++) {
        document.getElementById(`step${i}`).style.display = i === 1 ? 'block' : 'none';
    }
    
    clearErrors();
}

// 로컬 스토리지에 저장
function saveToLocalStorage(data) {
    try {
        const existingData = JSON.parse(localStorage.getItem('freedivingConsents') || '[]');
        
        // 새로운 데이터 추가
        existingData.push(data);
        
        localStorage.setItem('freedivingConsents', JSON.stringify(existingData));
        console.log('데이터 저장 완료:', data.name, '총 개수:', existingData.length);
        
    } catch (error) {
        console.error('로컬 스토리지 저장 실패:', error);
        throw error;
    }
}

// 이미지 포함 데이터로 업데이트
function updateLocalStorageWithImage(data) {
    try {
        const existingData = JSON.parse(localStorage.getItem('freedivingConsents') || '[]');
        
        // 같은 ID의 데이터를 찾아서 이미지 포함 데이터로 업데이트
        const existingIndex = existingData.findIndex(item => item.id === data.id);
        
        if (existingIndex !== -1) {
            existingData[existingIndex] = data;
            localStorage.setItem('freedivingConsents', JSON.stringify(existingData));
            console.log('이미지 포함 데이터 업데이트 완료:', data.name);
        }
        
    } catch (error) {
        console.error('이미지 업데이트 실패:', error);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    updateProgress();
    
    // 오늘 날짜를 최소값으로 설정
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('experience-date');
    dateInput.min = today;
    dateInput.value = today;
    
    // 입력 필드 실시간 유효성 검사
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (currentStep === 1) {
                validateStep1();
            }
        });
    });
});

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
window.viewAllConsents = viewAllConsents;
window.findConsentByName = findConsentByName;
window.findConsentsByDate = findConsentsByDate;
window.exportAllData = exportAllData;
window.importData = importData;
window.handleFileImport = handleFileImport;
window.nextStep = nextStep;
window.prevStep = prevStep; 