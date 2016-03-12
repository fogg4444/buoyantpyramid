module.exports = function(grunt) {
  // load up all of the necessary grunt plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("gruntify-eslint");
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-casperjs');
  grunt.loadNpmTasks('grunt-mocha');


  // grunt setup
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // create a task called clean, which
    // deletes all files in the listed folders
    clean: {
      dist: 'dist/*',
      results: 'results/*'
    },



    // configure the server
    express: {
      dev: {
        options: {
          script: 'dist/server/server.js'
        }
      }
    },

    // configure karma
    karma: {
      options: {
        configFile: 'karma.conf.js',
        reporters: ['progress', 'coverage']
      },
      // Watch configuration
      watch: {
        background: true,
        reporters: ['progress']
      },
      // Single-run configuration for development
      single: {
        singleRun: true,
      },
      // Single-run configuration for CI
      ci: {
        singleRun: true,
        coverageReporter: {
          type: 'lcov',
          dir: 'results/coverage/'
        }
      }
    },

    // configure casperjs
    casperjs: {
      options: {},
      e2e: {
        files: {
          'results/casper': 'test/e2e/**/*.js'
        }
      }
    },

    // create a watch task for tracking
    // any changes to the following files
    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: 'jshint:gruntfile'
      },
      client: {
        files: [ 'client/**/*' ],
        tasks: [ 'build', 'karma:watch:run', 'casperjs' ]
      },
      server: {
        files: [ 'server/**/*' ],
        tasks: [ 'build', 'express:dev', 'casperjs' ],
        options: {
          spawn: false // Restart server
        }
      },
      unitTests: {
        files: [ 'test/unit/**/*.js' ],
        tasks: [ 'karma:watch:run' ]
      },
      integrationTests: {
        files: [ 'test/integration/**/*.js' ],
        tasks: [ 'karma:watch:run' ]
      },
      e2eTests: {
        files: [ 'test/e2e/**/*.js' ],
        tasks: [ 'casperjs' ]
      }
    }
  });

  // Perform a build
  grunt.registerTask('build', [ 'jshint', 'clean', 'copy', 'concat', 'uglify']);

  // Run e2e tests once
  grunt.registerTask('teste2e', [ 'express:dev', 'casperjs' ]);

  // Run client tests once
  grunt.registerTask('testClient', [ 'karma:single' ]);

  // Run all tests once
  grunt.registerTask('test', [ 'testClient', 'teste2e']);

  // Run all tests once
  grunt.registerTask('ci', [ 'karma:ci', 'express:dev', 'casperjs' ]);

  // Start watching and run tests when files change
  grunt.registerTask('default', [ 'build', 'express:dev', 'karma:watch:start', 'watch' ]);
};
