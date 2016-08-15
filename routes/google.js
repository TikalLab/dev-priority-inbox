var express = require('express');
var router = express.Router();
var util = require('util');
var config = require('config');
var url = require('url');
var async = require('async');
var request = require('request');
var _ = require('underscore');
var base64 = require('base-64')
var atob = require('atob')
var emailAddresses = require('email-addresses')

var githubAPI = require('../app_modules/github')
var githubSender = require('../senders/github')

var errorHandler = require('../app_modules/error');

router.get('/authorize',function(req,res,next){
	var redirect = {
		protocol: 'https',
		host: 'accounts.google.com',
		pathname: '/o/oauth2/v2/auth',
		query: {
			client_id: config.get('google.client_id'),
			redirect_uri: 'http://' + config.get('google.redirect_domain') + '/google/authorized',
			scope: 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.modify',
			response_type: 'code',
			access_type: 'offline',
			approval_prompt: 'force'
		}
	}
	res.redirect(url.format(redirect));
})

router.get('/authorized',function(req,res,next){
	async.waterfall([
 	    // switch the code for access token             
 		function(callback){
 			var form = {
 				client_id: config.get('google.client_id'),
 				client_secret: config.get('google.client_secret'),
 				code: req.query.code,
 				redirect_uri: 'http://' + config.get('google.redirect_domain') + '/google/authorized',
 				grant_type: 'authorization_code'
 			}
 			request.post('https://www.googleapis.com/oauth2/v4/token',{form: form},function(error,response,body){
 				if(error){
 					callback(error);
 				}else if(response.statusCode > 300){
 					callback(response.statusCode + ' : ' + body);
 				}else{
 					var data = JSON.parse(body);
console.log('got from googile: %s',body) 	
 					var accessToken = data.access_token;
					var refreshToken = data.refresh_token;
 					callback(null,accessToken,refreshToken);
 				}
 			});
 		},
 		// get the google user record
 		function(accessToken,refreshToken,callback){
 			var headers = {
 				Authorization: 'Bearer ' + accessToken	
 			}
 			request('https://www.googleapis.com/plus/v1/people/me',{headers: headers},function(error,response,body){
 				if(error){
 					callback(error);
 				}else if(response.statusCode > 300){
 					callback(response.statusCode + ' : ' + body);
 				}else{
 					var profile = JSON.parse(body);
console.log('profile is %s',util.inspect(profile))
 					callback(null,accessToken,refreshToken,profile);
 				}
 			});
 		},
 		// add a watch to their gmail to send push to our app 
 		function(accessToken,refreshToken,profile,callback){
 			var headers = {
 				Authorization: 'Bearer ' + accessToken,
 				'Content-type': 'application/json'
 			}
 			var form = {
 				topicName: config.get('google.topic'),
 				labelIds: ['INBOX'],
 				labelFilterAction: 'include'
 			}
 			request.post('https://www.googleapis.com/gmail/v1/users/' + profile.id + '/watch',{headers: headers, body: JSON.stringify(form)},function(error,response,body){
 				if(error){
 					callback(error);
 				}else if(response.statusCode > 300){
 					console.log(response.statusCode + ' : ' + body)
 					
 					callback(response.statusCode + ' : ' + body);
 				}else{
 					var watch = JSON.parse(body);
console.log('profile is %s',util.inspect(watch))
 					callback(null,accessToken,refreshToken,profile,watch);
 				}
 			});
 		},
 		// insert/update the user record to db
 		function(accessToken,refreshToken,profile,watch,callback){
 			var users = req.db.get('users');
 			var email = profile.emails[0].value;
 			var google = {
 				refresh_token: refreshToken,
 				id: profile.id,
 				display_name: profile.displayName,
 				name: profile.name,
 				avatar_url: profile.image.url,
 				watch: watch
 			}
 			
 			var updateSet = {
				$setOnInsert: {
					email: email,
					created_at: new Date(),
					google: google
	 			},
 			}
 			
 			
 			
 			users.findAndModify({
 				'google.id': google.id
 			},updateSet,{
 				upsert: true,
 				new: true
 			},function(err,user){
 				callback(err,user,accessToken)
 			});
 		},
 		function(user,accessToken,callback){
 			if('labels' in user.google){
 				callback(null,user)
 			}else{
				async.waterfall([
	 		 		// create the folders
	 		 		function(callback){
	 		 			var headers = {
	 		 				Authorization: 'Bearer ' + accessToken,
	 		 				'Content-type': 'application/json'
	 		 			}
	 		 			var form = {
	 		 				name: config.get('app.label_name')
	 		 			}
	 		 			request.post('https://www.googleapis.com/gmail/v1/users/' + user.google.id + '/labels',{headers: headers, body: JSON.stringify(form)},function(error,response,body){
	 		 				if(error){
	 		 					callback(error);
	 		 				}else if(response.statusCode == 409){
	 		 					// this means label already exists
	 		 					callback(null,null);
	 		 				}else if(response.statusCode > 300){
	 		 					console.log(response.statusCode + ' : ' + body)
	 		 					callback(response.statusCode + ' : ' + body);
	 		 				}else{
	 		 					var dpiImportantLabel = JSON.parse(body);
	 		console.log('dpiImportantLabel is %s',util.inspect(dpiImportantLabel))
	 		 					callback(null,dpiImportantLabel);
	 		 				}
	 		 			});
	 		 		},
				 				                 
				],function(err,dpiImportantLabel){
 					if(err){
 						callback(err)
 					}else{
 						var users = req.db.get('users');
 						users.findAndModify({
 							_id: user._id.toString()
 						},{
 							$set:{
 								'google.labels' : {
 									important: dpiImportantLabel,
 								}
 							}
 						},{
 							new: true
 						},function(err,user){
 							callback(err,user)
 						})
 					}
 				})
 				
 			}
 		}
 		
 	],function(err,user){
 		if(err){
 			errorHandler.error(req,res,next,err);
 		}else{
 			req.session.user = user;
 			var next = req.session.afterReconnectGoTo;
 			delete req.session.afterReconnectGoTo;
 			if(!next){
 				next = '/';
 			}
 			res.redirect(next);
 		}
 	});
})

router.post('/push',function(req,res,next){
	
	res.sendStatus(200)
	
	var data = JSON.parse(atob(req.body.message.data))
	console.log('data is %s',util.inspect(data))

	async.waterfall([
		function(callback){
			var users = req.db.get('users');
			users.findOne({email: data.emailAddress},function(err,user){
				callback(err,user)
			})
		},	
		// refresh token
		function(user,callback){
			if(!user){
				callback('user wasnt found')
			}else{
				var form = {
					client_id: config.get('google.client_id'),
					client_secret: config.get('google.client_secret'),
					grant_type: 'refresh_token',
					refresh_token: user.google.refresh_token,
				};
				request.post('https://www.googleapis.com/oauth2/v4/token',{form: form},function(error,response,body){
					if(error){
						callback(error,null);
					}else if(response.statusCode != 200){
						callback(response.statusCode + ' : ' + body);
					}else{
						var result = JSON.parse(body);
	console.log('got refershed token: %s',result.access_token)					
						callback(null,user,result.access_token);
					}
					
				})
				
			}
		
		},
		// get history
		function(user,accessToken,callback){
			var headers = {
 				Authorization: 'Bearer ' + accessToken,
 				'Content-type': 'application/json'
 			}
			var form = {
				startHistoryId : user.google.last_processed_history_id ? user.google.last_processed_history_id  : user.google.watch.historyId
			}
//console.log('message id is %s',req.body.message.message_id)			
 			request('https://www.googleapis.com/gmail/v1/users/' + user.google.id + '/history',{headers: headers,qs: form},function(error,response,body){
 				if(error){
 					callback(error);
 				}else if(response.statusCode > 300){
 					console.log(response.statusCode + ' : ' + body)
 					
 					callback(response.statusCode + ' : ' + body);
 				}else{
 					var history = JSON.parse(body);
console.log('history is %s',util.inspect(history,{depth:8}))			
 					callback(null,user,accessToken,history);
 				}
 			});			
		},	
		// go through all messages in history and process if needed
		function(user,accessToken,history,callback){
			if(!('history') in history){
				callback(null,user,history)
			}else{
				async.each(history.history,function(historyItem,callback){
					if(!('messagesAdded' in historyItem)){
						callback()
					}else{
						async.each(historyItem.messagesAdded,function(messageAdded,callback){
							if(_.contains(messageAdded.message.labelIds,'INBOX')){
								console.log('found a new message!')
								// TBD process it
								processInboxMessage(user,accessToken,messageAdded.message,function(err){
									callback(err)
								})
							}else{
								callback()
							}
						},function(err){
							callback(err)
						})
					}
				},function(err){
					callback(err,user,accessToken,history)
				})
			}
		},
		// got so far? update the history in user record so we wont repeat it next itteration
		function(user,history,accessToken,callback){
			var users = req.db.get('users');
			users.update({_id: user._id.toString()},{$set:{'google.last_processed_history_id' : data.historyId}},function(err,ok){
				callback(err)
			})
		},
	],function(err){
		if(err == 'user wasnt found'){
//			res.sendStatus(200) // quiet ggole
		}else if(err){
			console.log('err is %s',err)
//			res.sendStatus(500)
		}else{
//			console.log('message is %s',util.inspect(history,{depth:8}));
//			res.sendStatus(200)
		}
	})
	
	
	
})


function processInboxMessage(user,accessToken,message,callback){
	async.waterfall([
		function(callback){
			var headers = {
				Authorization: 'Bearer ' + accessToken,
				'Content-type': 'application/json'
			}
			request('https://www.googleapis.com/gmail/v1/users/' + user.google.id + '/messages/' + message.id,{headers: headers},function(error,response,body){
				if(error){
					callback(error);
				}else if(response.statusCode > 300){
					console.log(response.statusCode + ' : ' + body)
					
					callback(response.statusCode + ' : ' + body);
				}else{
					var message = JSON.parse(body);
					callback(null,message);
				}
			});			
		},
		function(message,callback){
			
			var fromHeader  = _.find(message.payload.headers,function(header){
				return header.name == 'From'
			});
			var fromEmail = emailAddresses.parseOneAddress(fromHeader.value).address
console.log('email is from %s',fromEmail)			
			if(fromEmail == 'notifications@github.com'){
console.log('email is %s',util.inspect(message,{depth:8}))			
//				githubSender.process(user.github.access_token,atob(message.payload.parts[0].body.data),function(err,isImportant){
				githubSender.process(user.github.access_token,atob(message.payload.parts[1].body.data),function(err,isImportant){
					if(err){
						callback(err)
					}else{
						if(isImportant){
							labelMessage(user,accessToken,message,isImportant,callback)
						}else{
							callback()
						}
					}
				})
			}else{
				callback(null,message)
			}
			
		}
	],function(err){
		callback(err)
	})
}


function labelMessage(user,accessToken,message,isImportant,callback){
	
	var labelID = user.google.labels.important.id;
	
	var headers = {
		Authorization: 'Bearer ' + accessToken,
		'Content-type': 'application/json'
	}
	var form = {
		addLabelIds: [labelID]	
	}
	request.post('https://www.googleapis.com/gmail/v1/users/' + user.google.id + '/messages/' + message.id + '/modify',{headers: headers, body: JSON.stringify(form)},function(error,response,body){
		if(error){
			callback(error);
		}else if(response.statusCode > 300){
			console.log(response.statusCode + ' : ' + body)
			
			callback(response.statusCode + ' : ' + body);
		}else{
			var message = JSON.parse(body);
			callback(null);
		}
	});		
}
module.exports = router;
