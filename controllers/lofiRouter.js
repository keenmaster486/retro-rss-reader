const express = require('express');
const router = express.Router();

const userController = require('./main/userController');
const authController = require('./main/authController');
const homeController = require('./main/homeController');
const feedController = require('./main/feedController');
const shimController = require('./main/shimController');


//Special route for home page:
router.get('/', function(req, res)
{
	res.redirect('/home');
});


router.use('/', express.static('public/lofi'));



router.use('/users', function(req, res, next)
{
	req.viewdir = 'lofi';
	next();
}, userController);

router.use('/auth', function(req, res, next)
{
	req.viewdir = 'lofi';
	next();
}, authController);

router.use('/home', function(req, res, next)
{
	req.viewdir = 'lofi';
	next();
}, homeController);

router.use('/feeds', function(req, res, next)
{
	req.viewdir = 'lofi';
	next();
}, feedController);

router.use('/shims', function(req, res, next)
{
	req.viewdir = 'lofi';
	next();
}, shimController);


module.exports = router;