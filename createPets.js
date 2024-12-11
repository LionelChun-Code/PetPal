const mongoose = require('mongoose');
const Pet = require('./models/pet'); // 確保這裡的文件名是正確的
const User = require('./models/user');

const MONGODB_URI = 'mongodb://localhost/PetPal'; // 更換為你的 MongoDB 連接 URI
const PET_TYPES = ['cat', 'dog', 'rabbit', 'parrot'];
const IMAGES = ['cat.png', 'dog.png', 'rabbit.png', 'parrot.png']; // 假設有這些圖片文件

async function getRandomOwnerId() {
  const users = await User.find();
  const randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex]._id;
}

async function createPets(numberOfPets) {
  
  try {
    // 連接到 MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const pets = [];
    for (let i = 1; i <= numberOfPets; i++) {
      let petType = PET_TYPES[Math.floor(Math.random() * PET_TYPES.length)];
      const ownerId = await getRandomOwnerId();
      const pet = {
        name: `Pet${i}`,
        petType: petType,
        petAge: Math.floor(Math.random() * 15), // 假設寵物年齡在 0 到 15 歲之間
        ownerId: ownerId,
        description: `Description for Pet${i}`,
        // image: IMAGES[Math.floor(Math.random() * IMAGES.length)],
        image: `${petType}.png`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      pets.push(pet);
    }

    // 批量插入寵物數據
    await Pet.insertMany(pets);
    console.log(`${numberOfPets} pets created successfully.`);
  } catch (error) {
    console.error('Error creating pets:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 使用方法：將第二個參數設為你要生成的寵物數量
createPets(1024); // 輸入你希望生成的寵物數量
