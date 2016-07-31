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
var crypto = require('crypto');

var userTrainings = require('../models/user_trainings');

var errorHandler = require('../app_modules/error');
var github = require('../app_modules/github');

router.get('/authorize',function(req,res,next){
	var redirect;
	redirect = {
		protocol: 'https',
		host: 'github.com',
		pathname: '/login/oauth/authorize',
		query: {
			client_id: config.get('github.client_id'),
			redirect_uri: 'http://' + config.get('github.redirect_domain') + '/github/authorized',
			scope: 'user:email,public_repo'
		}
	}
	res.redirect(url.format(redirect));
})

router.get('/authorized',function(req,res,next){
	async.waterfall([
 	    // switch the code for access token             
 		function(callback){
 			var form = {
 				client_id: config.get('github.client_id'),
 				client_secret: config.get('github.client_secret'),
 				code: req.query.code,
 			}
 			var headers = {
 				Accept: 'application/json'
 			}
 			request.post('https://github.com/login/oauth/access_token',{form: form, headers: headers},function(error,response,body){
 				if(error){
 					callback(error);
 				}else if(response.statusCode > 300){
 					callback(response.statusCode + ' : ' + body);
 				}else{
 					var data = JSON.parse(body);
 					var accessToken = data.access_token;
 					callback(null,accessToken);
 				}
 			});
 		},
 		// get the github user record
 		function(accessToken,callback){
 			var headers = github.getAPIHeaders(accessToken,config.get('app.name'));
 			request('https://api.github.com/user',{headers: headers},function(error,response,body){
 				if(error){
 					callback(error);
 				}else if(response.statusCode > 300){
 					callback(response.statusCode + ' : ' + body);
 				}else{
 					callback(null,accessToken,JSON.parse(body));
 				}
 			});
 		},
 		// get the user email
 		function(accessToken,githubUser,callback){
 			var headers = github.getAPIHeaders(accessToken,config.get('app.name'));
			request('https://api.github.com/user/emails',{headers: headers},function(error,response,body){
				if(error){
					callback(error);
				}else if(response.statusCode > 300){
					callback(response.statusCode + ' : ' + body);
				}else{
					var githubUserEmails = JSON.parse(body);
					var email = _.find(githubUserEmails,function(email){
						return email.primary;
					}).email;
					callback(null,accessToken,githubUser,email);
				}
			}); 		
		}, 		
 		// insert/update the user record to db
 		function(accessToken,githubUser,email,callback){
 			var users = req.db.get('users');
 			var github = {
 				id: githubUser.id,
 				username: githubUser.login,
 				name: githubUser.name,
 				url: githubUser.html_url,
 				access_token: accessToken,
 				avatar_url: githubUser.avatar_url
 			}
 			
 			users.findAndModify({
 				'github.id': githubUser.id
 			},{
 				$setOnInsert:{
 					email: email,
 					created_at: new Date()
 				},
 				$set: {
 					github: github, 
 				}
 			},{
 				upsert: true,
 				new: true
 			},function(err,user){
 				callback(err,user)
 			});
 		}
 	],function(err,user,avatar){
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


router.post('/tutor-repo-webhook',function(req,res,next){
	console.log('received a REPO webhook notification from github!');
	console.log('%s',util.inspect(req.body));
	
	if(!isValidHookPost(req)){
		console.log('SPOOFED HOOK!');
		res.sendStatus(500);
	}else{
		switch(req.headers['x-github-event']){
		case 'pull_request':
			console.log('this is a pull request!');
			processTutorRepoPullRequestEvent(req.body,req.db,function(err,ok){
				if(err){
					res.sendStatus(500).end();
				}else{
					res.sendStatus(200).end();
				}
			});
			break;
		}
	}
})

function processTutorRepoPullRequestEvent(event,db,callback){
	if(event.action == 'opened'){
		tutorPullRequestOpened(event,db,callback)
	}else if(event.action == 'closed' && event.pull_request.merged){
		tutorPullRequestMerged(event,db,callback)
	}else{
		callback('didn\'t find no matching event to process')
	}
}



function tutorPullRequestOpened(event,db,callback){
	async.waterfall([
		// find relevant user training
		function(callback){
			userTrainings.getByUserGithubUsernameAndTuturRepoID(event.pull_request.user.login,event.repository.id,db,function(err,userTraining){
				callback(err,userTraining)
			})
		},
/*
 * TBD enable the following code and debiug so users can send direct PRs from github and not via the app
 */
		// update pull request in db
//		function(userTraining,callback){
//			var step = getStepFromTitle(event.pull_request.title);
//			userTrainings.pullRequestOpened(userTraining.user_id,userTraining.training_id,step,event.pull_request,db,function(err,userTraining){
//				callback(err,userTraining)
//			})
//		},
	],function(err,userTraining){
		callback(err,userTraining)
	})
}

function tutorPullRequestMerged(event,db,callback){
	async.waterfall([
		// find relevant user training
		function(callback){
			userTrainings.getByUserGithubUsernameAndTuturRepoID(event.pull_request.user.login,event.repository.id,db,function(err,userTraining){
console.log('github username is %s',event.pull_request.user.login)
console.log('repo is is %s',event.repository.id);
console.log('user training is %s',util.inspect(userTraining));

				callback(err,userTraining)
			})
		},
		// mark the step as complete
		function(userTraining,callback){
			var step = getStepFromTitle(event.pull_request.title);
			userTrainings.pullRequestMerged(userTraining.user_id,userTraining.training_id,step,db,function(err,userTraining){
				callback(err,userTraining)
			})
		},
//		// notify the user?
//		function(userTraining,callback){
//			callback(err,userTraining)
//		},
	],function(err,userTraining){
		callback(err,userTraining)
	})
}

function getStepFromTitle(title){
	console.log('PR title is %s',title)
	return Number(title.substr(6));
}

function isValidHookPost(req){
	var hmac = crypto.createHmac('sha1', config.get('github.hook_secret'));
	hmac.update(JSON.stringify(req.body));
	var calcedSignature = hmac.digest('hex');
	console.log('signature is %s',calcedSignature);
	
	var githubSignature = req.headers['x-hub-signature'].split('=')[1]; // header content is in format sha1={signature}, we need only the {signature} part
	return (githubSignature == calcedSignature);
}

module.exports = router;
