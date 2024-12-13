const fs = require('fs').promises;
const path = require('path');
const User = require('../models/user');


function deleteOldImage(originalPath, thumbnailPath) {
  return async function (req, res, next) {
    try {
      const userId = req.session.user.id;
      const user = await User.findById(userId);

      console.log('**********************');

      // 檢查是否上傳了新圖片且用戶有舊的 avatar
      console.log(`${req.file} && ${user.avatar}`)
      if (req.file && user.avatar) {
        const originalImagePath = path.join(__dirname, '../', originalPath, user.avatar);
        const thumbnailImagePath = path.join(__dirname, '../', thumbnailPath, user.avatar);

        console.log('Original Image Path:', originalImagePath);
        console.log('Thumbnail Image Path:', thumbnailImagePath);

        const deleteFile = async (filePath, type) => {
          try {
            await fs.unlink(filePath);
            console.log(`Deleted ${type} image:`, filePath);
          } catch (err) {
            if (err.code === 'ENOENT') {
              console.log(`${type} image does not exist:`, filePath);
            } else {
              console.error(`Failed to delete ${type} image:`, err);
            }
          }
        };
        
        await deleteFile(originalImagePath, 'original');
        await deleteFile(thumbnailImagePath, 'thumbnail');
      }
      next(); // 繼續下一個中間件或路由處理程序
    } catch (error) {
      console.error('Failed to delete old images:', error);
      next(); // 繼續下一個中間件或路由處理程序，即使出現錯誤
    }
  };
}

module.exports = { deleteOldImage };
