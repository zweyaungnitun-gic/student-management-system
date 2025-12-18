// Define required fields for this page
const requiredFields = [];

// Setup error clearing listeners
setupErrorClearListeners(
    ['tuitionPaymentDate', 'otherReligion', 'otherMemo'],
    ['religion', 'smoking', 'alcohol', 'tattoo', 'wantDorm']
);

// Function to collect current form data
function collectFormData() {
    return {
        religion: document.querySelector('input[name="religion"]:checked')?.value || '',
        otherReligion: document.getElementById('otherReligion').value.trim(),
        smoking: document.querySelector('input[name="smoking"]:checked')?.value || '',
        alcohol: document.querySelector('input[name="alcohol"]:checked')?.value || '',
        tattoo: document.querySelector('input[name="tattoo"]:checked')?.value || '',
        tuitionPaymentDate: document.getElementById('tuitionPaymentDate').value,
        wantDorm: document.querySelector('input[name="wantDorm"]:checked')?.value || '',
        otherMemo: document.getElementById('otherMemo').value.trim()
    };
}

// Back button - Save data to Redis before going back
document.getElementById('backButton').addEventListener('click', function () {
    const formData = collectFormData();

    // Save to Redis session
    fetch('/register/save-step3', {
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
            window.location.href = '/register/second-page';
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/register/second-page';
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

    fetch('/register/save-step3', {
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
                window.location.href = '/register/check-page';
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
