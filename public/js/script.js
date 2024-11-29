
// JS FOR PASSWORD HIDE OR SHOW

function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const passwordIcon = document.querySelector('.toggle-password');
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      passwordIcon.textContent = '🙈';
    } else {
      passwordField.type = 'password';
      passwordIcon.textContent = '👁️';
    }
  }



  

// email verification if it contain 0207 or not //
document.getElementById('signupForm').addEventListener('submit', function(event) {
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const usernameError = document.getElementById('username-error');
  const emailError = document.getElementById('email-error');
  let isValid = true;

  // Check if email contains '0207'
  if (!emailInput.value.includes('0207')) {
    emailError.style.display = 'block';
    isValid = false;
} else {
    emailError.style.display = 'none';
}

// Prevent form submission if validation fails
if (!isValid) {
    event.preventDefault();
}
});
