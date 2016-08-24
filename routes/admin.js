var express = require('express');
var router = express.Router();
var config = require('config');
var request = require('request');
var util = require('util');
var _ = require('underscore');
var us = require('underscore.string');
var querystring = require('querystring');
var url = require('url');
var async = require('async');
var nl2br = require('nl2br');
var marked = require('marked');
var atob = require('atob')
var cheerio = require('cheerio')
var fs = require('fs')
var path = require('path')
var moment = require('moment')

var errorHandler = require('../app_modules/error');


var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
	function unauthorized(res) {
		res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
		return res.sendStatus(401);
	};

	var user = basicAuth(req);

	if (!user || !user.name || !user.pass) {
		return unauthorized(res);
	};

	if (user.name === config.get('auth.username') && user.pass === config.get('auth.password')) {
		return next();
	}else{
		return unauthorized(res);
	};
};

router.get('/',auth,function(req, res, next) {
	render(req,res,'admin/index',{
		active_page: ''
	});
})

router.get('/users',auth,function(req, res, next) {
	var users = req.db.get('users');

	users.find({},function(err,docs){
		if(err){
			errorHandler.error(req,res,next,err)
		}else{
			render(req,res,'admin/users',{
				users: docs,
				active_page: 'users'
			})
		}
	})
});

function render(req,res,template,params){

	params.user = req.session.user;
	params.app = req.app;
	params.config = config;
	params.moment = moment;
	params._ = _;

	if(!('isHomepage' in params)){
		params.isHomepage = false;
	}

	if(!('isDevelopersHomepage' in params)){
		params.isDevelopersHomepage = false;
	}

	if(!('isOpenSourceHomepage' in params)){
		params.isOpenSourceHomepage = false;
	}

	if(!('isOrgsHomepage' in params)){
		params.isOrgsHomepage = false;
	}


	res.render(template,params);
}

module.exports = router;
