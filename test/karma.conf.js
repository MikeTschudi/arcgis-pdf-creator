// Karma configuration

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'src/**/*.ts', included: true },
      { pattern: 'test/**/*.ts', included: true }
    ],

    karmaTypescriptConfig: {
      coverageOptions: {
        threshold: {
          global: {
            statements: 1,
            branches: 1,
            functions: 1,
            lines: 1,
            excludes: [
              'test/**/*.ts'
            ]
          }
        }
      },
      reports: {
        'json': {
          'directory': 'coverage',
          'filename': 'coverage.json'
        },
        'html': 'coverage'
      },
      compilerOptions: {
        lib: ['dom', 'es2017'],
        module: 'commonjs', // ES not supported until experimental node12/nodenext moduleResolution
        target: 'es2017'
      },
      include: [
        "src/**/*.ts",
        "test/**/*.ts",
      ],
      exclude: [],
      bundlerOptions: {
        transforms: [require('karma-typescript-es6-transform')()],
      }
    },

    // list of files / patterns to exclude
    exclude: [
      '{src,test}/**/*.d.ts'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      'src/**/*.ts': ['karma-typescript', 'coverage'],
      'test/**/*.ts': ['karma-typescript']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['dots', 'karma-typescript', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'lcov', subdir: 'lcov' }
      ]
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: [
      'Chrome', 'ChromeHeadless', 'ChromeHeadlessCI',
      'Edge',
      'Firefox'
    ],
    browserNoActivityTimeout: 120000,
    captureTimeout: 120000,
    browserDisconnectTimeout: 120000,
    plugins: [
      require('@chiragrupani/karma-chromium-edge-launcher'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('karma-firefox-launcher'),
      require('karma-jasmine'),
      require('karma-jasmine-diff-reporter'),
      require('karma-safari-launcher'),
      require('karma-spec-reporter'),
      require('karma-typescript'),
      require('karma-typescript-es6-transform')
    ],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--headless', '--disable-translate', '--disable-extensions']
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity
  })
}
