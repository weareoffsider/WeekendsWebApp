var gulp = require('gulp')
var path = require('path')
var connect = require('gulp-connect')
var del = require('del')

var CONFIG = require('./build-tasks/config')
require('./build-tasks/styles')
require('./build-tasks/scripts')
require('./build-tasks/containers')

gulp.task("clean:web", function () {
  return del([CONFIG.paths.buildWeb])
})

gulp.task("devServer", function () {
  connect.server({
    root: CONFIG.paths.buildWeb,
    livereload: true,
    fallback: path.resolve(__dirname, "./" + CONFIG.paths.buildWeb + "/index.html"),
  })
})

gulp.task("build", ["clean:web"], function () {
  return gulp.start(["scripts", "styles", "containers"])
})

gulp.task("dev", ["build"], function () {
  gulp.watch(CONFIG.paths.clientSrc + "/**/*.pug", ["containers"])
  gulp.watch(CONFIG.paths.clientSrc + "/**/*.less", ["styles"])
  gulp.start("devServer")
})

gulp.task("default", function () {
  CONFIG.watching = true
  gulp.start("dev")
})

