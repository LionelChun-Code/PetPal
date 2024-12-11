const mongoose = require('mongoose');
const User = require('./models/user');
const { hashPassword } = require('./utils/bcryptHelper');

const MONGODB_URI = 'mongodb://localhost/PetPal'; // 替換為你的 MongoDB 連接 URI
const DEFAULT_PASSWORD = '11111111';

async function createUsers(numberOfUsers) {
  try {
    // 連接到 MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 創建用戶數據
    const users = [];
    for (let i = 1; i <= numberOfUsers; i++) {
      const user = {
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashPassword(DEFAULT_PASSWORD),
        avatar: '',
        role: 'User',
        isActivated: true,
        isDormant: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      users.push(user);
    }

    // 批量插入用戶
    await User.insertMany(users);
    console.log(`${numberOfUsers} users created successfully.`);
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 使用方法：將第二個參數設為你要生成的用戶數量
createUsers(128); // 輸入你希望生成的用戶數量
