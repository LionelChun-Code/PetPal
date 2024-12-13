const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const { checkUpdatePassword } = require('../middlewares/validators');
const { hashPassword } = require('../utils/bcryptHelper');
const { ensureAuthenticated, ensureAdmin, ensureSuperadmin } = require('../middlewares/auth');
const { createUpload, createThumbnail } = require('../middlewares/uploadImage');
const { deleteOldImage } = require('../middlewares/deleteOldImage');
const User = require('../models/user');
const Paginator = require('../utils/paginator');
// const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');

const avatarUpload = createUpload(process.env.AVATAR_ORIGINAL_PATH, 'newAvatar');

const getErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array();
  }
  return null;
};


router.get('/', async function (req, res, next) {
  return res.redirect('users/1');
});


router.get('/dashboard', ensureAuthenticated, function (req, res, next) {
  res.render('dashboard', { title: 'Dashboard', user: req.session.user });
});


router.get('/manageusers', ensureAuthenticated, async function (req, res, next) {
  return res.redirect('manageusers/1');
});


router.get('/manageusers/:page', ensureAuthenticated, async function (req, res, next) {

  const db = req.app.locals.db; // 獲取數據庫實例 
  const collection = db.collection('users');
  let page = parseInt(req.params.page);

  try {
    const rows = await collection.countDocuments();
    const paginator = new Paginator(rows, page);
    let users = await collection.find({}).sort({ _id: -1 }).skip(paginator.getInfo().offset).limit(paginator.getInfo().rowsPerPage).toArray();
    res.render('manageUsers', { title: 'Manage Users', users, pageInfo: paginator.getInfo() });
  } catch (error) {
    console.error('An error occurred while fetching users:', error);
    res.status(500).json({ error: 'An error occurred while fetching users. Please try again later.' });
  }
});


router.get('/profile', ensureAuthenticated, function (req, res, next) {
  res.render('profile', { title: 'Profile', user: req.session.user });
});


router.get('/settings', ensureAuthenticated, function (req, res, next) {
  res.render('settings', { title: 'Settings' });
});


router.get('/:page/:id', async function (req, res, next) {

  const db = req.app.locals.db;
  const collection = db.collection('users');
  let page = parseInt(req.params.page);

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // throw new Error('Invalid ID format');
      return res.render('users', {title: 'Users',users : []});
    }

    const id = new mongoose.Types.ObjectId(req.params.id);
    const rows = await collection.countDocuments({ _id: id });
    const paginator = new Paginator(rows, page);
    let users = await collection.find({ _id: id })
      .sort({ _id: -1 })
      .skip(paginator.getInfo().offset)
      .limit(paginator.getInfo().rowsPerPage)
      .toArray();

    if (users.length === 0) {
      res.render({}, { title: 'No Users Found' });
    } else {
      res.render('users', { title: 'Users', users, pageInfo: paginator.getInfo()});
    }
  } catch (error) {
    console.error('Error while getting user:', error.message);
    res.status(400).json({ error: error.message });
  }

});


router.get('/:page', async function (req, res, next) {

  const db = req.app.locals.db;
  const collection = db.collection('users');

  let page = parseInt(req.params.page);
  try {
    const rows = await collection.countDocuments();
    const paginator = new Paginator(rows, page);
    let users = await collection.find({}).sort({ _id: -1 }).skip(paginator.getInfo().offset).limit(paginator.getInfo().rowsPerPage).toArray();
    res.render('users', { title: 'Users', users, pageInfo: paginator.getInfo() });

  } catch (error) {
    res.json(error);
  }

});


router.post('/settings', ensureAuthenticated, checkUpdatePassword, async function (req, res, next) {

  const errors = getErrors(req);
  
  if (errors) {
    return res.status(400).json({ errors });
  }

  const { password } = req.body;
  const hashedPassword = hashPassword(password);

  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);
    user.password = hashedPassword;
    await user.save();

    return res.json({ success: 'Password updated successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while updating password' });
  }
  
});


router.post('/profile', ensureAuthenticated, avatarUpload, (req, res, next) => createThumbnail(req, res, next, process.env.AVATAR_THUMBNAIL_PATH), deleteOldImage(process.env.AVATAR_ORIGINAL_PATH, process.env.AVATAR_THUMBNAIL_PATH), async function (req, res, next) {
  
  const errors = getErrors(req);
  
  if (errors) {
    return res.status(400).json({ errors });
  }

  const { email, username, isDormant } = req.body;

  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);
    user.email = email;
    user.username = username;
    user.isDormant = !!isDormant;

    if (req.file) {
      user.avatar = req.file.filename;
    }

    await user.save();
    req.session.user = { ...req.session.user, email, username, avatar: user.avatar, isDormant: user.isDormant };
    return res.json({ success: 'Profile updated successfully!', avatar: user.avatar });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errorMessages });
    }
    return res.status(500).json({ error: 'An error occurred while updating profile' });
  }

});


router.put('/activate/:id', ensureAuthenticated, ensureAdmin, async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role.toUpperCase() === 'Super Admin'.toUpperCase()) {
      return res.status(403).json({ error: 'The super admin cannot be changed to be activated or not.' });
    }

    user.isActivated = true;
    await user.save();
    return res.json({ success: 'User account activated successfully' });
  } catch (error) {
    console.error('Error occurred while activating user:', error);
    return res.status(500).json({ error: 'An error occurred while deactivating user. Please try again later.' });
  }

});


router.put('/change-role/:id', ensureAuthenticated, ensureSuperadmin, async function (req, res, next) {

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user._id.equals(req.session.user.id)) {
      return res.status(403).json({ error: 'Admins or higher cannot change their own roles.' });
    }

    const { role } = req.body;
    user.role = role;
    await user.save();
    console.log('User role changed successfully.');
    return res.json({ success: 'User role changed successfully' });
  } catch (error) {
    console.error('Error occurred while changing user role:', error);
    return res.status(500).json({ error: 'An error occurred while changing user role. Please try again later.' });
  }

});


router.put('/deactivate/:id', ensureAuthenticated, ensureAdmin, async function (req, res, next) {
  
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role.toUpperCase() === 'Super Admin'.toUpperCase()) {
      return res.status(403).json({ error: 'The super admin cannot be changed to be activated or not.' });
    }

    user.isActivated = false;
    await user.save();
    return res.json({ success: 'User account deactivated successfully' });
  } catch (error) {
    console.error('Error occurred while deactivating user:', error);
    return res.status(500).json({ error: 'An error occurred while deactivating user. Please try again later.' });
  }

});


module.exports = router;
