document.addEventListener('DOMContentLoaded', function () {
  const petForm = document.getElementById('petForm');

  petForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(petForm);
    const messageElement = document.getElementById('message');

    try {
      const response = await fetch('/pets/addPet', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        messageElement.innerText = result.success;
        messageElement.style.color = 'green';
        petForm.reset();
      } else if (result.errors) {
        messageElement.innerText = result.errors.map(error => error.msg).join(', ');
        messageElement.style.color = 'red';
      } else if (result.error) {
        messageElement.innerText = result.error;
        messageElement.style.color = 'red';
      }
    } catch (error) {
      messageElement.innerText = 'An error occurred: ' + error.message;
      messageElement.style.color = 'red';
    }
  });
});
