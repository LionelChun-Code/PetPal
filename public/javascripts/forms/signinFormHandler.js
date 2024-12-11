document.addEventListener('DOMContentLoaded', function () {
  const signinForm = document.getElementById('signinForm');

  signinForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    try {
      const response = await fetch('/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.success);
        window.location.href = result.redirectUrl; // 重定向到 dashboard
      } else if (result.errors) {
        const errorMessages = result.errors.map(error => error.msg).join(', ');
        messageElement.innerText = errorMessages;
      } else if (result.error) {
        messageElement.innerText = result.error;
      }
    } catch (error) {
      messageElement.innerText = 'An error occurred: ' + error.message;
    }
  });
});
