var base64 = require('base-64');

var atob = require('atob')
var s = 'SSBoYXZlIHJlcG9ydCBhbmQgdXNlciBhcyBmb2xsb3dzDQpyZXBvcnQNCmBgYA0Kew0KICAgICJfaWQiOiBPYmplY3RJZCgiNTc5ZWM0ODRiYjEyNjU0MzljNzdlZDAxIiksDQogICAgInRleHQiOiAiSSdtIHJlcG9ydCIsDQogICAgInVzZXIiOiBPYmplY3RJZCgiNTc4ODVhOGUyMDAwODk3ZGZmMTZiZTNhIikNCn0NCmBgYA0KdXNlciANCmBgYA0Kew0KICAgICJfaWQiOiBPYmplY3RJZCgiNTc4ODVhOGUyMDAwODk3ZGZmMTZiZTNhIiksDQogICAgIm5hbWUiOiAiUmF5IiwNCiAgICAiZ2VuZGVyIjogIm1hbGUiLA0KICAgICJ1cGRhdGVkQXQiOiBJU09EYXRlKCIyMDE2LTA3LTI4VDAzOjUzOjMxLjUwM1oiKQ0KfQ0KYGBgDQpsJ2QgbGlrZSB0byBnZXQgcmVzdWx0IGxpa2UgdGhpcw0KYGBgDQp7DQogICAgIl9pZCI6IE9iamVjdElkKCI1NzllYzQ4NGJiMTI2NTQzOWM3N2VkMDEiKSwNCiAgICAidGV4dCI6ICJJJ20gcmVwb3J0IiwNCiAgICAidXNlciI6IHsNCiAgICAgICAgIl9pZCI6IE9iamVjdElkKCI1Nzg4NWE4ZTIwMDA4OTdkZmYxNmJlM2EiKSwNCiAgICAgICAgIm5hbWUiOiAiUmF5IiwNCiAgICAgICAgImdlbmRlciI6ICJtYWxlIiwNCiAgICAgICAgInVwZGF0ZWRBdCI6IElTT0RhdGUoIjIwMTYtMDctMjhUMDM6NTM6MzEuNTAzWiIpDQogICAgfQ0KfQ0KYGBgDQpOb3cgSSB1c2UgdGhlIGZvbGxvd2luZyBjb2RlLg0KYGBgamF2YXNjcmlwdA0Kcm91dGVyLmdldCgnLycsIGZ1bmN0aW9uKHJlcSwgcmVzKSB7DQogICAgICAgIHZhciBkYiA9IHJlcS5kYjsNCiAgICAgICAgdmFyIHJlcG9ydHMgPSBkYi5nZXQoJ3JlcG9ydCcpOw0KICAgICAgICB2YXIgdXNlcnMgPSBkYi5nZXQoJ3VzZXInKTsNCiAgICAgICAgcmVwb3J0cy5maW5kT25lKHt9KQ0KICAgICAgICAgICAgLnRoZW4oKHJlcG9ydCkgPT4gew0KICAgICAgICAgICAgICAgIHVzZXJzLmZpbmRPbmUocmVwb3J0Ll9pZCkNCiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHVzZXIpID0-IHsNCiAgICAgICAgICAgICAgICAgICAgICAgIHJlcG9ydC51c2VyID0gdXNlcjsNCiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5qc29uKHJlcG9ydCk7DQogICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0-IHsNCiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5qc29uKGVycik7DQogICAgICAgICAgICAgICAgICAgIH0pOw0KICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4gew0KICAgICAgICAgICAgICAgIHJlcy5qc29uKGVycik7DQogICAgICAgICAgICB9KTsNCg0KICAgIH0pOw0KYGBgDQpJcyB0aGVyZSBhIGJldHRlciB3YXkgdG8gdXNlIGNoaWxkLXJlZmVyZW5jaW5nPw0KDQotLS0NCllvdSBhcmUgcmVjZWl2aW5nIHRoaXMgYmVjYXVzZSB5b3UgYXJlIHN1YnNjcmliZWQgdG8gdGhpcyB0aHJlYWQuDQpSZXBseSB0byB0aGlzIGVtYWlsIGRpcmVjdGx5IG9yIHZpZXcgaXQgb24gR2l0SHViOg0KaHR0cHM6Ly9naXRodWIuY29tL0F1dG9tYXR0aWMvbW9uay9pc3N1ZXMvMTU1';
console.log(atob(s))