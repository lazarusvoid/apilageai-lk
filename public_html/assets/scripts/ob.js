document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.onboard-step');
    const dots = document.querySelectorAll('.onboard-progress-dot');
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const continueBtn = document.getElementById('continue-btn');
    const lightbox = document.getElementById('onboarding-lightbox');
    const errorMessage = document.getElementById('error-message');
    const form = document.getElementById('onboarding-form');
    const interestsInput = document.getElementById('interests-hidden-input');
    const preferenceInput = document.getElementById('preference-hidden-input');

    let currentStep = 0;
    const selectedInterests = new Set();
    let selectedPreference = null;

    const showStep = (stepIndex) => {
        steps.forEach((step, index) => step.classList.toggle('active', index === stepIndex));
        dots.forEach((dot, index) => dot.classList.toggle('active', index === stepIndex));
        backBtn.classList.toggle('invisible', stepIndex === 0);
        nextBtn.classList.toggle('hidden', stepIndex === steps.length - 1);
        continueBtn.classList.toggle('hidden', stepIndex !== steps.length - 1);
        errorMessage.textContent = '';
    };

    const validateStep = (stepIndex) => {
        errorMessage.textContent = '';
        if (stepIndex === 0) {
            const schoolInput = document.getElementById('school-input');
            const notStudentCheckbox = document.getElementById('not-student-checkbox');
            if (!schoolInput.value.trim() && !notStudentCheckbox.checked) {
                errorMessage.textContent = 'Please provide an answer to continue.';
                return false;
            }
        }
        if (stepIndex === 1 && selectedInterests.size < 3) {
            errorMessage.textContent = 'Please select at least 3 interests.';
            return false;
        }
        if (stepIndex === 2 && !selectedPreference) {
            errorMessage.textContent = 'Please choose a personality.';
            return false;
        }
        return true;
    };

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep) && currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        }
    });

    backBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    });

    continueBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        const data = {
            school: form.school.value,
            not_student: form.not_student.checked ? 1 : 0,
            interests: interestsInput.value,
            preference: preferenceInput.value
        };

        fetch('https://apilageai.lk/save_onboarding.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                lightbox.classList.remove('visible'); // hide lightbox after completion
            } else {
                alert(response.message || 'Failed to save onboarding data.');
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error saving onboarding data.');
        });
    });

    // Interests selection
    document.querySelectorAll('.onboard-focus-card').forEach(card => {
        card.addEventListener('click', () => {
            const interest = card.dataset.interest;
            if (selectedInterests.has(interest)) {
                selectedInterests.delete(interest);
                card.classList.remove('selected');
            } else {
                selectedInterests.add(interest);
                card.classList.add('selected');
            }
            interestsInput.value = Array.from(selectedInterests).join(',');
            const remaining = 3 - selectedInterests.size;
            document.getElementById('focus-area-subtitle').textContent = remaining > 0 ? `Select ${remaining} more ${remaining === 1 ? 'area' : 'areas'}.` : "Great! You're ready to continue.";
        });
    });

    // Preference selection
    document.querySelectorAll('.onboard-preference-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedPreference = card.dataset.preference;
            preferenceInput.value = selectedPreference;
            document.querySelectorAll('.onboard-preference-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
    });

    // AUTO POPUP: show lightbox only if onboard_complete = 0
    fetch('https://apilageai.lk/check_onboarding.php')
        .then(res => res.json())
        .then(data => {
            if (data && data.completed === false) {
                lightbox.classList.add('visible');
            } else {
                lightbox.classList.remove('visible');
            }
        })
        .catch(err => {
            console.error('Check onboarding error:', err);
            lightbox.classList.remove('visible');
        });

    showStep(currentStep);
});
