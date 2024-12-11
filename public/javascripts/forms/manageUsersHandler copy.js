document.addEventListener('DOMContentLoaded', function () {
  const userList = document.getElementById('userList');

  userList.addEventListener('click', async function (e) {
    if (e.target.classList.contains('deactivate-user')) {
      const userId = e.target.dataset.id;
      //const messageElement = document.getElementById('message');
      const messageElement = document.getElementById(`user-${userId}`).querySelector('.message');
      try {
        const response = await fetch(`/users/deactivate/${userId}`, {
          method: 'PUT'
        });

        const result = await response.json();

        if (result.success) {
          document.getElementById(`user-${userId}`).querySelector('.deactivate-user').disabled = true;
          document.getElementById(`user-${userId}`).querySelector('.activate-user').disabled = false;
          document.getElementById(`user-${userId}`).querySelector('.activation-status').innerText = 'false';
          messageElement.innerText = 'User account deactivated successfully!';
          messageElement.style.color = 'green';
        } else if (result.error) {
          messageElement.innerText = result.error;
          messageElement.style.color = 'red';
        }
      } catch (error) {
        messageElement.innerText = 'An error occurred: ' + error.message;
        messageElement.style.color = 'red';
      }
    }

    if (e.target.classList.contains('activate-user')) {
      const userId = e.target.dataset.id;
      // const messageElement = document.getElementById('message');
      const messageElement = document.getElementById(`user-${userId}`).querySelector('.message');
      try {
        const response = await fetch(`/users/activate/${userId}`, {
          method: 'PUT'
        });

        const result = await response.json();

        if (result.success) {
          document.getElementById(`user-${userId}`).querySelector('.activate-user').disabled = true;
          document.getElementById(`user-${userId}`).querySelector('.deactivate-user').disabled = false;
          document.getElementById(`user-${userId}`).querySelector('.activation-status').innerText = 'true';
          messageElement.innerText = 'User account activated successfully!';
          messageElement.style.color = 'green';
        } else if (result.error) {
          messageElement.innerText = result.error;
          messageElement.style.color = 'red';
        }
      } catch (error) {
        messageElement.innerText = 'An error occurred: ' + error.message;
        messageElement.style.color = 'red';
      }
    }
  });

  userList.addEventListener('change', async function (e) {
    if (e.target.classList.contains('change-role')) {
      const userId = e.target.dataset.id;
      const role = e.target.value;
      //const messageElement = document.getElementById('message');
      const messageElement = document.getElementById(`user-${userId}`).querySelector('.message');

      try {
        const response = await fetch(`/users/change-role/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role })
        });

        const result = await response.json();

        if (result.success) {
          messageElement.innerText = `User role changed to ${role} successfully!`;
          messageElement.style.color = 'green';
          document.getElementById(`user-${userId}`).querySelector('.role-status').innerText = `${role}`;
        } else if (result.error) {
          messageElement.innerText = result.error;
          messageElement.style.color = 'red';
        }
      } catch (error) {
        messageElement.innerText = 'An error occurred: ' + error.message;
        messageElement.style.color = 'red';
      }
    }
  });
});
