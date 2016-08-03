var path = require('path')
var github = require(path.join(__dirname,'../../../app_modules/github'))
//var github = require('../app_modules/github')
var async = require('async')

module.exports = {
	apply: function(accessToken,repo,pullRequestNumber,callback){
		async.parallel([
			function(callback){
				github.getMe(accessToken,function(err,me){
					callback(err,me)
				})
			},	
			function(callback){
				github.getRepo(accessToken,repo,function(err,repo){
					callback(err,repo)
				})
			}
		],function(err,results){
			if(err){
				callback(err)
			}else{
				callback(err,results[0].login == results[1].owner.login)
			}
		})
	}	
}