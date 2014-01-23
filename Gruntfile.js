'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bwr: grunt.file.readJSON('bower.json'),
    concat: {
      dist:{}
    },
    ngmin: {
      dist: {}
    },
    uglify: {
      options: {
        report: 'min',
        enclose: {
          'this': 'window',
          'this.angular': 'angular',
          'void 0': 'undefined'
        },
        banner: '/*\n  <%= pkg.name %> - v<%= pkg.version %> \n  ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n*/\n'+
        '',
      },
      dist: {
        options: {
          beautify: false,
          mangle: true,
          compress: {
            global_defs: {
              'DEBUG': false
            },
            dead_code: true
          },
          sourceMap: '<%= bwr.name %>.min.js.map'
        },
        files: {
          '<%= bwr.name %>.min.js': ['./lib/index.js', './lib/*/*.js']
        }
      },
      src: {
        options: {
          beautify: true,
          mangle: false,
          compress: false
        },
        files: {
          '<%= bwr.name %>.js': ['./lib/index.js', './lib/*/*.js']
        }
      }
    },
    watch: {
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          'example/{,*/}*.html',
          'example/{,*/}*.js',
          '{,*/}*.js'
        ]
      }
    },
    connect: {
      options: {
        port: '3000',
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'example'),
              mountFolder(connect, '.')
            ];
          }
        }
      }

    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      }
    },
     complexity: {
      generic: {
        src: ['lib/**/*.js'],
        options: {
          jsLintXML: 'report.xml', // create XML JSLint-like report
          checkstyleXML: 'checkstyle.xml', // create checkstyle report
          errorsOnly: false, // show only maintainability errors
          cyclomatic: 3,
          halstead: 8,
          maintainability: 100
        }
      }
    }
  });

  grunt.registerTask('server', function (target) {
    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    // 'complexity',
    'jshint'
  ]);

  grunt.registerTask('build', [
    'concat',
    'ngmin',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};
