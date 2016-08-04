var path = require('path')
var github = require(path.join(__dirname,'../../../app_modules/github'))
//var github = require('../app_modules/github')
var async = require('async')
var _ = require('underscore')

module.exports = {
	apply: function(accessToken,repo,issueNumber,callback){
		async.parallel([
   			function(callback){
				github.getMe(accessToken,function(err,me){
					callback(err,me)
				})
			},	
			function(callback){
				github.getIssueComments(accessToken,repo,issueNumber,function(err,comments){
					callback(err,comments)
				})
			},	
		],function(err,results){
			if(err){
				callback(err)
			}else{
				
				var me = results[0];
				var comments = results[1];
				
				var isParticipating = _.find(comments,function(comment){
					return comment.user.login == me.login
				})
				
				callback(err,isParticipating)
			}
		})
	}	
}