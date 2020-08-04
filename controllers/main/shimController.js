const express = require('express');
const router = express.Router();

const jimp = require('jimp');

router.get('/img/small/:url', (req, res) => {
	console.log(`GET /shims/img/${req.params.url}`);
	jimp.read({
		url: req.params.url
	}).then((image) => {
		image.resize(jimp.AUTO, 240);
		image.getBuffer(jimp.MIME_JPEG, (err, buffer) => {
			res.contentType('image/jpeg');
			res.send(buffer);
		});
	}).catch((err) => {
		console.log(err);
		res.send(err);
	});
});

router.get('/img/orig/:url', (req, res) => {
	console.log(`GET /shims/img/${req.params.url}`);
	jimp.read({
		url: req.params.url
	}).then((image) => {
		image.getBuffer(jimp.MIME_JPEG, (err, buffer) => {
			res.contentType('image/jpeg');
			res.send(buffer);
		});
	}).catch((err) => {
		console.log(err);
		res.send(err);
	});
});




module.exports = router;