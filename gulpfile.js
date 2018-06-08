var gulp = require('gulp')
var less = require('gulp-less')
var path = require('path')
var pug = require('gulp-pug')
var connect = require('gulp-connect')
var del = require('del')
var webpackStream = require('webpack-stream')
var webpack = require('webpack')


var CONFIG = {
  watching: false,
  paths: {
    buildWeb: "build/web",
    clientSrc: "client",
  },
}


gulp.task("clean:web", function () {
  return del([CONFIG.paths.buildWeb])
})

let webpackCompiler
let startedWebpackWatcher

gulp.task("scripts", function (done) {
  if (!webpackCompiler) {
    const WEBPACK_CONFIG = {
      mode: "development",
      entry: "./" + CONFIG.paths.clientSrc + "/app.ts",
      resolve: {
        extensions: [".ts", ".tsx", ".js"]
      },
      module: {
        rules: [
          { test: /\.tsx?$/, loader: "ts-loader" }
        ]
      },
      output: {
        filename: "app.js",
        path: path.resolve(__dirname, "./" + CONFIG.paths.buildWeb),
      },
    }
    webpackCompiler = webpack(WEBPACK_CONFIG)
  }

  if (CONFIG.watching) {
    if (startedWebpackWatcher) {
      return done()
    }

    startedWebpackWatcher = true
    let calledDoneCallback = false
    webpackCompiler.watch(
      {},
      (err, stats) => {
        process.stdout.write(stats.toString() + "\n")

        if (!calledDoneCallback) {
          calledDoneCallback = true
          done()
        }
      }
    )
  } else {
    webpackCompiler.run((err, stats) => {
      process.stdout.write(stats.toString() + "\n")
      done()
    })
  }
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

