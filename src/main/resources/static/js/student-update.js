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

  // Map of tab IDs to form elements (Ensure these IDs match your HTML)
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
    
    // Clear all previous client-side error states for a clean check
    formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    formElement.querySelectorAll('.invalid-feedback').forEach(el => el.remove()); 

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
              input.parentNode.insertBefore(feedback, input.nextSibling);
          }
        }
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

  const interceptTabClicks = () => {
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (allowProgrammaticSwitch) return;

        const targetPaneId = btn.getAttribute('data-bs-target')?.replace('#', '');
        if (!currentPaneId) {
          detectActivePaneOnLoad();
        }

        if (currentPaneId && changedMap[currentPaneId] && changedMap[currentPaneId].size > 0) {
          e.preventDefault();
          e.stopPropagation(); // Important: Stop event from bubbling
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
          
          if (unsavedModal) unsavedModal.show();
        } else {
          // no unsaved changes — normal switch; update currentPaneId
          currentPaneId = targetPaneId;
        }
      });
    });
  };

const setupModalHandlers = () => {
  if (!confirmLeaveBtn) return;
  
  const modalStayBtn = unsavedModalEl.querySelector('[data-bs-dismiss="modal"]');
  if (modalStayBtn) {
    modalStayBtn.addEventListener('click', () => {
      if (pendingPaneId && currentPaneId) {
        
        const pendingTab = document.querySelector(`[data-bs-target="#${pendingPaneId}"]`);
        if (pendingTab) {
          pendingTab.classList.remove('active');
          pendingTab.setAttribute('aria-selected', 'false');
        }
        
        const pendingPane = document.getElementById(pendingPaneId);
        if (pendingPane) {
          pendingPane.classList.remove('show', 'active');
        }
        
        const currentTab = document.querySelector(`[data-bs-target="#${currentPaneId}"]`);
        if (currentTab) {
          currentTab.classList.add('active');
          currentTab.setAttribute('aria-selected', 'true');
          
          allowProgrammaticSwitch = true;
          const bsTab = new bootstrap.Tab(currentTab);
          bsTab.show();
          allowProgrammaticSwitch = false;
        }
        
        const currentPane = document.getElementById(currentPaneId);
        if (currentPane) {
          currentPane.classList.add('show', 'active');
        }
      }
      pendingPaneId = null;
    });
  }
  
  confirmLeaveBtn.addEventListener('click', () => {
    if (!pendingPaneId) {
      if (unsavedModal) unsavedModal.hide();
      return;
    }
    if (currentPaneId) discardPaneChanges(currentPaneId);

    allowProgrammaticSwitch = true;
    if (unsavedModal) unsavedModal.hide();

    programmaticSwitchToPane(pendingPaneId);

    setTimeout(() => { 
        allowProgrammaticSwitch = false; 
        pendingPaneId = null; 
        setupServerValidationDisplay(); // Re-apply server validation errors after switch
    }, 100);
  });
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
    const dobInput = document.getElementById('dateOfBirth'); 
    
    if (dobInput) {
      const today = new Date();
      const maxYear = today.getFullYear() - 18; 
      
      const maxDate = new Date(maxYear, today.getMonth(), today.getDate());
      const maxDateString = maxDate.toISOString().split('T')[0];
      
      dobInput.setAttribute('max', maxDateString);
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