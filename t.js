// var base64 = require('base-64');
//
// var atob = require('atob')
// var s = 'SSBoYXZlIHJlcG9ydCBhbmQgdXNlciBhcyBmb2xsb3dzDQpyZXBvcnQNCmBgYA0Kew0KICAgICJfaWQiOiBPYmplY3RJZCgiNTc5ZWM0ODRiYjEyNjU0MzljNzdlZDAxIiksDQogICAgInRleHQiOiAiSSdtIHJlcG9ydCIsDQogICAgInVzZXIiOiBPYmplY3RJZCgiNTc4ODVhOGUyMDAwODk3ZGZmMTZiZTNhIikNCn0NCmBgYA0KdXNlciANCmBgYA0Kew0KICAgICJfaWQiOiBPYmplY3RJZCgiNTc4ODVhOGUyMDAwODk3ZGZmMTZiZTNhIiksDQogICAgIm5hbWUiOiAiUmF5IiwNCiAgICAiZ2VuZGVyIjogIm1hbGUiLA0KICAgICJ1cGRhdGVkQXQiOiBJU09EYXRlKCIyMDE2LTA3LTI4VDAzOjUzOjMxLjUwM1oiKQ0KfQ0KYGBgDQpsJ2QgbGlrZSB0byBnZXQgcmVzdWx0IGxpa2UgdGhpcw0KYGBgDQp7DQogICAgIl9pZCI6IE9iamVjdElkKCI1NzllYzQ4NGJiMTI2NTQzOWM3N2VkMDEiKSwNCiAgICAidGV4dCI6ICJJJ20gcmVwb3J0IiwNCiAgICAidXNlciI6IHsNCiAgICAgICAgIl9pZCI6IE9iamVjdElkKCI1Nzg4NWE4ZTIwMDA4OTdkZmYxNmJlM2EiKSwNCiAgICAgICAgIm5hbWUiOiAiUmF5IiwNCiAgICAgICAgImdlbmRlciI6ICJtYWxlIiwNCiAgICAgICAgInVwZGF0ZWRBdCI6IElTT0RhdGUoIjIwMTYtMDctMjhUMDM6NTM6MzEuNTAzWiIpDQogICAgfQ0KfQ0KYGBgDQpOb3cgSSB1c2UgdGhlIGZvbGxvd2luZyBjb2RlLg0KYGBgamF2YXNjcmlwdA0Kcm91dGVyLmdldCgnLycsIGZ1bmN0aW9uKHJlcSwgcmVzKSB7DQogICAgICAgIHZhciBkYiA9IHJlcS5kYjsNCiAgICAgICAgdmFyIHJlcG9ydHMgPSBkYi5nZXQoJ3JlcG9ydCcpOw0KICAgICAgICB2YXIgdXNlcnMgPSBkYi5nZXQoJ3VzZXInKTsNCiAgICAgICAgcmVwb3J0cy5maW5kT25lKHt9KQ0KICAgICAgICAgICAgLnRoZW4oKHJlcG9ydCkgPT4gew0KICAgICAgICAgICAgICAgIHVzZXJzLmZpbmRPbmUocmVwb3J0Ll9pZCkNCiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHVzZXIpID0-IHsNCiAgICAgICAgICAgICAgICAgICAgICAgIHJlcG9ydC51c2VyID0gdXNlcjsNCiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5qc29uKHJlcG9ydCk7DQogICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0-IHsNCiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5qc29uKGVycik7DQogICAgICAgICAgICAgICAgICAgIH0pOw0KICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4gew0KICAgICAgICAgICAgICAgIHJlcy5qc29uKGVycik7DQogICAgICAgICAgICB9KTsNCg0KICAgIH0pOw0KYGBgDQpJcyB0aGVyZSBhIGJldHRlciB3YXkgdG8gdXNlIGNoaWxkLXJlZmVyZW5jaW5nPw0KDQotLS0NCllvdSBhcmUgcmVjZWl2aW5nIHRoaXMgYmVjYXVzZSB5b3UgYXJlIHN1YnNjcmliZWQgdG8gdGhpcyB0aHJlYWQuDQpSZXBseSB0byB0aGlzIGVtYWlsIGRpcmVjdGx5IG9yIHZpZXcgaXQgb24gR2l0SHViOg0KaHR0cHM6Ly9naXRodWIuY29tL0F1dG9tYXR0aWMvbW9uay9pc3N1ZXMvMTU1';
// console.log(atob(s))


var request = require('request')
var util = require('util')
var async = require('async')
var atob = require('atob')
var _ = require('underscore');
var emailAddresses = require('email-addresses')

async.waterfall([
  function(callback){
    var form = {
      client_id: '34526377599-p89l7fpnd6oo5u941dleg5bgbm52vsbt.apps.googleusercontent.com',
      client_secret: 'G6CjvFR5qWrMZmpmlgLPMfnj',
      grant_type: 'refresh_token',
      refresh_token: '1/LZ8IUbuXS80jn1pHYM--MxtJcX0X-_qX8o1NU6OqusM',
    };
    request.post('https://www.googleapis.com/oauth2/v4/token',{form: form, json: true},function(error,response,body){
      if(error){
        callback(error)
      }else if(response.statusCode != 200){
        callback(response.statusCode + ' : ' + body);
      }else{
        console.log('access toekn is %s',body.access_token)
        callback(null,body.access_token)
      }

    })
  },
  function(accessToken,callback){
    // var headers = {
    //   Authorization: 'Bearer ' + accessToken,
    //   // 'Content-type': 'application/json'
    // }
    // var form = {
    //   q: 'ansible',
    //   // fields: 'snippet'
    // };
    // request('https://www.googleapis.com/gmail/v1/users/me/messages',{headers: headers, qs: form, json: true},function(error,response,body){
    //   if(error){
    //     callback(error)
    //   }else if(response.statusCode != 200){
    //     callback(response.statusCode + ' : ' + body);
    //   }else{
    //     console.log('messages are %s',util.inspect(body))
    //     callback(null,accessToken,body.messages)
    //   }
    //
    // })
    searchMessages(accessToken,'scala',function(err,messages){
      console.log('messages count: %s',messages.length)
      console.log('messages are: %s',util.inspect(messages))
      callback(err,accessToken,messages)
    })
  },
  function(accessToken,messages,callback){
    var emps = {};
    async.eachLimit(messages,10,function(message,callback){
      var headers = {
        Authorization: 'Bearer ' + accessToken,
        // 'Content-type': 'application/json'
      }
      var qs = {
        // format: 'RAW'
      }
      request('https://www.googleapis.com/gmail/v1/users/me/messages/' + message.id,{headers: headers, qs: qs ,json: true},function(error,response,body){
        if(error){
          callback(error);
        }else if(response.statusCode > 300){
          console.log(response.statusCode + ' : ' + util.inspect(body))

          callback(response.statusCode + ' : ' + util.inspect(body));
        }else{
          // console.log('message is %s',util.inspect(body))
          // console.log(atob(body.raw))
          var fromHeader  = _.find(body.payload.headers,function(header){
            return header.name == 'From'
          });
          var fromEmail = emailAddresses.parseOneAddress(fromHeader.value).address
          console.log('message is from %s',fromEmail)
          fromEmail in emps ? emps[fromEmail] += 1 : emps[fromEmail] = 1;
          callback(null);
        }
      });
    },function(err){
      callback(err,emps)
    })




  }
],function(err,emps){
console.log('HERE')
  if(err){
    console.log('err is %s',err)
  }else{
    console.log('all is good',util.inspect(Object.keys(emps).sort(function(a,b){return emps[a]-emps[b]})))



  }
})





function searchMessages(accessToken,q,callback){
  var messages = [];
  var hasMore = true;
  var nextPageToken = null;

  async.whilst(
    function(){
      return hasMore;
    },
    function(callback){

      var headers = {
        Authorization: 'Bearer ' + accessToken,
        // 'Content-type': 'application/json'
      }
      var qs = {
        q: q,
      };
      if(nextPageToken){
        qs.pageToken = nextPageToken
      }
      request('https://www.googleapis.com/gmail/v1/users/me/messages',{headers: headers, qs: qs, json: true},function(error,response,body){
        if(error){
          callback(error)
        }else if(response.statusCode != 200){
          callback(response.statusCode + ' : ' + util.inspect(body));
        }else{
          console.log('messages count is %s for page token %s',body.messages.length,qs.pageToken)
          messages = messages.concat(body.messages)
          hasMore = 'nextPageToken' in body;
          if(hasMore){
            nextPageToken = body.nextPageToken;
          }
          callback(null,messages)
        }

      })


    },
    function(err,messages){
      callback(err,messages)
    }
  );

}
