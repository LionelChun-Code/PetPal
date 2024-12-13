const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');
const { createUpload, createThumbnail } = require('../middlewares/uploadImage');
const { deleteOldImage } = require('../middlewares/deleteOldImage');
const Pet = require('../models/pet');
const Paginator = require('../utils/paginator');
const mongoose = require('mongoose');


const petImageUpload = createUpload(process.env.PET_ORIGINAL_PATH, 'petImage');


router.get('/', async function (req, res, next) {
  return res.redirect('pets/1');
});


router.get('/my-pets', ensureAuthenticated, async function (req, res, next) {
  return res.redirect('/pets/my-pets/1');
});


router.get('/my-pets/:page', ensureAuthenticated, async function (req, res, next) {

  const db = req.app.locals.db;
  const collection = db.collection('pets');
  let page = parseInt(req.params.page);
  
  try {
    if (!mongoose.Types.ObjectId.isValid(req.session.user.id)) {
      return res.render('myPets', {title: 'My Pets', pets : []});
    }
    const id = new mongoose.Types.ObjectId(req.session.user.id);
    const rows = await collection.countDocuments({ ownerId: id });
    const paginator = new Paginator(rows, page, 4);

    let pets = await collection.find({  ownerId: id })
      .sort({ _id: -1 })
      .skip(paginator.getInfo().offset)
      .limit(paginator.getInfo().rowsPerPage)
      .toArray();
    console.log(`found users ${pets.length}`);
    res.render('myPets', { title: 'My Pets', pets, pageInfo: paginator.getInfo()});
  } catch (error) {
    console.error('Error while getting user:', error.message);
    res.status(400).json({ error: error.message });
  }
});


router.get('/add-pet', ensureAuthenticated, function (req, res, next) {
  res.render('addPet', { title: 'Add a New Pet' });
});


router.post('/addPet',
  ensureAuthenticated, petImageUpload, 
  (req, res, next) => createThumbnail(req, res, next, process.env.PET_THUMBNAIL_PATH),
  deleteOldImage(process.env.PET_ORIGINAL_PATH, process.env.PET_THUMBNAIL_PATH),
  async function (req, res, next) {

    const { name, petType, petAge, description } = req.body;

    try {
      const pet = new Pet({
        name,
        petType,
        petAge,
        description,
        ownerId: req.session.user.id,
        image: req.file.filename // 保存圖片文件名
      });
      await pet.save();
      res.json({ success: 'Pet added successfully', pet });
    } catch (error) {
      console.error(error);
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ error: errorMessages });
      }
      res.status(500).json({ error: 'An error occurred while adding pet' });
    }
  });


router.put('/:id', ensureAuthenticated, petImageUpload, 
  (req, res, next) => createThumbnail(req, res, next, process.env.PET_IMAGE_THUMBNAIL_PATH), 
  async function (req, res, next) {

  const { name, petType, petAge, description } = req.body;

  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    pet.name = name || pet.name;
    pet.petType = petType || pet.petType;
    pet.petAge = petAge || pet.petAge;
    pet.description = description || pet.description;
    if (req.file) {
      pet.image = req.file.filename;
    }
    await pet.save();
    res.json({ success: 'Pet updated successfully', pet });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errorMessages });
    }
    res.status(500).json({ error: 'An error occurred while updating pet' });
  }
});


router.delete('/:id', ensureAuthenticated, async function (req, res, next) {

  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    await Pet.deleteOne({ _id: pet._id });
    res.json({ success: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error occurred while deleting pet:', error);
    res.status(500).json({ error: 'An error occurred while deleting pet. Please try again later.' });
  }
});


router.get('/:page/:petType', async function (req, res, next) {

  let page = parseInt(req.params.page);
  let petType = req.params.petType ? req.params.petType : '';
  const db = req.app.locals.db;
  const collection = db.collection('pets');

  try {
    const rows = await collection.countDocuments({petType: petType});
    const paginator = new Paginator(rows, page, 16);
    let pets = await collection.find({petType: petType}).sort({_id: -1}).skip(paginator.getInfo().offset).limit(paginator.getInfo().rowsPerPage).toArray();
    res.render('pets', { title: 'Pets', pets, petType, pageInfo: paginator.getInfo() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching pets' });
  }
});


router.get('/:page', async function (req, res, next) {

  const db = req.app.locals.db;
  const collection = db.collection('pets');
  let page = parseInt(req.params.page);

  try {
    const rows = await collection.countDocuments();
    const paginator = new Paginator(rows, page, 16);
    let pets = await collection.find({}).sort({_id: -1}).skip(paginator.getInfo().offset).limit(paginator.getInfo().rowsPerPage).toArray();
    res.render('pets', { title: 'Pets', pets, petType: '', pageInfo: paginator.getInfo() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching pets' });
  }
});


module.exports = router;
