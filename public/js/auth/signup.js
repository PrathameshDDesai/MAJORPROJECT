// ==================== SIGNUP PAGE JAVASCRIPT ====================

document.addEventListener('DOMContentLoaded', function () {

    // ==================== FORM VALIDATION ====================
    const form = document.querySelector('.signup-form');

    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    }, false);

    // ==================== PASSWORD TOGGLE ====================
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;

            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // ==================== ROLE SELECTION ====================
    const roleOptions = document.querySelectorAll('.role-option');
    const ownerDetails = document.getElementById('owner-details');
    const ownerInputs = ownerDetails ? ownerDetails.querySelectorAll('input, textarea') : [];

    roleOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Remove active class from all options
            roleOptions.forEach(opt => opt.classList.remove('active'));

            // Add active class to clicked option
            this.classList.add('active');

            // Check the radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;

                // Toggle extra fields based on role
                if (radio.value === 'Owner') {
                    ownerDetails.classList.remove('d-none');
                    ownerInputs.forEach(input => input.setAttribute('required', 'true'));
                } else {
                    ownerDetails.classList.add('d-none');
                    ownerInputs.forEach(input => input.removeAttribute('required'));
                }
            }
        });
    });
});
