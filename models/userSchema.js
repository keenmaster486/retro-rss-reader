const mongoose = require('mongoose');

const userSchema = new mongoose.Schema
(
	{
		username: {type: String, required: true, unique: true},
		email: String,
		password: String,
		displayname: String,
		admin: Boolean,
		feeds: [{type: mongoose.Schema.Types.ObjectId, ref: 'Feed'}]
	}
);



const User = mongoose.model('User', userSchema);

module.exports = User;