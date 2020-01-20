const graphql = require('graphql');
const db = require('../models');
const User = db.Mongoose.model('usercollection', db.User, 'usercollection');
const ChatRoom = db.Mongoose.model('chatroom', db.ChatRoom, 'chatroom');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.json');

function generateToken(params = {}) {
	return jwt.sign(params, authConfig.secret, {});
}

const {
	GraphQLBoolean,
	GraphQLNonNull,
	GraphQLString,
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLID,
	GraphQLList,
	GraphQLError,
	GraphQLInt,
} = graphql;

const UserType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		nickname: { type: GraphQLString },
		email: { type: GraphQLString },
		role: { type: GraphQLInt },
		token: { type: GraphQLString },
	}),
});

const ChatType = new GraphQLObjectType({
	name: 'Chat',
	fields: () => ({
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		creator: {
			type: UserType,
		},
		colaborator: { type: UserType },
	}),
});

// const Message = new GraphQLObjectType({
// 	message: { type: GraphQLString },
// 	emissor: { type: UserType },
// });

const RootQuery = new GraphQLObjectType({
	name: 'RootQuery',
	fields: {
		login: {
			type: UserType,
			args: { email: { type: GraphQLString }, password: { type: GraphQLString } },
			async resolve(parent, args) {
				const user = await User.findOne({ email: args.email }).select('+password');

				if (!user) {
					throw new GraphQLError({ message: 'Usuário não encontrado' });
				} else if (!(await bcrypt.compare(args.password, user.password))) {
					throw new GraphQLError({ message: 'Senha incorreta' });
				} else {
					let returnUser = {
						id: user.id,
						name: user.name,
						email: user.email,
						password: user.password,
						nickname: user.nickname,
						role: user.role,
						token: generateToken({ id: user.id }),
					};
					return returnUser;
				}
			},
		},
	},
});

const Mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		register: {
			type: UserType,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
				email: { type: new GraphQLNonNull(GraphQLString) },
				password: { type: new GraphQLNonNull(GraphQLString) },
				nickname: { type: new GraphQLNonNull(GraphQLString) },
				role: { type: new GraphQLNonNull(GraphQLInt) },
			},
			async resolve(parent, args) {
				//
				try {
					let user = await User.create({
						name: args.name,
						email: args.email,
						password: args.password,
						nickname: args.nickname,
						role: args.role,
					});
					let returnUser = {
						id: user.id,
						name: user.name,
						email: user.email,
						password: user.password,
						nickname: user.nickname,
						role: user.role,
						token: generateToken({ id: user.id }),
					};
					return returnUser;
				} catch (e) {
					throw new GraphQLError(e);
				}
			},
		},
		createChat: {
			type: ChatType,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
				creator: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(parent, args) {
				try {
					let chatRoom = await ChatRoom.create({
						name: args.name,
						creator: args.creator,
					});
					let createdChat = ChatRoom.findById(chatRoom._id).populate({
						path: 'creator',
						model: User,
					});
					let returnChat = {
						id: createdChat._id,
						name: createdChat.name,
						creator: createdChat.creator,
					};
					return returnChat;
				} catch (e) {
					throw new GraphQLError(e);
				}
			},
		},
	},
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation,
});
