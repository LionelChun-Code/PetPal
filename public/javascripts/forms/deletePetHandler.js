document.addEventListener('DOMContentLoaded', function () {
  const petList = document.getElementById('petList');

  petList.addEventListener('click', async function (e) {
    if (e.target.classList.contains('delete-pet')) {
      const petId = e.target.dataset.id;
      const messageElement = document.getElementById('message');

      try {
        const response = await fetch(`/pets/${petId}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
          document.getElementById(`pet-${petId}`).remove();
          messageElement.innerText = 'Pet deleted successfully!';
          messageElement.style.color = 'green';
          alert('Pet deleted successfully!');
        } else if (result.error) {
          alert(result.error);
          messageElement.innerText = result.error;
          messageElement.style.color = 'red';
        }
      } catch (error) {
        alert('An error occurred: ' + error.message);
        messageElement.innerText = 'An error occurred: ' + error.message;
        messageElement.style.color = 'red';
      }
    }
  });
});
