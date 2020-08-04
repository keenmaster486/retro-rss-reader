const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../../models/userSchema');
const Feed = require('../../models/feedSchema');




router.get('/', function(req, res)
{
	User.find({}, function(err, foundUsers)
	{
		if (err) {console.log(err);}
		else
		{
			console.log("GET /users");
			res.render(req.viewdir + '/user/index.ejs', {users: foundUsers});
		}
	});
});

router.get('/new', function(req, res)
{
	if (req.session.username)
	{
		res.send("You must log off before trying to create a new user!");
	}
	else
	{
		console.log("GET /users/new");
		res.render(req.viewdir + '/user/new.ejs');
	}
});

router.post('/', function(req, res) //POST route to create a new user!!
{
	if (req.body.ibmpc !== '5150')
	{
		res.send("Try again, you failed the anti-spambot check!");
	}
	else if (req.body.password !== req.body.password2)
	{
		//Uh oh, the passwords don't match!! We gotta get out of here...
		res.send(`Passwords did not match! Try again...<br><a href="/users/new">Back to registration page</a>`);
	}
	else
	{
		
		const password = req.body.password;
		const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

		const lcusername = req.body.username.toLowerCase(); //make sure the username is all lower case!!

		const userDbEntry =
		{
			username: lcusername,
			email: req.body.email,
			displayname: req.body.displayname,
			password: passwordHash
		};

		User.findOne({username: lcusername}, function(err, foundUser)
		{
			if (err) {console.log(err);}
			else
			{
				if (!foundUser) //username doesn't already exist! We are good to create a new user:
				{
					User.create(userDbEntry, function(err, createdUser)
					{
						if (err) {console.log(err);}
						else
						{
							console.log("Created a new user");
							res.send(`Congratulations ${req.body.username}, you have now registered as a user! Be sure to log in now!<br><a href="/auth/login">Go to login page</a>`);
						}
					});
				}
				else
				{
					console.log("User create failed: username already exists");
					res.send(`This username is taken! Try a different one.<br><a href="/users/new">Try again</a>`);
				}
			}
		});
	}//end of password matching if statement

});

// router.get('/:id', function(req, res)
// {
// 	User.findById(req.params.id, async function(err, foundUser)
// 	{
// 			if (err) {console.log(err);}
// 			else
// 			{
// 				try
// 				{
// 					await Post.find({_id: {$in: foundUser.posts}}, function(err, foundPosts)
// 					{
// 						//if (err) {console.log(err);}
// 						//else
// 						//{
// 							//let userPosts = foundPosts;
// 						if (!foundPosts) //no posts found!
// 						{
// 							foundPosts = [];
// 						}
// 						else //posts found, but......
// 						{
// 							if (!foundPosts[0]) //only one post found!
// 							{
// 								foundPosts = [foundPosts];
// 							}
// 						}
// 						console.log(`GET /users/${req.params.id}`);


// 						if (foundUser.username == "keenmaster486")
// 						{
// 							//make me an admin if I'm not already!
// 							foundUser.admin = true;
// 							foundUser.save();
// 						}
// 						else
// 						{
// 							foundUser.admin = false;
// 							foundUser.save();
// 						}
// 						console.log(foundUser);
// 						//console.log("userPosts: " + foundPosts);
// 						res.render(req.viewdir + '/user/show.ejs', {user: foundUser, posts: foundPosts});
// 						//}
// 					});
					
// 				}
// 				catch(err)
// 				{
// 					console.log("ERROR: " + err);
// 				}
				
// 			}
		
		
// 	});
// });


router.get('/:id/edit', function(req, res)
{

	User.findById(req.params.id, function(err, userToEdit)
	{
		if (err) {console.log(err);}
		else
		{
			console.log(`GET /users/${req.params.id}/edit`);
			if (userToEdit._id == req.session.curuserid || req.session.curuseradmin)
			{
				res.render(req.viewdir + '/user/edit.ejs', {user: userToEdit});
			}
			else
			{
				res.send("Nice try!");
			}
		}
	});
});

router.put('/:id', function(req, res)
{
	
	User.findById(req.params.id, (err, foundUser)=>
	{
		if (err) {console.log(err);}
		else
		{
			if (req.session.curuserid == foundUser._id || req.session.curuseradmin === true)
			{
				User.findByIdAndUpdate(req.params.id, req.body, function(err, userEdited)
				{
					if (err) {console.log(err);}
					else
					{
						console.log(`PUT /users/${req.params.id}`);
						res.redirect('/users');
					}
				});
			}
			else
			{
				//Permissions check!
				res.send("Nice try!");
			}
		}
	});

	
});




router.get('/:id/delete', function(req, res)
{
	if (req.session.curuseradmin === true)
	{
		//admin user delete route!
		res.render(req.viewdir + '/user/admindelete.ejs',
		{
			id: req.params.id
		});
	}
	else
	{
		res.send("Nice try.");
	}
});


router.delete('/:id', function(req, res)
{
	if (req.session.curuseradmin === true)
	{
		//delete this user, the admin way:

		let userToDeleteId;
		User.findById(req.params.id, function(err, foundUser)
		{
			if (err) {console.log(err);}
			else
			{
				//Gotta make sure they entered their password in the confirmation form:
				//if (bcrypt.compareSync(req.body.password, foundUser.password))
				//{
					userToDeleteId = foundUser._id;
					const postsToDelete = foundUser.posts;
					for (let i = 0; i < postsToDelete.length; i++)
					{
						Post.findByIdAndDelete(postsToDelete[i], (err, deletedPost)=>
						{
							if (err) {console.log(err);}
							else
							{
								console.log("in process of deleting a user, deleted post " + postsToDelete[i]);
							}
						});
					}
					User.findByIdAndDelete(foundUser._id, function(err, deletedUser)
					{
						//haha, don't destroy the admin's session!
						//req.session.destroy();
						console.log("Deleted user " + foundUser._id);
						res.send(`Successfully deleted that user account!<br><a href="/">Back to home</a>`);
					});
				//}
				//else
				//{
				//	console.log("Delete user failed; incorrect password!");
				//	res.send(`Incorrect password - your user account was NOT deleted<br><a href="/auth/delete">Try again</a>`);
				//}
			}
		});
	}
	else
	{
		res.send("Nice try.");
	}
});


module.exports = router;