var gulp = require('gulp')
var path = require('path')
var webpack = require('webpack')

var CONFIG = require('./config')
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
        path: path.resolve(__dirname, "../" + CONFIG.paths.buildWebAssets),
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
