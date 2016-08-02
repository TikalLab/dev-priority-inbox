var config = require('config');
var request = require('request');
var util = require('util')

module.exports = {
	getAPIHeaders: function(accessToken){
		return {
			Authorization: 'token ' + accessToken,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': config.get('app.name')
		};
	},
	getPullRequest: function(accessToken,repo,pullRequestNumber,callback){
		var headers = this.getAPIHeaders(accessToken);
		request('https://api.github.com/repos/' + repo + '/pulls/' + pullRequestNumber,{headers: headers},function(error,response,body){
			if(error){
				callback(error);
			}else if(response.statusCode > 300){
				callback(response.statusCode + ' : ' + body);
			}else{
				callback(null,JSON.parse(body));
			}
		}); 
	},	
	getRepo: function(accessToken,repo,callback){
		var headers = this.getAPIHeaders(accessToken);
		request('https://api.github.com/repos/' + repo,{headers: headers},function(error,response,body){
			if(error){
				callback(error);
			}else if(response.statusCode > 300){
				callback(response.statusCode + ' : ' + body);
			}else{
				callback(null,JSON.parse(body));
			}
		}); 
	},
	getMe: function(accessToken,callback){
		var headers = this.getAPIHeaders(accessToken);
		request('https://api.github.com/user',{headers: headers},function(error,response,body){
			if(error){
				callback(error);
			}else if(response.statusCode > 300){
				callback(response.statusCode + ' : ' + body);
			}else{
				callback(null,JSON.parse(body));
			}
		}); 
	}	

}