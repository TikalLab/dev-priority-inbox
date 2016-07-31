var githubAPI = require('../app_modules/github')

module.exports = {
	process: function(accessToken,message,callback){
		if(message.indexOf('You can view, comment on, or merge this pull request online at') > 0){
			processPullRequest(accessToken,message,callback)
		}else{
			callback()
		}
	}	
}

function processPullRequest(accessToken,message,callback){
	githubAPI.getPullRequest(accessToken,'shaharsol/demo-repo-for-fuseday-2106',2,callback)
}