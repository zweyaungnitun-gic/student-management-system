/**
 * Display validation errors from backend on form fields
 * @param {Object} errors - Object containing field names as keys and error messages as values
 */
function displayValidationErrors(errors) {
    for (const [fieldName, errorMessage] of Object.entries(errors)) {
        // first try element by id
        const inputElement = document.getElementById(fieldName);

        if (inputElement) {
            inputElement.classList.add('is-invalid');
            // find existing feedback
            let feedback = inputElement.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = errorMessage;
                feedback.style.display = 'block';
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = errorMessage;
                inputElement.parentElement.appendChild(errorDiv);
            }
            continue;
        }

        // if no element by id, look for a radio/checkbox group (by name)
        const group = document.querySelector(`[name="${fieldName}"]`);
        if (group) {
            // Special handling for radio button groups - only red border
            const radioFieldMap = {
                'gender': 'genderBtnGroup',
                'jlptLevel': 'jlptLevelBtnGroup',
                'japanTravelExperience': 'japanTravelExperienceBtnGroup',
                'coeApplicationExperience': 'coeApplicationExperienceBtnGroup',
                'smoking': 'smokingBtnGroup',
                'alcohol': 'alcoholBtnGroup',
                'tattoo': 'tattooBtnGroup',
                'wantDorm': 'wantDormBtnGroup',
                'desiredOccupation': 'desiredOccupationBtnGroup',
                'religion': 'religionBtnGroup'
            };

            if (radioFieldMap[fieldName]) {
                const btnGroup = document.getElementById(radioFieldMap[fieldName]);
                if (btnGroup) {
                    btnGroup.querySelectorAll('.btn').forEach(btn => {
                        btn.classList.add('border-danger');
                    });
                }
            }

            // find a container to attach feedback (closest parent .col-*-*)
            const first = document.querySelector(`[name="${fieldName}"]`);
            let container = first && first.closest('.col-md-8');
            if (!container) {
                container = first && first.parentElement;
            }
            if (container) {
                let feedback = container.querySelector('.invalid-feedback');
                if (feedback) {
                    feedback.textContent = errorMessage;
                    feedback.style.display = 'block';
                } else {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = errorMessage;
                    container.appendChild(errorDiv);
                }
            }
            continue;
        }

        // last fallback: look for an explicit error div with id fieldName + 'Error'
        const special = document.getElementById(fieldName + 'Error');
        if (special) {
            special.textContent = errorMessage;
            special.style.display = 'block';
        }
    }
}

/**
 * Clear all validation error messages from the form
 */
function clearAllErrors() {
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.invalid-feedback').forEach(f => f.style.display = 'none');
    // Clear all radio button group errors - remove red border
    const btnGroupIds = [
        'genderBtnGroup', 'jlptLevelBtnGroup', 'japanTravelExperienceBtnGroup',
        'coeApplicationExperienceBtnGroup', 'smokingBtnGroup', 'alcoholBtnGroup',
        'tattooBtnGroup', 'wantDormBtnGroup', 'desiredOccupationBtnGroup', 'religionBtnGroup'
    ];

    btnGroupIds.forEach(id => {
        const btnGroup = document.getElementById(id);
        if (btnGroup) {
            btnGroup.querySelectorAll('.btn').forEach(btn => {
                btn.classList.remove('border-danger');
            });
        }
    });
}

/**
 * Validate required fields in the form
 * @param {Array} requiredFields - Array of objects with {id/name, message, type} where type is 'text', 'date', 'textarea', or 'radio'
 * @returns {Object} Object containing field names as keys and error messages as values
 */
function validateRequiredFields(requiredFields) {
    let errors = {};

    requiredFields.forEach(field => {
        if (field.type === 'text' || field.type === 'date' || field.type === 'textarea') {
            // Validate text input fields
            const element = document.getElementById(field.id);
            if (element && !element.value.trim()) {
                errors[field.id] = field.message;
            }
        } else if (field.type === 'radio') {
            // Validate radio button groups
            const selected = document.querySelector(`input[name="${field.name}"]:checked`);
            if (!selected) {
                errors[field.name] = field.message;
            }
        }
    });

    return errors;
}

/**
 * Setup input event listeners to clear errors when user starts typing or selecting
 * @param {Array} textFieldIds - Array of text input field IDs
 * @param {Array} radioGroupNames - Array of radio button group names
 */
function setupErrorClearListeners(textFieldIds, radioGroupNames) {
    // Clear errors on text input/change
    textFieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            el.classList.remove('is-invalid');
            const fb = el.parentElement.querySelector('.invalid-feedback');
            if (fb) fb.style.display = 'none';
        });
    });

    // Clear errors on radio button change
    radioGroupNames.forEach(name => {
        document.querySelectorAll(`[name="${name}"]`).forEach(r => {
            r.addEventListener('change', () => {
                const fb = document.getElementById(name + 'Error');
                if (fb) fb.style.display = 'none';

                // Clear radio button group error - remove red border only
                const radioFieldMap = {
                    'gender': 'genderBtnGroup',
                    'jlptLevel': 'jlptLevelBtnGroup',
                    'japanTravelExperience': 'japanTravelExperienceBtnGroup',
                    'coeApplicationExperience': 'coeApplicationExperienceBtnGroup',
                    'smoking': 'smokingBtnGroup',
                    'alcohol': 'alcoholBtnGroup',
                    'tattoo': 'tattooBtnGroup',
                    'wantDorm': 'wantDormBtnGroup',
                    'desiredOccupation': 'desiredOccupationBtnGroup',
                    'religion': 'religionBtnGroup'
                };

                if (radioFieldMap[name]) {
                    const btnGroup = document.getElementById(radioFieldMap[name]);
                    if (btnGroup) {
                        btnGroup.querySelectorAll('.btn').forEach(btn => {
                            btn.classList.remove('border-danger');
                        });
                    }
                }
            });
        });
    });
}
