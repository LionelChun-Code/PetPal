document.addEventListener('DOMContentLoaded', function () {
  const settingsForm = document.getElementById('settingsForm');

  settingsForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirm_password = document.getElementById('confirm_password').value;
    const messageElement = document.getElementById('message');

    // 簡單的客戶端驗證
    if (password !== confirm_password) {
      messageElement.innerText = 'Passwords do not match';
      return;
    }

    try {
      const response = await fetch('/users/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, confirm_password }),
      });

      const result = await response.json();

      if (result.success) {
        messageElement.innerText = result.success;
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
