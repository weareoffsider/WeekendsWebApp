var gulp = require('gulp')
var pug = require('gulp-pug')
var connect = require('gulp-connect')
var CONFIG = require('./config')

gulp.task("containers", function () {
  return gulp.src(CONFIG.paths.clientSrc + "/**/*.pug")
             .pipe(pug())
             .pipe(gulp.dest(CONFIG.paths.buildWeb))
             .pipe(connect.reload())
})
