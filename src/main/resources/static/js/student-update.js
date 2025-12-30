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

  // Phone number validation: Must start with 09 and have exactly 11 digits
  function validatePhoneNumber(input, fieldName) {
    const value = input.value.trim();
    
    if (value === '') {
      // Hide any existing invalid feedback for empty field
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

  // National ID validation
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
    const feedback = input.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.style.display = 'none';
    }
    return true;
  }

  // Client-Side Validation Logic
  function validateTab(formElement) {
    let isValid = true;
    
    // Clear all previous client-side error states
    formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    formElement.querySelectorAll('.invalid-feedback').forEach(el => {
      el.style.display = 'none';
    });

    // Check all required fields
    formElement.querySelectorAll('.required-label').forEach(label => {
      const inputId = label.getAttribute('for');
      let input = inputId ? document.getElementById(inputId) : null;
      
      if (!input) {
        let nextSibling = label.nextElementSibling;
        // Skip over hidden inputs
        while (nextSibling && nextSibling.tagName === 'INPUT' && nextSibling.type === 'hidden') {
          nextSibling = nextSibling.nextElementSibling;
        }
        input = nextSibling;
      }
      
      if (input && (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA')) {
        const value = input.value.trim();
        const fieldName = label.textContent.replace(' *', '').trim();
        
        // Required field validation
        if (!value || (input.tagName === 'SELECT' && input.value === '')) {
          isValid = false;
          input.classList.add('is-invalid');
          
          const inputWrapper = input.closest('.col-md-6, .col-md-4, .col-md-3, .col-12');
          const serverErrorDiv = inputWrapper ? inputWrapper.querySelector('.text-danger') : null;
          
          if (!serverErrorDiv || serverErrorDiv.textContent.trim() === '') {
            const feedback = document.createElement('div');
            feedback.classList.add('invalid-feedback');
            feedback.textContent = fieldName ? `${fieldName}は必須項目です` : 'この項目は必須です';
            feedback.style.display = 'block';
            input.parentNode.appendChild(feedback);
          }
        }
        
        // Field-specific validation
        else if (input.name === 'contactViber' || input.name === 'phoneNumber' || input.name === 'secondaryPhone') {
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
    });
    
    // Date field validation
    formElement.querySelectorAll('input[type="date"]').forEach(dateInput => {
      if (dateInput.hasAttribute('required') && !dateInput.value) {
        isValid = false;
        dateInput.classList.add('is-invalid');
        
        const feedback = document.createElement('div');
        feedback.classList.add('invalid-feedback');
        feedback.textContent = '日付を選択してください';
        feedback.style.display = 'block';
        dateInput.parentNode.appendChild(feedback);
      }
    });
    
    return isValid;
  }
  
  const setupFormValidationAndSubmission = () => {
    document.querySelectorAll('.tab-pane form').forEach(form => {
      const pane = form.closest('.tab-pane');
      if (!pane) return;
      const paneId = pane.id;

      form.addEventListener('submit', function(event) {
        event.preventDefault(); 

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
          
          const invalidCount = form.querySelectorAll('.is-invalid').length;
          if (invalidCount > 0) {
            alert('入力内容にエラーがあります。' + invalidCount + '個の項目を修正してください。');
          }
        }
      });
    });
  };

  // Reset fields to original values
  const discardPaneChanges = (paneId) => {
    queryAllFieldsInPane(paneId).forEach(el => {
      const orig = el.dataset.originalValue ?? '';
      el.value = orig;
      el.classList.remove('changed-field');
    });
    changedMap[paneId] = new Set();
    removeUnsavedBadgeFromNav(paneId);
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

  const attachFieldListeners = () => {
    document.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', () => updateFieldChangeState(el));
      el.addEventListener('change', () => updateFieldChangeState(el));
    });
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
          
          // Prevent content pane from changing
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

  document.addEventListener('DOMContentLoaded', function () {
      const alertBox = document.querySelector('.alert-dismissible');
      const body = document.body;

      if (alertBox) {
          body.classList.add('stop-scrolling');

          const closeBtn = alertBox.querySelector('.btn-close');
          
          if (closeBtn) {
              closeBtn.addEventListener('click', function () {
                  body.classList.remove('stop-scrolling');
              });
          }
      }
  });

  // ======================================================================================
  // Flash message handling
  function closeFlashMessage() {
      const flashOverlay = document.querySelector('.custom-flash-overlay');
      if (flashOverlay) {
          flashOverlay.style.display = 'none';
          document.body.classList.remove('flash-modal-open');
          flashOverlay.remove();
      }
  }

  document.addEventListener('DOMContentLoaded', function() {
      const flashOverlay = document.querySelector('.custom-flash-overlay');
      if (flashOverlay) {
          flashOverlay.style.display = 'flex';
          
          document.body.classList.add('flash-modal-open');
          
          const okButton = flashOverlay.querySelector('.custom-flash-button');
          if (okButton) {
              okButton.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  closeFlashMessage();
              });
          }
      }
  });
  // ======================================================================================

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
          alert('18歳以上である必要があります。');
          this.value = maxDateString; 
        }
      });
    }
  };

  // Setup real-time validation for better UX
  const setupRealTimeValidation = () => {
    // Phone number fields - real-time formatting and validation
    document.querySelectorAll('input[name="contactViber"], input[name="phoneNumber"], input[name="secondaryPhone"]').forEach(input => {
      input.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
      });
      
      input.addEventListener('blur', function() {
        if (this.value.trim() === '') return;
        
        const label = this.parentNode.querySelector('.form-label');
        const fieldName = label ? label.textContent.replace(' *', '').trim() : 'この項目';
        
        if (this.name === 'contactViber') {
          validatePhoneNumber(this, fieldName);
        } else if (this.name === 'phoneNumber') {
          validatePhoneNumber(this, fieldName);
        } else if (this.name === 'secondaryPhone') {
          validatePhoneNumber(this, fieldName);
        }
      });
    });
    
    // National ID field
    const nationalIDInput = document.querySelector('input[name="nationalID"]');
    if (nationalIDInput) {
      nationalIDInput.addEventListener('blur', function() {
        if (this.value.trim() === '') return;
        validateNationalID(this);
      });
    }
    
    // Real-time validation for required fields
    document.querySelectorAll('.required-label').forEach(label => {
      const inputId = label.getAttribute('for');
      let input = inputId ? document.getElementById(inputId) : null;
      
      if (!input) {
        let nextSibling = label.nextElementSibling;
        while (nextSibling && nextSibling.tagName === 'INPUT' && nextSibling.type === 'hidden') {
          nextSibling = nextSibling.nextElementSibling;
        }
        input = nextSibling;
      }
      
      if (input) {
        input.addEventListener('blur', function() {
          if (!this.value.trim() || (this.tagName === 'SELECT' && this.value === '')) {
            this.classList.add('is-invalid');
            
            let feedback = this.parentNode.querySelector('.invalid-feedback');
            if (!feedback) {
              feedback = document.createElement('div');
              feedback.className = 'invalid-feedback';
              this.parentNode.appendChild(feedback);
            }
            
            const fieldName = label.textContent.replace(' *', '').trim();
            feedback.textContent = `${fieldName}は必須項目です`;
            feedback.style.display = 'block';
          } else {
            this.classList.remove('is-invalid');
            const feedback = this.parentNode.querySelector('.invalid-feedback');
            if (feedback && !feedback.classList.contains('server-error')) {
              feedback.style.display = 'none';
            }
          }
        });
      }
    });
  };

  function cancelUpdate() {
      const nameSearch = '[[${nameSearch}]]';
      const status = '[[${status}]]';

      let url = '/students';
      const params = [];

      // Only push if the string isn't empty or literally the word 'null'
      if (nameSearch && nameSearch.trim() !== '' && nameSearch !== 'null') {
        params.push('nameSearch=' + encodeURIComponent(nameSearch.trim()));
      }
      if (status && status.trim() !== '' && status !== 'null') {
        params.push('status=' + encodeURIComponent(status.trim()));
      }

      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      window.location.href = url;
    }

    document.addEventListener('DOMContentLoaded', function () {
      const nameSearch = '[[${nameSearch}]]';
      const status = '[[${status}]]';

      if (nameSearch || status) {
        history.replaceState({ hasFilters: true }, '');

        window.addEventListener('popstate', function (e) {
          e.preventDefault();

          let url = '/students';
          const params = [];

          if (nameSearch && nameSearch.trim() !== '') {
            params.push('nameSearch=' + encodeURIComponent(nameSearch.trim()));
          }
          if (status && status.trim() !== '') {
            params.push('status=' + encodeURIComponent(status.trim()));
          }

          if (params.length > 0) {
            url += '?' + params.join('&');
          }

          window.location.href = url;
        });
      }
    });

    document.addEventListener("DOMContentLoaded", function () {
      const layout = document.querySelector(".dashboard-layout");
      const toggles = document.querySelectorAll("[data-sidebar-toggle]");
      toggles.forEach((btn) =>
        btn.addEventListener("click", function (event) {
          event.preventDefault();
          layout?.classList.toggle("sidebar-open");
        })
      );
    });

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

  const handleUrlTabParam = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  
    if (tabParam) {
      const targetTabBtn = document.querySelector(`[data-bs-target="#${tabParam}"]`);
      if (targetTabBtn) {
        performTabSwitch(tabParam);
        currentPaneId = tabParam;
      }
    }
  };

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
    setupRealTimeValidation();
    handleUrlTabParam();

    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
      tab.addEventListener('shown.bs.tab', function() {
        setTimeout(setupServerValidationDisplay, 100); 
      });
    });

    // Warn user before leaving page with unsaved changes
    window.addEventListener('beforeunload', (ev) => {
      const anyUnsaved = Object.values(changedMap).some(s => s.size > 0);
      if (anyUnsaved) {
        ev.preventDefault();
        ev.returnValue = '';
      }
    });
  }
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();