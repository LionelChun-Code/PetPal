const express = require('express');
const router = express.Router();


router.get('/', function (req, res, next) {
  res.render('index', { title: 'PetPal Home' });
});


router.get('/about', function (req, res, next) {
  res.render('about', { title: 'About' });
});


router.get('/contact', function (req, res, next) {
  res.render('contact', { title: 'Contact Us' });
});


module.exports = router;
