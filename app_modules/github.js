var config = require('config');
var request = require('request');
var util = require('util')
var async = require('async')
var parseLinkHeader = require('parse-link-header');

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
	},
	getIssueComments: function(accessToken,repo,issueNumber,callback){
		var headers = this.getAPIHeaders(accessToken);
		var comments = [];
		var page = 1;
		var linkHeader;
		
		async.whilst(
			function(){
				return page;
			},
			function(callback){
				request('https://api.github.com/repos/' + repo + '/issues/' + issueNumber + '/comments?page=' + page,{headers: headers},function(error,response,body){
					if(error){
						callback(error);
					}else if(response.statusCode > 300){
						callback(response.statusCode + ' : ' + body);
					}else{
						var data = JSON.parse(body)
						comments = comments.concat(data);
						linkHeader = parseLinkHeader(response.headers.link);
						page = (linkHeader? ('next' in linkHeader ? linkHeader.next.page : false) : false);
						callback(null,comments);
					}
				});	
			},
			function(err,comments){
				callback(err,comments)
			}
		);
			
	},	

}