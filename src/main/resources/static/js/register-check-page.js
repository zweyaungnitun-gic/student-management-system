// Create backdrop element
const backdrop = document.createElement('div');
backdrop.className = 'toast-backdrop';
backdrop.id = 'toastBackdrop';
document.body.appendChild(backdrop);

function submitFinalData() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>登録中...';

    fetch('/register/submit-final', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.text())
        .then(data => {
            if (data === 'success') {
                // Redirect immediately without showing toast
                window.location.href = '/register/success';
            } else {
                // Extract error message
                const errorMsg = data.startsWith('error:') ? data.substring(6) : '登録に失敗しました';
                showToast(errorMsg, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '登録完了';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('登録に失敗しました。もう一度お試しください。', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '登録完了';
        });
}
