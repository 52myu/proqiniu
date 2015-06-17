

'use strict';

var qiniu = require('../lib/qiniu'),
  path = require('path');

module.exports = function(grunt) {

  grunt.registerMultiTask('qiniu', '增量同步文件夹', function() {
    var options = this.options({
      prefix: ''
    });

    qiniu.init(options);

    if (!qiniu.check()) {
      grunt.log.error('必须填写七牛的ACCESS_KEY,SECRET_KEY,bucket');
      return false;
    }

    var token = qiniu.token();

    var _this = this;

    this.files.forEach(function(f) {
      var result = {};

      if (grunt.file.exists(f.dest)) {
        result = grunt.file.readJSON(f.dest);
      }

      var done = _this.async();

      var num = 0;

      grunt.event.on('upload_over', function() {
        if (num == 0) {
          grunt.file.write(f.dest, JSON.stringify(result));
          done();
        }
      });

      var src = f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        grunt.file.recurse(filepath, function(abspath, rootdir, subdir, filename) {
          if (filename.indexOf('.') == 0) return true; //过滤掉无用文件
          var key = options.prefix + subdir + '/' + filename;
          if (result[key]) return true; //过滤已经上传
          num++;
          qiniu.upload(token, key, path.join(options.path, abspath), function(err, ret) {
            if (err) {
              grunt.log.writeln('!error "' + abspath + '" => "' + key + '" ' + err);
            } else {
              result[key] = true;
              grunt.log.writeln('!ok "' + abspath + '" => "' + key + '"');
            }
            num--;
            grunt.event.emit('upload_over');
          });
        });
      });

    });

  });

};