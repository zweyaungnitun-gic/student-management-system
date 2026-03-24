// Define required fields for this page
const requiredFields = [
    { id: 'fatherName', message: '父親名は必須です', type: 'text' },
    { id: 'secondaryPhone', message: '保護者電話番号は必須です', type: 'text' }
];

// Setup error clearing listeners
setupErrorClearListeners(
    ['fatherName', 'passportNumber', 'secondaryPhone', 'otherDesiredJobType'],
    ['additional.passedHighestJlptLevel', 'additional.desiredJobType', 'additional.japanTravelExperience', 'additional.coeApplicationExperience']
);

// Function to collect current form data
function collectFormData() {
    return {
        fatherName: document.getElementById('fatherName').value.trim(),
        passportNumber: document.getElementById('passportNumber').value.trim(),
        secondaryPhone: document.getElementById('secondaryPhone').value.trim(),
        passedHighestJlptLevel: document.querySelector('input[name="additional.passedHighestJlptLevel"]:checked')?.value || '',
        desiredJobType: document.querySelector('input[name="additional.desiredJobType"]:checked')?.value || '',
        otherDesiredJobType: document.getElementById('otherDesiredJobType').value.trim(),
        japanTravelExperience: document.querySelector('input[name="additional.japanTravelExperience"]:checked')?.value || '',
        coeApplicationExperience: document.querySelector('input[name="additional.coeApplicationExperience"]:checked')?.value || ''
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
            const prevUrl = document.querySelector('form')?.getAttribute('data-prev-url') || '/register';
            window.location.href = prevUrl;
        })
        .catch(error => {
            console.error('Error:', error);
            const prevUrl = document.querySelector('form')?.getAttribute('data-prev-url') || '/register';
            window.location.href = prevUrl;
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
    
    const form = document.querySelector('form');
    // If the form has an action attribute (meaning it's the admin native submit flow), submit it natively
    if (form.hasAttribute('action') && form.getAttribute('action') !== '') {
        form.submit();
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
                const nextUrl = document.querySelector('form')?.getAttribute('data-next-url') || '/register/third-page';
                window.location.href = nextUrl;
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

