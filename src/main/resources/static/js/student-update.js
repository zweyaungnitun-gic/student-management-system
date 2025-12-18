(() => {
  const unsavedModalEl = document.getElementById('unsavedModal');
  const unsavedModal = unsavedModalEl ? new bootstrap.Modal(unsavedModalEl) : null;
  const confirmLeaveBtn = document.getElementById('confirmLeaveBtn');

  // State
  let currentPaneId = null;           
  let pendingPaneId = null;            
  let allowProgrammaticSwitch = false; 
  const changedMap = {};               // { paneId: Set(fieldName) }
  const tabNames = {
    'basic': '基本情報',
    'status': 'ステータス・属性',
    'n5': 'N5クラス情報',
    'n4': 'N4クラス情報',
    'interview': '面談・その他'
  };

  // Map of tab IDs to form elements (for easy access)
  const formMap = {
    'basic': document.getElementById('basicForm'),
    'status': document.getElementById('statusForm'),
    'n5': document.getElementById('n5Form'),
    'n4': document.getElementById('n4Form'),
    'interview': document.getElementById('interviewForm'),
  };

  const queryAllFieldsInPane = (paneId) => {
    const pane = document.getElementById(paneId);
    return pane ? Array.from(pane.querySelectorAll('input, textarea, select')) : [];
  };

  const setOriginalsOnLoad = () => {
    document.querySelectorAll('input, textarea, select').forEach(el => {
      const orig = el.getAttribute('data-original') ?? el.value ?? '';
      el.dataset.originalValue = orig;
    });
  };

  const detectActivePaneOnLoad = () => {
    const activeNav = document.querySelector('.nav-link.active');
    if (activeNav && activeNav.hasAttribute('data-bs-target')) {
      currentPaneId = activeNav.getAttribute('data-bs-target').replace('#','');
      return;
    }
    const activePane = document.querySelector('.tab-pane.active');
    if (activePane) {
      currentPaneId = activePane.id;
      return;
    }
    // fallback: choose first pane inside .tab-content
    const firstPane = document.querySelector('.tab-content .tab-pane');
    currentPaneId = firstPane ? firstPane.id : null;
  };

  const ensurePaneEntry = (paneId) => {
    if (!changedMap[paneId]) changedMap[paneId] = new Set();
  };

  const isFieldChanged = (el) => {
    const current = el.value ?? '';
    const orig = el.dataset.originalValue ?? '';
    return String(current) !== String(orig);
  };

  const updateFieldChangeState = (el) => {
    const paneId = el.closest('.tab-pane')?.id;
    if (!paneId) return;
    ensurePaneEntry(paneId);

    if (isFieldChanged(el)) {
      changedMap[paneId].add(el.name || el.id || el);
      el.classList.add('changed-field');
      updateUnsavedBadgeCount(paneId);
    } else {
      changedMap[paneId].delete(el.name || el.id || el);
      el.classList.remove('changed-field');
      updateUnsavedBadgeCount(paneId);
    }
  };

  const updateUnsavedBadgeCount = (paneId) => {
    const navBtn = document.querySelector(`[data-bs-target="#${paneId}"]`);
    if (!navBtn) return;
    
    const count = changedMap[paneId]?.size || 0;
    let badge = navBtn.querySelector('.unsaved-badge');
    
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'unsaved-badge';
        navBtn.appendChild(badge);
      }
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      if (badge) {
        badge.style.display = 'none';
      }
    }
  };

  const removeUnsavedBadgeFromNav = (paneId) => {
    const navBtn = document.querySelector(`[data-bs-target="#${paneId}"]`);
    if (!navBtn) return;
    const badge = navBtn.querySelector('.unsaved-badge');
    if (badge) badge.remove();
  };

  const getTabDisplayName = (paneId) => {
    if (tabNames[paneId]) {
      return tabNames[paneId];
    }
    
    const tabBtn = document.querySelector(`[data-bs-target="#${paneId}"]`);
    if (tabBtn) {
      const tabText = tabBtn.querySelector('span');
      if (tabText) {
        return tabText.textContent;
      }
    }
    
    return 'このタブ';
  };
  
  // Server-Side Error Display Logic
  function setupServerValidationDisplay() {
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    document.querySelectorAll('.form-control, .form-select, textarea').forEach(input => {
      let fieldName = input.getAttribute('name');
      
      if (!fieldName) {
        const thymeleafField = input.getAttribute('th:field');
        if (thymeleafField) {
          fieldName = thymeleafField.replace('*{', '').replace('}', '');
        }
      }
      
      if (fieldName) {
        const inputWrapper = input.closest('.col-md-6, .col-md-4, .col-md-3, .col-12');
        if (inputWrapper) {
          const errorDiv = inputWrapper.querySelector('.text-danger');
          
          if (errorDiv && errorDiv.textContent.trim() !== '') {
            input.classList.add('is-invalid');
          }
        }
      }
    });
  }

  // Client-Side Validation Logic (Stops Submission) 
  function validateTab(formElement) {
    let isValid = true;
    
    formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    formElement.querySelectorAll('.invalid-feedback').forEach(el => el.remove()); 

    // Check all required fields within the current form
    formElement.querySelectorAll('.required-label').forEach(label => {
      const inputId = label.getAttribute('for');
      let input = inputId ? document.getElementById(inputId) : null;
      
      if (!input) {
          let nextSibling = label.nextElementSibling;
          // Skip over hidden inputs (like studentId hidden field)
          while (nextSibling && nextSibling.tagName === 'INPUT' && nextSibling.type === 'hidden') {
              nextSibling = nextSibling.nextElementSibling;
          }
          input = nextSibling;
      }
      
      if (input && (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA')) {
        const value = input.value.trim();
        
        // Validation check: empty value or select with default option
        if (!value || (input.tagName === 'SELECT' && input.value === '')) {
          isValid = false;
          
          input.classList.add('is-invalid');
          
          const inputWrapper = input.closest('.col-md-6, .col-md-4, .col-md-3, .col-12');
          const serverErrorDiv = inputWrapper ? inputWrapper.querySelector('.text-danger') : null;
          
          if (!serverErrorDiv || serverErrorDiv.textContent.trim() === '') {
              const feedback = document.createElement('div');
              feedback.classList.add('invalid-feedback');
              feedback.textContent = 'この項目をご入力ください'; 
              input.parentNode.insertBefore(feedback, input.nextSibling);
          }
        }
      }
    });
    
    return isValid;
  }
  
  // Add this to your existing setupFormValidationAndSubmission function
const setupFormValidationAndSubmission = () => {
  document.querySelectorAll('.tab-pane form').forEach(form => {
    const pane = form.closest('.tab-pane');
    if (!pane) return;
    const paneId = pane.id;

    form.addEventListener('submit', function(event) {
      event.preventDefault(); 

      // Validate all fields including phone and national ID
      if (validateTab(form)) {          
        queryAllFieldsInPane(paneId).forEach(f => {
          f.dataset.originalValue = f.value ?? '';
          f.classList.remove('changed-field');
        });
        changedMap[paneId] = new Set();
        removeUnsavedBadgeFromNav(paneId);

        form.submit(); 
      } else {
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        
        // Show alert for better UX
        const invalidCount = form.querySelectorAll('.is-invalid').length;
        if (invalidCount > 0) {
          alert('入力内容にエラーがあります。' + invalidCount + '個の項目を修正してください。');
        }
      }
    });
  });
};

  // reset visible fields back to original values
  const discardPaneChanges = (paneId) => {
    queryAllFieldsInPane(paneId).forEach(el => {
      const orig = el.dataset.originalValue ?? '';
      el.value = orig;
      el.classList.remove('changed-field');
    });
    changedMap[paneId] = new Set();
    removeUnsavedBadgeFromNav(paneId);
  };

  const programmaticSwitchToPane = (paneId) => {
    const navBtn = document.querySelector(`[data-bs-target="#${paneId}"]`);
    if (!navBtn) {
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('show','active'));
      const pane = document.getElementById(paneId);
      if (pane) pane.classList.add('show','active');
      currentPaneId = paneId;
      return;
    }
    const bsTab = new bootstrap.Tab(navBtn);
    bsTab.show();
    currentPaneId = paneId;
  };

  const attachFieldListeners = () => {
    document.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', () => updateFieldChangeState(el));
      el.addEventListener('change', () => updateFieldChangeState(el));
    });
  };

  // Helper function to manually switch tabs
  const performTabSwitch = (paneId) => {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('show', 'active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tabBtn => {
      tabBtn.classList.remove('active');
      tabBtn.setAttribute('aria-selected', 'false');
    });
    
    // Show the target pane
    const targetPane = document.getElementById(paneId);
    if (targetPane) {
      targetPane.classList.add('show', 'active');
    }
    
    // Activate the target tab button
    const targetTabBtn = document.querySelector(`[data-bs-target="#${paneId}"]`);
    if (targetTabBtn) {
      targetTabBtn.classList.add('active');
      targetTabBtn.setAttribute('aria-selected', 'true');
    }
  };

  const interceptTabClicks = () => {
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (allowProgrammaticSwitch) return;

        const targetPaneId = btn.getAttribute('data-bs-target')?.replace('#', '');
        if (!currentPaneId) {
          detectActivePaneOnLoad();
        }

        // Check if there are unsaved changes in current tab
        if (currentPaneId && changedMap[currentPaneId] && changedMap[currentPaneId].size > 0) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation(); // Prevent other listeners
          
          // Store the target tab that was clicked
          pendingPaneId = targetPaneId;
          
          // Update modal content
          const currentTabNameEl = document.getElementById('currentTabName');
          if (currentTabNameEl) {
            currentTabNameEl.textContent = getTabDisplayName(currentPaneId);
          }
          
          const changedCountEl = document.getElementById('changedCount');
          if (changedCountEl) {
            changedCountEl.textContent = changedMap[currentPaneId].size;
          }
          
          // CRITICAL: Also prevent the content pane from changing
          // Hide the target pane if it became visible
          const targetPane = document.getElementById(targetPaneId);
          if (targetPane) {
            targetPane.classList.remove('show', 'active');
          }
          
          // Ensure current pane stays visible
          const currentPane = document.getElementById(currentPaneId);
          if (currentPane) {
            currentPane.classList.add('show', 'active');
          }
          
          if (unsavedModal) unsavedModal.show();
          
        } else {
          // No unsaved changes - perform the tab switch
          performTabSwitch(targetPaneId);
          currentPaneId = targetPaneId;
        }
      });
    });
  };

  const setupModalHandlers = () => {
    if (!confirmLeaveBtn) return;
    
    // Handle Cancel button (stay on current tab)
    const modalCancelBtn = unsavedModalEl.querySelector('.btn-secondary[data-bs-dismiss="modal"]');
    if (modalCancelBtn) {
      modalCancelBtn.addEventListener('click', () => {
        // Ensure the clicked tab button is deactivated
        if (pendingPaneId) {
          const pendingTab = document.querySelector(`[data-bs-target="#${pendingPaneId}"]`);
          if (pendingTab) {
            pendingTab.classList.remove('active');
            pendingTab.setAttribute('aria-selected', 'false');
          }
          
          // Ensure the target pane is hidden
          const pendingPane = document.getElementById(pendingPaneId);
          if (pendingPane) {
            pendingPane.classList.remove('show', 'active');
          }
          
          // Re-activate current tab and pane
          const currentTab = document.querySelector(`[data-bs-target="#${currentPaneId}"]`);
          if (currentTab) {
            currentTab.classList.add('active');
            currentTab.setAttribute('aria-selected', 'true');
          }
          
          const currentPane = document.getElementById(currentPaneId);
          if (currentPane) {
            currentPane.classList.add('show', 'active');
          }
        }
        
        if (unsavedModal) unsavedModal.hide();
        pendingPaneId = null;
      });
    }
    
    // Handle Confirm Leave button
    confirmLeaveBtn.addEventListener('click', () => {
      if (!pendingPaneId || !currentPaneId) {
        if (unsavedModal) unsavedModal.hide();
        return;
      }
      
      // Discard changes on current tab
      discardPaneChanges(currentPaneId);
      
      // Hide modal first
      if (unsavedModal) unsavedModal.hide();
      
      // Perform the tab switch manually
      performTabSwitch(pendingPaneId);
      
      // Update current pane ID
      currentPaneId = pendingPaneId;
      pendingPaneId = null;
      
      // Re-apply server validation if needed
      setTimeout(() => {
        setupServerValidationDisplay();
      }, 100);
    });
  };

  // Update programmaticSwitchToPane to use manual switching
  const updatedProgrammaticSwitchToPane = (paneId) => {
    performTabSwitch(paneId);
    currentPaneId = paneId;
  };

  // Public function to mark a pane saved (for AJAX)
  window.markPaneSaved = function(paneId) {
    queryAllFieldsInPane(paneId).forEach(f => {
      f.dataset.originalValue = f.value ?? '';
      f.classList.remove('changed-field');
    });
    changedMap[paneId] = new Set();
    removeUnsavedBadgeFromNav(paneId);
  };

  // Helper function to cancel update
  window.cancelUpdate = function() {
    const anyUnsaved = Object.values(changedMap).some(s => s.size > 0);
    
    if (anyUnsaved) {
      if (confirm('未保存の変更があります。変更を破棄して戻りますか？')) {
        window.location.href = '/students';
      }
    } else {
      window.location.href = '/students';
    }
  };

  // To restrict Date of Birth (must be at least 18 years old)
  const setupDobRestriction = () => {
    const dobInput = document.querySelector('input[name="dateOfBirth"]'); 
    
    if (dobInput) {
      const today = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 18);
      
      const maxDateString = maxDate.toISOString().split('T')[0];
      
      dobInput.setAttribute('max', maxDateString);
      
      // Prevent unrealistic old dates (e.g., 1900)
      const minDate = new Date();
      minDate.setFullYear(1900, 0, 1);
      const minDateString = minDate.toISOString().split('T')[0];
      dobInput.setAttribute('min', minDateString);
      
      dobInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        if (selectedDate > maxDate) {
          alert('You must be at least 18 years old.');
          this.value = maxDateString; 
        }
      });
    }
  };

// Phone number validation: Must start with 09 and have exactly 11 digits
function validatePhoneNumber(input, fieldName) {
  const value = input.value.trim();
  
  if (value === '') {
    // Hide any existing invalid feedback for empty field (let required validation handle it)
    const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
    if (existingFeedback) {
      existingFeedback.style.display = 'none';
    }
    input.classList.remove('is-invalid');
    return true;
  }
  
  const phoneRegex = /^09\d{9}$/;
  
  if (!phoneRegex.test(value)) {
    input.classList.add('is-invalid');
    
    // Find or create invalid-feedback div
    let feedback = input.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      input.parentNode.appendChild(feedback);
    }
    
    if (value.length < 2) {
      feedback.textContent = '電話番号は09から始まる必要があります';
    } else if (!value.startsWith('09')) {
      feedback.textContent = '電話番号は09から始まる必要があります';
    } else if (value.length !== 11) {
      feedback.textContent = '電話番号は11桁である必要があります (現在: ' + value.length + '桁)';
    } else {
      feedback.textContent = `${fieldName}は09から始まる11桁の数字で入力してください`;
    }
    
    feedback.style.display = 'block';
    return false;
  }
  
  input.classList.remove('is-invalid');
  const feedback = input.parentNode.querySelector('.invalid-feedback');
  if (feedback) {
    feedback.style.display = 'none';
  }
  return true;
}

function validateNationalID(input) {
  const value = input.value.trim();
  
  if (value === '') {
    const existingFeedback = input.parentNode.querySelector('.invalid-feedback');
    if (existingFeedback) {
      existingFeedback.style.display = 'none';
    }
    input.classList.remove('is-invalid');
    return true;
  }
  
  // Format: XX/XXXXX(X)XXXXXX
  // Where:
  // - XX before / must be between 1 and 14
  // - After ( ) must be exactly 6 digits
  
  // Basic format check
  const formatRegex = /^(\d{1,2})\/([A-Za-z]+)\(([A-Za-z])\)(\d+)$/;
  const match = value.match(formatRegex);
  
  if (!match) {
    input.classList.add('is-invalid');
    let feedback = input.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      input.parentNode.appendChild(feedback);
    }
    
    // Provide helpful error messages
    if (!value.includes('/')) {
      feedback.textContent = 'フォーマットに"/"が含まれていません (例: 12/KaMaYa(N)54243)';
    } else if (!value.includes('(') || !value.includes(')')) {
      feedback.textContent = 'フォーマットに"()"が含まれていません (例: 12/KaMaYa(N)54243)';
    } else {
      feedback.textContent = '正しい形式で入力してください (例: 12/KaMaYa(N)54243)';
    }
    
    feedback.style.display = 'block';
    return false;
  }
  
  const beforeSlash = parseInt(match[1], 10);
  const afterParenthesis = match[4];
  
  // Check if number before / is between 1 and 14
  if (beforeSlash < 1 || beforeSlash > 14) {
    input.classList.add('is-invalid');
    let feedback = input.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      input.parentNode.appendChild(feedback);
    }
    feedback.textContent = '/ の前の数字は1から14の間で入力してください (現在: ' + beforeSlash + ')';
    feedback.style.display = 'block';
    return false;
  }
  
  // Check if digits after parenthesis are exactly 6
  if (afterParenthesis.length !== 6) {
    input.classList.add('is-invalid');
    let feedback = input.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      input.parentNode.appendChild(feedback);
    }
    feedback.textContent = '()の後は6桁の数字を入力してください (現在: ' + afterParenthesis.length + '桁)';
    feedback.style.display = 'block';
    return false;
  }
  
  // Check that afterParenthesis contains only digits
  if (!/^\d{6}$/.test(afterParenthesis)) {
    input.classList.add('is-invalid');
    let feedback = input.parentNode.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      input.parentNode.appendChild(feedback);
    }
    feedback.textContent = '()の後は数字のみ6桁で入力してください';
    feedback.style.display = 'block';
    return false;
  }
  
  input.classList.remove('is-invalid');
  // Hide invalid feedback if it exists
  const feedback = input.parentNode.querySelector('.invalid-feedback');
  if (feedback) {
    feedback.style.display = 'none';
  }
  return true;
}

// Enhanced validateTab function to include phone and national ID validation
function validateTab(formElement) {
  let isValid = true;
  
  // Clear all previous client-side error states for a clean check
  formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  formElement.querySelectorAll('.invalid-feedback').forEach(el => {
    el.style.display = 'none';
  });

  // Check all required fields within the current form
  formElement.querySelectorAll('.required-label').forEach(label => {
    const inputId = label.getAttribute('for');
    let input = inputId ? document.getElementById(inputId) : null;
    
    if (!input) {
        let nextSibling = label.nextElementSibling;
        // Skip over hidden inputs (like the studentId hidden field)
        while (nextSibling && nextSibling.tagName === 'INPUT' && nextSibling.type === 'hidden') {
            nextSibling = nextSibling.nextElementSibling;
        }
        input = nextSibling;
    }
    
    if (input && (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA')) {
      const value = input.value.trim();
      
      // Validation check: empty value or select with default option
      if (!value || (input.tagName === 'SELECT' && input.value === '')) {
        isValid = false;
        
        input.classList.add('is-invalid');
        
        const inputWrapper = input.closest('.col-md-6, .col-md-4, .col-md-3, .col-12');
        const serverErrorDiv = inputWrapper ? inputWrapper.querySelector('.text-danger') : null;
        
        if (!serverErrorDiv || serverErrorDiv.textContent.trim() === '') {
            const feedback = document.createElement('div');
            feedback.classList.add('invalid-feedback');
            feedback.textContent = 'この項目をご入力ください'; 
            feedback.style.display = 'block';
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }
      }
      
      else {
        if (input.name === 'contactViber' || input.name === 'phoneNumber' || input.name === 'secondaryPhone') {
          const fieldName = label.textContent.replace(' *', '').trim();
          if (!validatePhoneNumber(input, fieldName)) {
            isValid = false;
          }
        }
        
        else if (input.name === 'nationalID') {
          if (!validateNationalID(input)) {
            isValid = false;
          }
        }
      }
    }
  });
  
  return isValid;
}

  function init() {
    setOriginalsOnLoad();
    detectActivePaneOnLoad();
    document.querySelectorAll('.tab-pane').forEach(p => { changedMap[p.id] = new Set(); });
    attachFieldListeners();
    interceptTabClicks();
    setupModalHandlers();
    
    setupServerValidationDisplay(); 
    setupFormValidationAndSubmission(); 
    setupDobRestriction();

    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function() {
          setTimeout(setupServerValidationDisplay, 100); 
        });
      });

    window.addEventListener('beforeunload', (ev) => {
      const anyUnsaved = Object.values(changedMap).some(s => s.size > 0);
      if (anyUnsaved) {
        ev.preventDefault();
        ev.returnValue = '';
      }
    });
  }
  init();
})();