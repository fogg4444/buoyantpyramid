'use strict';

var gulp = require('gulp');
var sync = require('browser-sync');
var reload = sync.reload;
var nodemon = require('gulp-nodemon');
var closureCompiler = require('gulp-closure-compiler');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var KarmaServer = require('karma').Server;

// the paths to our app files
var paths = {
  // all our client app js files, not including 3rd party js files
  scripts: ['client/**/*.js'],
  html: ['client/**/*.html', 'client/index.html'],
  styles: ['client/styles/style.css'],
  test: ['tests/**/*.js']
};

// Sass and css injecting
gulp.task('sass', function () {
  return gulp.src('client/styles/*.scss')
  .pipe(sass({outputStyle: 'compressed', sourceComments: 'map'}, {errLogToConsole: true}))
  .pipe(prefix('last 2 versions', '> 1%', 'ie 8', 'Android 2', 'Firefox ESR'))
  .pipe(gulp.dest('client/styles'))
  .pipe(reload({stream: true}));
});

gulp.task('browser-sync', ['nodemon'], function() {
  sync.init(null, {
    proxy: 'http://localhost:3000',
    port: 5000
  });
});

// Run our karma tests
gulp.task('karma', function (done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});

// Minify the things
gulp.task('compile', function() {
  return gulp.src('client/*.js')
    .pipe(closureCompiler('build.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({script: 'server/server.js'}).on('start', function () {
    if (!called) {
      called = true;
      cb();
    }
  });
});

gulp.task('default', ['sass', 'browser-sync'], function () {
  gulp.watch('client/styles/*.scss', ['sass']);
  gulp.watch(['client/**/*.js', './*.html'], reload);
});
