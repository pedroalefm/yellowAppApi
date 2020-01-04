const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/yellowApp', {
	useNewUrlParser: true,
});
const bcrypt = require('bcryptjs');

let User = new mongoose.Schema({
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
});

let ChatRoom = new mongoose.Schema({
	createdAt: {
		type: Date,
		default: Date.now,
	},
	creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	colaborator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

let Message = new mongoose.Schema({
	emissor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	message: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	chatroom: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' },
});

User.pre('save', async function(next) {
	const hash = await bcrypt.hash(this.password, 10);
	this.password = hash;

	next();
});

module.exports = {
	Mongoose: mongoose,
	User: User,
	ChatRoom: ChatRoom,
	Message: Message,
};
