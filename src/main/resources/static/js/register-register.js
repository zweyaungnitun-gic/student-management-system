// Define required fields using the correct IDs from register.html
const requiredFields = [
    { id: 'studentName', message: '生徒名は必須です', type: 'text' },
    { id: 'dateOfBirth', message: '生年月日は必須です', type: 'date' },
    { id: 'currentLivingAddress', message: '現在所は必須です', type: 'textarea' },
    { id: 'homeTownAddress', message: '出身地住所は必須です', type: 'textarea' },
    { id: 'phoneNumber', message: '電話番号は必須です', type: 'text' },
    { id: 'nationalId', message: '国民ID番号は必須です', type: 'text' },
    { name: 'student.gender', message: '性別を選択してください', type: 'radio' }
];

// Setup error clearing listeners for inputs
setupErrorClearListeners(
    ['studentName', 'dateOfBirth', 'currentLivingAddress', 'homeTownAddress', 'phoneNumber', 'nationalId'],
    ['student.gender']
);

// Form submission
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();

    clearAllErrors();

    // Client-side validation
    const clientErrors = validateRequiredFields(requiredFields);
    if (Object.keys(clientErrors).length > 0) {
        displayValidationErrors(clientErrors);
        return;
    }

    const form = document.querySelector('form');
    // If the form has an action attribute (meaning it's the admin native submit flow), submit it natively
    if (form.hasAttribute('action') && form.getAttribute('action') !== '') {
        form.submit();
        return;
    }

    const genderSelected = document.querySelector('input[name="student.gender"]:checked');
    // Prepare payload
    const payload = {
        englishName: document.getElementById('studentName').value.trim(),
        katakanaName: "NotProvided", 
        dob: document.getElementById('dateOfBirth').value,
        gender: genderSelected ? genderSelected.value : null,
        currentAddress: document.getElementById('currentLivingAddress').value.trim(),
        hometownAddress: document.getElementById('homeTownAddress').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        guardianPhoneNumber: "-", // Not in form anymore
        nationalIdNumber: document.getElementById('nationalId').value.trim()
    };

    // Send data to backend
    fetch('/register/save-step1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(async response => {
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            let data;
            try {
                data = await response.json();
                console.log('Response data:', data);
            } catch (e) {
                console.error('Failed to parse JSON:', e);
                alert('サーバーからの応答を解析できませんでした');
                return;
            }

            if (response.ok && data && data.status === 'success') {
                console.log('Success! Redirecting to second page...');
                const nextUrl = document.querySelector('form')?.getAttribute('data-next-url') || '/register/second-page';
                window.location.href = nextUrl;
                return;
            }

            // Handle validation errors from backend
            if (response.status === 400 && data && data.errors) {
                console.log('Validation errors:', data.errors);
                displayValidationErrors(data.errors);
            } else {
                console.error('Unexpected response:', response.status, data);
                alert('保存中に問題が発生しました。');
            }
        })
        .catch(error => {
            console.error('Network error:', error);
            alert('データの保存に失敗しました。ネットワークを確認してください。');
        });
});

