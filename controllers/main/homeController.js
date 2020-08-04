const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');




router.get('/', function(req, res)
{
	console.log("GET /home");
	res.render(req.viewdir + '/home/index.ejs');
});

module.exports = router;