var githubAPI = require('../app_modules/github')
var util = require('util')
var async = require('async')

var prIsOnRepoICreated = require('../rules/github/pull-request/pr-is-on-repo-i-created')

var pullRequestRules = [
	prIsOnRepoICreated                     	
]
module.exports = {
	process: function(accessToken,message,callback){
console.log('received this message: %s',util.inspect(message))		
		if(message.indexOf('You can view, comment on, or merge this pull request online at') > 0){
			processPullRequest(accessToken,message,callback)
		}else{
			callback()
		}
	}	
}

function processPullRequest(accessToken,message,callback){
	
	// extract repo name and pr number
	var repo = 'shaharsol/demo-repo-for-fuseday-2106';
	var pullRequestNumber = '2';
	
	// apply rules
	async.detect(pullRequestRules,function(rule,callback){
		rule.apply(accessToken,repo,pullRequestNumber,callback)
	},function(err,isImportant){
		callback(err,isImportant)
	})
	
	// callback with either important or not important 
	
//	githubAPI.getPullRequest(accessToken,'shaharsol/demo-repo-for-fuseday-2106',2,callback)
	
//	callback(null,true); // true is important
}