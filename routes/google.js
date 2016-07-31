//var express = require('express');
//var router = express.Router();
//var util = require('util');
//var config = require('config');
//var url = require('url');
//var async = require('async');
//var request = require('request');
//var _ = require('underscore');
//var async = require('async');
//var fs = require('fs');
//var path = require('path');
//
//module.exports = router;
//
//router.get('/authorize',function(req,res,next){
//	req.passport.authenticate('google', { scope: [
//      'https://www.googleapis.com/auth/plus.login',
//      'https://www.googleapis.com/auth/plus.profile.emails.read'
//    ] });
//})
//
//router.get('/authorized',function(req,res,next){
//	passport.authenticate('google', { failureRedirect: '/' }),
//	    res.redirect('/account');
//})
var express = require('express');
var router = express.Router();
var util = require('util');
var config = require('config');
var url = require('url');
var async = require('async');
var request = require('request');
var _ = require('underscore');
var base64 = require('base-64')
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
			response_type: 'code'
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
 					callback(null,accessToken);
 				}
 			});
 		},
 		// get the google user record
 		function(accessToken,callback){
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
 					callback(null,accessToken,profile);
 				}
 			});
 		},
 		// add a watch to their gmail to send push to our app 
 		function(accessToken,profile,callback){
 			var headers = {
 				Authorization: 'Bearer ' + accessToken,
 				'Content-type': 'application/json'
 			}
 			var form = {
 				topicName: config.get('google.topic')
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
 					callback(null,accessToken,profile,watch);
 				}
 			});
 		},
 		// insert/update the user record to db
 		function(accessToken,profile,watch,callback){
 			var users = req.db.get('users');
 			var email = profile.emails[0].value;
 			var google = {
 				id: profile.id,
 				display_name: profile.displayName,
 				name: profile.name,
 				access_token: accessToken,
 				avatar_url: profile.image.url,
 				watch: watch
 			}
 			
 			var updateSet = {
				$setOnInsert: {
					email: email,
					created_at: new Date()	
	 			},
 				$set: {
 					google: google, 
 				}	
 			}
 			
 			
 			
 			users.findAndModify({
 				'google.id': google.id
 			},updateSet,{
 				upsert: true,
 				new: true
 			},function(err,user){
 				callback(err,user)
 			});
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
	
	var data = JSON.parse(base64.decode(req.body.message.data))
	console.log('data is %s',util.inspect(data))

	async.waterfall([
		function(callback){
			var users = req.db.get('users');
			users.findOne({email: data.emailAddress},function(err,user){
console.log('user is %s',util.inspect(user))			
				callback(err,user)
			})
		},	  
		// get history
		function(user,callback){
			var headers = {
 				Authorization: 'Bearer ' + user.google.access_token,
 				'Content-type': 'application/json'
 			}
			var form = {
				startHistoryId : user.google.last_processed_history_id ? user.google.last_processed_history_id  : user.google.watch.historyId
			}
console.log('message id is %s',req.body.message.message_id)			
 			request('https://www.googleapis.com/gmail/v1/users/' + user.google.id + '/history',{headers: headers,qs: form},function(error,response,body){
 				if(error){
 					callback(error);
 				}else if(response.statusCode > 300){
 					console.log(response.statusCode + ' : ' + body)
 					
 					callback(response.statusCode + ' : ' + body);
 				}else{
 					var history = JSON.parse(body);
 					callback(null,user,history);
 				}
 			});			
		},	
		// go through all messages in history and process if needed
		function(user,history,callback){
console.log('history is %s',util.inspect(history))			
			async.each(history.history,function(historyItem,callback){
				if(!('messagesAdded' in historyItem)){
					callback()
				}else{
					async.each(historyItem.messagesAdded,function(messageAdded,callback){
						if(_.contains(messageAdded.message.labelIds,'INBOX')){
							console.log('found a new message!')
							// TBD process it
							callback()
						}else{
							callback()
						}
					},function(err){
						callback(err)
					})
				}
			},function(err){
				callback(err,user,history)
			})
		},
//		function(user,callback){
//			var headers = {
// 				Authorization: 'Bearer ' + user.google.access_token,
// 				'Content-type': 'application/json'
// 			}
//console.log('message id is %s',req.body.message.message_id)			
// 			request('https://www.googleapis.com/gmail/v1/users/' + user.google.id + '/messages/' + req.body.message.message_id,{headers: headers},function(error,response,body){
// 				if(error){
// 					callback(error);
// 				}else if(response.statusCode > 300){
// 					console.log(response.statusCode + ' : ' + body)
// 					
// 					callback(response.statusCode + ' : ' + body);
// 				}else{
// 					var message = JSON.parse(body);
// 					callback(null,user,message);
// 				}
// 			});			
//		},	
		
		// got so far? update the history in user record so we wont repeat it next itteration
		function(user,history,callback){
			var users = req.db.get('users');
			users.update({_id: user._id.toString()},{$set:{'google.last_processed_history_id' : data.historyId}},function(err,ok){
				callback(err)
			})
		},
	],function(err){
		if(err){
			console.log('err is %s',err)
			res.sendStatus(500)
		}else{
//			console.log('message is %s',util.inspect(history,{depth:8}));
			res.sendStatus(200)
		}
	})
	
	
	
})

module.exports = router;
