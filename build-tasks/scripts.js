var gulp = require('gulp')
var path = require('path')
var webpack = require('webpack')
var BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin

var CONFIG = require('./config')
let webpackCompiler
let startedWebpackWatcher

gulp.task("scripts", function (done) {
  const COMMON_CONFIG = {
    resolve: {
      extensions: [".ts", ".tsx", ".js"]
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: "ts-loader" }
      ]
    },
  }


  if (!webpackCompiler) {
    const WEBPACK_CONFIG = [
      Object.assign({}, COMMON_CONFIG, {
        mode: "development",
        entry: "./" + CONFIG.paths.clientSrc + "/TestRunner.ts",
        output: {
          filename: "tests.js",
          path: path.resolve(__dirname, "../" + CONFIG.paths.buildWebAssets),
        },
      }),
      Object.assign({}, COMMON_CONFIG, {
        mode: "development",
        entry: "./" + CONFIG.paths.clientSrc + "/app.ts",
        output: {
          filename: "app.js",
          path: path.resolve(__dirname, "../" + CONFIG.paths.buildWebAssets),
        },
        plugins: [
          new BundleAnalyzerPlugin()
        ]
      }),
      Object.assign({}, COMMON_CONFIG, {
        mode: "development",
        entry: "./" + CONFIG.paths.clientSrc + "/component-server/client.ts",
        externals: {
          'jsdom': 'false',
          'express': 'false',
        },
        node: {express: 'empty', fs: 'empty', net: 'empty',},
        output: {
          filename: "WWAComponents.client.js",
          path: path.resolve(__dirname, "../" + CONFIG.paths.buildComponentServer),
        },
      }),
      Object.assign({}, COMMON_CONFIG, {
        mode: "development",
        entry: "./" + CONFIG.paths.clientSrc + "/component-server/server.ts",
        target: "node",
        node: {__dirname: false},
        output: {
          filename: "WWAComponents.server.js",
          path: path.resolve(__dirname, "../" + CONFIG.paths.buildComponentServer),
        },
      }),
    ]
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
