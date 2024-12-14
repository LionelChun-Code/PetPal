document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signupForm');

  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    const messageElement = document.getElementById('message');
    
    if (password !== confirm_password) {
      messageElement.innerText = 'Passwords do not match.';
      return;
    }

    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirm_password }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.success);
        window.location.href = result.redirectUrl;
      } else if (result.errors) {
        messageElement.innerText = result.errors.map(error => error.msg).join(', ');
      } else if (result.error) {
        messageElement.innerText = result.error;
      }
    } catch (error) {
      messageElement.innerText = 'An error occurred: ' + error.message;
    }
  });
});
