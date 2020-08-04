const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema
(
	{
		userId: String,
		title: {type: String, required: true},
		url: {type: String, required: true}
	}
);



const Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed;