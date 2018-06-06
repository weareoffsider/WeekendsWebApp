var gulp = require('gulp')
var less = require('gulp-less')
var pug = require('gulp-pug')
var connect = require('gulp-connect')
var del = require('del')


var CONFIG = {
  paths: {
    buildWeb: "build/web",
    clientSrc: "client",
  },
}


gulp.task("clean:web", function () {
  return del([CONFIG.paths.buildWeb])
})

gulp.task("scripts", function () {
  return gulp.src(CONFIG.paths.clientSrc + "/**/*.js")
             .pipe(gulp.dest(CONFIG.paths.buildWeb))
             .pipe(connect.reload())
})

gulp.task("styles", function () {
  return gulp.src(CONFIG.paths.clientSrc + "/app.less")
             .pipe(less())
             .pipe(gulp.dest(CONFIG.paths.buildWeb))
             .pipe(connect.reload())
})

gulp.task("containers", function () {
  return gulp.src(CONFIG.paths.clientSrc + "/**/*.pug")
             .pipe(pug())
             .pipe(gulp.dest(CONFIG.paths.buildWeb))
             .pipe(connect.reload())
})

gulp.task("devServer", function () {
  connect.server({
    root: CONFIG.paths.buildWeb,
    livereload: true,
  })
})

gulp.task("build", ["clean:web"], function () {
  return gulp.start(["scripts", "styles", "containers"])
})

gulp.task("dev", ["build"], function () {
  gulp.watch(CONFIG.paths.clientSrc + "/**/*.pug", ["containers"])
  gulp.watch(CONFIG.paths.clientSrc + "/**/*.less", ["styles"])
  gulp.watch(CONFIG.paths.clientSrc + "/**/*.js", ["scripts"])
  gulp.start("devServer")
})
