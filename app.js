const express = require('express');
// const graphqlHTTP = require('express-graphql');
// const GraphQLSchema = './schema';
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/yellowApp');
mongoose.connection.once('open', () => {
	console.log('conectado ao banco');
});

app.listen(400, () => console.log('server running on port 4000'));
