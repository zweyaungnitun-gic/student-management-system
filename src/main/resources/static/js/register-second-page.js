// Define required fields for this page
const requiredFields = [
    { id: 'fatherName', message: '父親名は必須です', type: 'text' },
    { id: 'nationalIdNumber', message: '国民ID番号は必須です', type: 'text' }
];

// Setup error clearing listeners
setupErrorClearListeners(
    ['fatherName', 'passportNumber', 'nationalIdNumber', 'otherOccupation'],
    ['jlptLevel', 'desiredOccupation', 'japanTravelExperience', 'coeApplicationExperience']
);

// Function to collect current form data
function collectFormData() {
    return {
        fatherName: document.getElementById('fatherName').value.trim(),
        passportNumber: document.getElementById('passportNumber').value.trim(),
        nationalIdNumber: document.getElementById('nationalIdNumber').value.trim(),
        jlptLevel: document.querySelector('input[name="jlptLevel"]:checked')?.value || '',
        desiredOccupation: document.querySelector('input[name="desiredOccupation"]:checked')?.value || '',
        otherOccupation: document.getElementById('otherOccupation').value.trim(),
        japanTravelExperience: document.querySelector('input[name="japanTravelExperience"]:checked')?.value || '',
        coeApplicationExperience: document.querySelector('input[name="coeApplicationExperience"]:checked')?.value || ''
    };
}

// Back button - Save data to Redis before going back
document.getElementById('backButton').addEventListener('click', function () {
    const formData = collectFormData();

    // Save to Redis session
    fetch('/register/save-step2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            // Navigate back after saving (even if validation fails, allow going back)
            window.location.href = '/register';
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/register';
        });
});

// Form submit - Validate and save data
document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();

    clearAllErrors();

    // Client-side validation
    const clientErrors = validateRequiredFields(requiredFields);
    if (Object.keys(clientErrors).length > 0) {
        displayValidationErrors(clientErrors);
        return;
    }

    const formData = collectFormData();

    fetch('/register/save-step2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(async response => {
            let data = null;
            try { data = await response.json(); } catch (e) { /* ignore */ }

            if (response.ok && data && data.status === 'success') {
                window.location.href = '/register/third-page';
                return;
            }

            if (response.status === 400 && data && data.errors) {
                // Show server-side validation errors in UI
                displayValidationErrors(data.errors);
                return;
            }

            console.error('Server error:', response.status, data);
            alert('保存中に問題が発生しました。');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('データの保存に失敗しました');
        });
});

