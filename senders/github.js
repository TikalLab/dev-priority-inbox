var githubAPI = require('../app_modules/github')
var util = require('util')
var async = require('async')
var cheerio = require('cheerio')
var url = require('url');

var prIsOnRepoICreated = require('../rules/github/pull-request/pr-is-on-repo-i-created')

var IParticiapteInDiscussion = require('../rules/github/issue/i-participate-in-discussion')

var ICommittedThisFileOnce = require('../rules/github/commit/i-committed-this-file-once')

var pullRequestRules = [
	prIsOnRepoICreated                     	
]
var commitRules = [
	ICommittedThisFileOnce
]
var issueRules = [
	IParticiapteInDiscussion
]

module.exports = {
	process: function(accessToken,message,callback){
console.log('received this message: %s',util.inspect(message))	

	
		$ = cheerio.load(message);
		var a = $('a:contains("view it on GitHub")');
		if(!a.attr('href')){
			callback() // sanity
		}else{
			var href = a.attr('href');
			var parsed = url.parse(href);
			var pathname = parsed.pathname;
			var parts = pathname.split('/');
			var repo = parts[1] + '/' + parts[2];
			var id = parts[4];
		
	console.log('parts are %s',util.inspect(parts))		
			var rules;
			switch(parts[3]){
			case 'pull':
				rules = pullRequestRules;
				break;
			case 'commit':
				rules = commitRules;
				break;
			case 'issues':
				rules = issueRules;
				break;
			}
			
			if(rules){
				applyRules(rules,accessToken,message,repo,id,callback)
			}else{
				callback()
			}
			
		}
		
	}	
}

function applyRules(rules,accessToken,message,repo,id,callback){
	
	// apply rules
	async.detect(rules,function(rule,callback){
		rule.apply(accessToken,repo,id,callback)
	},function(err,isImportant){
		callback(err,isImportant)
	})
	
	// callback with either important or not important 
	
//	githubAPI.getPullRequest(accessToken,'shaharsol/demo-repo-for-fuseday-2106',2,callback)
	
//	callback(null,true); // true is important
}

function processPullRequest(accessToken,message,repo,pullRequestNumber,callback){
	
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