const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/yellowApp', {
	useNewUrlParser: true,
});

let User = {
	nickname: String,
	name: String,
	email: {
		type: String,
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		require: true,
		select: false,
	},
	// role -> 0 : user / 1 : colaborator
	role: Number,
	createdAt: {
		type: Date,
		default: Date.now,
	},
};

module.exports = {
	Mongoose: mongoose,
	User: User,
};
