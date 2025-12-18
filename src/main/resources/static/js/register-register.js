// Define required fields
const requiredFields = [
    { id: 'englishName', message: '英語名は必須です', type: 'text' },
    { id: 'katakanaName', message: 'カタカナ名は必須です', type: 'text' },
    { id: 'dob', message: '生年月日は必須です', type: 'date' },
    { id: 'currentAddress', message: '現在所は必須です', type: 'textarea' },
    { id: 'hometownAddress', message: '出身地住所は必須です', type: 'textarea' },
    { id: 'phoneNumber', message: '電話番号は必須です', type: 'text' },
    { id: 'guardianPhoneNumber', message: '保護者電話番号は必須です', type: 'text' },
    { name: 'gender', message: '性別を選択してください', type: 'radio' }
];

// Setup error clearing listeners for inputs
setupErrorClearListeners(
    ['englishName', 'katakanaName', 'dob', 'currentAddress', 'hometownAddress', 'phoneNumber', 'guardianPhoneNumber'],
    ['gender']
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

    const genderSelected = document.querySelector('input[name="gender"]:checked');
    // Prepare payload
    const payload = {
        englishName: document.getElementById('englishName').value.trim(),
        katakanaName: document.getElementById('katakanaName').value.trim(),
        dob: document.getElementById('dob').value,
        gender: genderSelected ? genderSelected.value : null,
        currentAddress: document.getElementById('currentAddress').value.trim(),
        hometownAddress: document.getElementById('hometownAddress').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        guardianPhoneNumber: document.getElementById('guardianPhoneNumber').value.trim()
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
                window.location.href = '/register/second-page';
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

