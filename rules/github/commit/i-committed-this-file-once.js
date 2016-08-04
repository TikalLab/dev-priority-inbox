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
				async.waterfall([
					// get commit
					function(callback){
						github.getCommit(accessToken,repo,sha,function(err,commit){
							callback(err,commit)
						})
					},
					function(commit,callback){
						var commits = [];
						async.each(commit.files,function(file,callback){
							github.getFileCommits(accessToken,repo,file,function(err,fileCommits){
								if(err){
									callback(err)
								}else{
									commits = commits.concat(fileCommits)
									callback()
								}
							})
						},function(err){
							callback(err,commit,commits)
						})
					}
				],function(err,commit,commits){
					callback(err,commits)
				})
			},	
		],function(err,results){
			if(err){
				callback(err)
			}else{
				
				/*
				 * TBD finish this function
				 */
				var me = results[0];
				var commits = results[1];
				
				var didCommit = _.find(commits,function(comment){
					return comment.user.login == me.login
				})
				
				callback(err,isParticipating)
			}
		})
	}	
}