const express = require('express');
const router = express.Router();

const userController = require('./main/userController');
const authController = require('./main/authController');
const homeController = require('./main/homeController');
const postController = require('./main/postController');


//Special route for home page:
router.get('/', function(req, res)
{
	res.redirect('/home');
});

router.use(express.static('public/normal'));




router.use('/users', function(req, res, next)
{
	req.viewdir = 'normal';
	next();
}, userController);

router.use('/auth', function(req, res, next)
{
	req.viewdir= 'normal'
	next();
}, authController);

router.use('/home', function(req, res, next)
{
	req.viewdir = 'normal';
	next();
}, homeController);


router.use('/posts', function(req, res, next)
{
	req.viewdir = 'normal';
	next();
}, postController);



module.exports = router;