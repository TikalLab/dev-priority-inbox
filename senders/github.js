var githubAPI = require('../app_modules/github')
var util = require('util')
var async = require('async')
var cheerio = require('cheerio')
var url = require('url');

var prIsOnRepoICreated = require('../rules/github/pull-request/pr-is-on-repo-i-created')

var pullRequestRules = [
	prIsOnRepoICreated                     	
]
module.exports = {
	process: function(accessToken,message,callback){
console.log('received this message: %s',util.inspect(message))	

	
		$ = cheerio.load(message);
		var a = $('a:contains("view it on GitHub")');
		var href = a.attr('href');
		var parsed = url.parse(href);
		var pathname = parsed.pathname;
		var parts = pathname.split('/');
		var repo = parts[1] + '/' + parts[2];
		var id = parts[4];
	
console.log('parts are %s',util.inspect(parts))		
		
		switch(parts[3]){
		case 'pull':
			processPullRequest(accessToken,message,callback);
			break;
		case 'commit':
			processCommit(accessToken,message,callback);
			break;
		case 'issues':
			processIssue(accessToken,message,callback);
			break;
		default:
			callback()
		}
		
//		console.log('HREF is %s',a.attr('href'));
//
//		if(a.indexOf('/pull/') > 0){
//			processPullRequest(accessToken,message,callback)
//		}else if(a.indexOf('/commit/'){
//			processCommit(accessToken,message,callback)
//		}else if(a.indexOf('/issue/'){
//			processIssue(accessToken,message,callback)
//		}else{
//			callback()
//		}
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