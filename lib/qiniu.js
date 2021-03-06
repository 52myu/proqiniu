var qiniu = require('qiniu');

var bucket;

exports.init = function(config) {
	qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
	qiniu.conf.SECRET_KEY = config.SECRET_KEY;
	bucket = config.bucket;
}

var check = function(fn) {
	return !(!bucket || !qiniu.conf.ACCESS_KEY || !qiniu.conf.SECRET_KEY)
}

exports.check = check;

var token = function(name) {
	name = name || bucket
	return new qiniu.rs.PutPolicy(name).token()
};

exports.token = token;

var upload = function(uptoken, key, localFile, cb) {
	qiniu.io.putFile(uptoken, key, localFile, null, cb);
}

exports.upload = upload;
