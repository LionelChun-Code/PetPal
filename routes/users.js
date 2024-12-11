var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const { checkUpdatePassword } = require('../middlewares/validators');
const { hashPassword } = require('../utils/bcryptHelper');
const { ensureAuthenticated, ensureAdmin, ensureSuperadmin } = require('../middlewares/auth');
const { createUpload, createThumbnail } = require('../middlewares/uploadImage');
const { deleteOldImage } = require('../middlewares/deleteOldImage');
const User = require('../models/user');
const Paginator = require('../utils/paginator');
const ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');
const { render } = require('ejs');

// 定義 avatarUpload
const avatarUpload = createUpload(process.env.AVATAR_ORIGINAL_PATH, 'newAvatar');

// 獲取錯誤信息的輔助函數
const getErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array();
  }
  return null;
};

/* GET users listing. */
router.get('/', async function (req, res, next) {
  // const db = req.app.locals.db; // 獲取數據庫實例 
  // try {
  //   let users = await db.collection('users').find({}).sort({ _id: -1 }).toArray();

  //   console.log(users);
  //   // console.log(result);
  //   if (users) {
  //     return res.render('users', { title: 'All Users', users });
  //   }
  // } catch (error) {
  //   res.json(error);
  // } finally {
  //   console.log("close..................");
  // }
  console.log('......................................');
  return res.redirect('users/1');
});


router.get('/dashboard', ensureAuthenticated, function (req, res, next) {
  res.render('dashboard', { title: 'Dashboard', user: req.session.user });
});

router.get('/manageusers', ensureAuthenticated, async function (req, res, next) {
  // try {
  //   const users = await User.find();
  //   res.render('manageUsers', { title: 'Manage Users', users });
  // } catch (error) {
  //   console.error('An error occurred while fetching users:', error);
  //   res.status(500).json({ error: 'An error occurred while fetching users. Please try again later.' });
  // }
  return res.redirect('manageusers/1');
});

router.get('/manageusers/:page', ensureAuthenticated, async function (req, res, next) {

  console.log('-----------------------------------------');
  const db = req.app.locals.db; // 獲取數據庫實例 
  const collection = db.collection('users');

  let page = parseInt(req.params.page);
  console.log(page);

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

/* GET user settings page. */
router.get('/settings', ensureAuthenticated, function (req, res, next) {
  res.render('settings', { title: 'Settings' });
});

router.get('/:page/:id', async function (req, res, next) {
  console.log('-----------------------------------------');

  const db = req.app.locals.db;
  const collection = db.collection('users');

  let page = parseInt(req.params.page);
  console.log(`Requested page number: ${page}`);

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // throw new Error('Invalid ID format');
      return res.render('users', {title: 'Users',users : []});
    }

    const id = new mongoose.Types.ObjectId(req.params.id);
    console.log(`objectId: ${id}`);

    const rows = await collection.countDocuments({ _id: id });
    console.log(`Total number of documents found: ${rows}`);

    const paginator = new Paginator(rows, page);

    let users = await collection.find({ _id: id })
      .sort({ _id: -1 })
      .skip(paginator.getInfo().offset)
      .limit(paginator.getInfo().rowsPerPage)
      .toArray();
    console.log(`found users ${users.length}`);

    if (users.length === 0) {
      res.render({}, { title: 'No Users Found' });
    } else {
      res.render('users', { title: 'Users', users, pageInfo: paginator.getInfo()});
    }
  } catch (error) {
    console.error('Error while getting user:', error.message);
    res.status(400).json({ error: error.message });
  } finally {
    console.log("close..................");
  }
});

// router.get('/:page/:id', async function (req, res, next) {

//   console.log('-----------------------------------------');
//   const db = req.app.locals.db;
//   const collection = db.collection('users');

//   let page = parseInt(req.params.page);
//   const id = new ObjectId(req.params.id);
//   //const id = new mongoose.Types.ObjectId(req.params.id);
//   try {
//     const rows = await collection.countDocuments({ _id: id });
//     const paginator = new Paginator(rows, page);
//     let users = await collection.find({ _id: id }).sort({ _id: -1 }).skip(paginator.getInfo().offset).limit(paginator.getInfo().rowsPerPage).toArray();
//     if (!users) {
//       res.render({});
//     } else {
//       res.render('users', { title: 'Users', users, pageInfo: paginator.getInfo() });
//     }
//   } catch (error) {
//     res.json(error);
//   } finally {
//     console.log("close..................");
//   }
// });

router.get('/:page', async function (req, res, next) {

  const db = req.app.locals.db;
  const collection = db.collection('users');

  let page = parseInt(req.params.page);
  try {
    const rows = await collection.countDocuments();
    const paginator = new Paginator(rows, page);
    console.log('*****************************************************');
    console.log(paginator.getInfo())
    console.log('*****************************************************');
    let users = await collection.find({}).sort({ _id: -1 }).skip(paginator.getInfo().offset).limit(paginator.getInfo().rowsPerPage).toArray();
    if (!users) {
      res.render({})
    } else {
      res.render('users', { title: 'Users', users, pageInfo: paginator.getInfo() });
    }
  } catch (error) {
    res.json(error);
  } finally {
    console.log("close..................");
  }
});


/* POST settings form to update password. */
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

/* POST profile form to update user details and upload avatar. */
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
    user.isDormant = !!isDormant; // 更新休眠狀態

    // 如果有上傳新的 avatar，更新 avatar
    if (req.file) {
      user.avatar = req.file.filename; // 只存儲文件名
    }

    await user.save();
    req.session.user = { ...req.session.user, email, username, avatar: user.avatar, isDormant: user.isDormant };

    return res.json({ success: 'Profile updated successfully!', avatar: user.avatar });
  } catch (error) {
    console.error(error);
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

    // 防止用戶修改自己的角色
    if (user.role.toUpperCase() === 'Super Admin'.toUpperCase()) {
      return res.status(403).json({ error: 'The super admin cannot be changed to be activated or not.' });
    }

    user.isActivated = true; // 設置帳號為停用
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

    // 防止用戶修改自己的角色
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

    // 防止Super Admin停用Super Admin
    if (user.role.toUpperCase() === 'Super Admin'.toUpperCase()) {
      return res.status(403).json({ error: 'The super admin cannot be changed to be activated or not.' });
    }

    user.isActivated = false; // 設置帳號為停用
    await user.save();
    return res.json({ success: 'User account deactivated successfully' });
  } catch (error) {
    console.error('Error occurred while deactivating user:', error);
    return res.status(500).json({ error: 'An error occurred while deactivating user. Please try again later.' });
  }
});

module.exports = router;
