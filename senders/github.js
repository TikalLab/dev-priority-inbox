var githubAPI = require('../app_modules/github')
var util = require('util')

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
	
	// apply rules
	
	// callback with either important or not important 
	
//	githubAPI.getPullRequest(accessToken,'shaharsol/demo-repo-for-fuseday-2106',2,callback)
	
	callback(null,true); // true is important
}