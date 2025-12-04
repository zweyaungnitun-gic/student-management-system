document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Fixed header and footer should work');
    
    document.getElementById('cancelBtn').addEventListener('click', function() {
        if (confirm('変更内容が保存されません。よろしいですか？')) {
            window.history.back();
        }
    });
    
    // Toggle "Other" fields
    const desiredJob = document.getElementById('desiredJob');
    const otherJobInput = document.getElementById('otherJobInput');
    const religion = document.getElementById('religion');
    const otherReligionInput = document.getElementById('otherReligionInput');
    
    if (desiredJob && otherJobInput) {
        desiredJob.addEventListener('change', function() {
            otherJobInput.disabled = (this.value !== 'other');
            if (this.value !== 'other') otherJobInput.value = '';
        });
    }
    
    if (religion && otherReligionInput) {
        religion.addEventListener('change', function() {
            otherReligionInput.disabled = (this.value !== 'other');
            if (this.value !== 'other') otherReligionInput.value = '';
        });
    }
    
    // Form validation
    const form = document.getElementById('studentUpdateForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const studentId = document.querySelector('input[name="studentId"]');
            if (studentId && !studentId.value) {
                alert('生徒IDを入力してください');
                studentId.focus();
                return false;
            }
            
            if (confirm('生徒情報を更新しますか？')) {
                console.log('Form would submit now');
                alert('更新しました（デモモード）');
            }
        });
    }
    
    // Tab functionality
    const tabTriggers = document.querySelectorAll('#studentTab .nav-link');
    tabTriggers.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-bs-target');
            if (target) {
                const bsTab = new bootstrap.Tab(this);
                bsTab.show();
                
                document.querySelector('.main-content-container').scrollTop = 0;
            }
        });
    });
    
    function checkFixedElements() {
        const header = document.querySelector('.fixed-header-container');
        const tabs = document.querySelector('.fixed-tabs-container');
        const footer = document.querySelector('.fixed-footer-container');
        
        if (header && tabs && footer) {
            console.log('All fixed elements found:', {
                header: header.getBoundingClientRect(),
                tabs: tabs.getBoundingClientRect(),
                footer: footer.getBoundingClientRect()
            });
        }
    }
    
    checkFixedElements();
    
    window.addEventListener('resize', function() {
        checkFixedElements();
    });
});