var gulp = require('gulp')
var less = require('gulp-less')
var connect = require('gulp-connect')
var CONFIG = require('./config')


gulp.task("styles", function () {
  return gulp.src([
               CONFIG.paths.clientSrc + "/app.less",
               './node_modules/mocha/mocha.css',
             ])
             .pipe(less())
             .pipe(gulp.dest(CONFIG.paths.buildWebAssets))
             .pipe(connect.reload())
})
