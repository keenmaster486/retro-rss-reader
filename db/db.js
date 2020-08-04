const mongoose = require('mongoose');

let connectionString = null;
if (!process.env.MONGODB_URI)
{
	connectionString = 'mongodb://localhost/retrohub';
}
else
{
	connectionString = process.env.MONGODB_URI;
}

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

mongoose.connection.on('connected', () => {
  console.log('mongoose connected to ', connectionString);
});

mongoose.connection.on('disconnected', () => {
  console.log('mongoose disconnected to ', connectionString);
});

mongoose.connection.on('error', (error) => {
  console.log('mongoose error ', error);
});