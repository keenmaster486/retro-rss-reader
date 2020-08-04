const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
//const subDomain = require('express-subdomain');
const mongoose = require('mongoose');
const session = require('express-session');



require('dotenv').config();

const app = express();

require('./db/db');

const lofiRouter = require('./controllers/lofiRouter');
//const normalRouter = require('./controllers/normalRouter');

//app.use(subDomain('lofi', app))
app.use(methodOverride('_method'));
//app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: false}));
app.use(bodyParser.json({limit: '2mb'}));

app.use(session(
{
	//TODO: what should this secret string be?
	secret: process.env.SESSION_SECRET,
	resave: false, //only save if there has been a change
	saveUninitialized: false, //only save if we have mutated the session - this is what should be done for logins
	logged: false,
}));

app.use(function(req, res, next)
{
	if (!req.session.logged)
	{
		req.session.messages =
		{
			userwelcome: "You are not logged in"
		}
		req.session.curuserid = null;
		req.session.curuseradmin = false;
	}
	res.locals.session = req.session;
	next();
});




// app.use(subDomain('lofi', lofiRouter));
// app.use('/lofi', function(req, res)
// {
// 	//The following line will only work on the actual deployed Heroku app:
// 	res.redirect('http://lofi.classic-media.com');
// });

//Uncomment the following line for normal usage:
//app.use('/', normalRouter);

//Temporary, for forced lofi usage:
app.use('/', lofiRouter);



let port = process.env.PORT;
if (!process.env.PORT) {port = 3000;}

app.listen(port, function()
{
	console.log(`Server is listening on port ${port}`);
});