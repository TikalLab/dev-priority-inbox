var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	res.send('hello world');
	res.end()
})	

module.exports = router;
