document.addEventListener('DOMContentLoaded', function () {
  const profileForm = document.getElementById('profileForm');

  profileForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(profileForm);
    const messageElement = document.getElementById('message');

    try {
      const response = await fetch('/users/profile', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        messageElement.innerText = result.success;

        // 檢查 Avatar 圖像元素是否存在，並更新其 href 屬性
        // const avatarElement = document.querySelector('a[href*="/uploads/avatars/originals/"]');
        const avatarElement = document.querySelector('#avatar');
        if (avatarElement) {
          avatarElement.href = `/uploads/avatars/originals/${result.avatar}`;
        }

        // 檢查 Thumbnail 圖像元素是否存在，並更新其 src 屬性
        // const thumbnailElement = document.querySelector('img[src*="/uploads/avatars/thumbnails/"]');
        const thumbnailElement = document.querySelector('#thumbnail');
        if (thumbnailElement) {
          thumbnailElement.src = `/uploads/avatars/thumbnails/${result.avatar}`;
        }

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
