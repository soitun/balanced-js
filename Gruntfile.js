/*jshint camelcase: false */
/*global module:false */
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            js: {
                options: {
                    banner: '////\n// <%= pkg.name %>\n// version: <%= pkg.version %>\n// built: <%= grunt.template.today("yyyy-mm-dd") %>\n////\n\n',
                    footer: grunt.file.read('license.txt', {
                        encoding: 'utf8'
                    }),
                    mangle: false,
                    beautify: true,
                    wrap: 'balanced'
                },
                files: {
                    'build/<%= pkg.name %>': [
                        'src/<%= pkg.name %>',
                        'src/utils.js',
                        'lib/json2.js',
                        'lib/xd.js'
                    ]
                }
            },
            proxy: {
                options: {
                    banner: '////\n// balanced.js proxy\n// version: <%= pkg.version %>\n// built: <%= grunt.template.today("yyyy-mm-dd") %>\n////\n\n'
                },
                files: {
                    'build/balanced-proxy.js': [
                        'src/proxy.js',
                        'lib/json2.js',
                        'lib/ajax.js',
                        'lib/xd.js'
                    ]
                }
            }
        },
        htmlbuild: {
            proxy: {
                src: 'templates/proxy.html',
                dest: 'build/proxy.html',
                options: {
                    beautify: false,
                    sections: {
                        js: 'build/balanced-proxy.js'
                    }
                }
            }
        },
        purge: {
            js: {
                src: 'build/<%= pkg.name %>'
            },
            proxy: {
                src: [
                    'build/balanced-proxy.js',
                    'build/proxy.html'
                ]
            },
            test: {
                src: [
                    'build/test'
                ]
            }
        },
        connect: {
            ////
            // This tasks blocks, i.e. creates a node.js connect http server (port 3000)
            ////
            proxy: {
                options: {
                    port: 3000,
                    hostname: '*',
                    base: 'build',
                    keepalive: true
                }
            },
            ////
            // This tasks blocks, i.e. creates a node.js connect http server (port 3001)
            ////
            example: {
                options: {
                    port: 3001,
                    hostname: '*',
                    base: 'example',
                    keepalive: true
                }
            }
        },
        concat: {
            test: {
                src: [
                    'test/lib/*.js',
                    'test/unit/**/*.js',
                    'test/integration/**/*.js'
                ],
                dest: 'build/test/js/tests.js'
            }
        },
        copy: {
            test: {
                files: [
                    {
                        src: 'test/support/testconfig.js',
                        dest: 'build/test/js/testconfig.js'
                    },
                    {
                        cwd: 'test/support/static/',
                        expand: true,
                        src: ['**'],
                        dest: 'build/test/'
                    },
                    {
                        cwd: 'test/support/lib/',
                        expand: true,
                        src: ['**'],
                        dest: 'build/test/js'
                    },
                ]
            },
        },

//        jshint: {
//            all: [
//                'src/**/*.js'
//            ],
//            options: {
//                jshintrc: '.jshintrc'
//            },
//            test: {
//                files: {
//                    src: [
//                        'test/**/*.js',
//                        '!test/support/lib/*.*',
//                        '!test/support/*.js'
//                    ],
//                },
//                options: {
//                    jshintrc: 'test/.jshintrc'
//                }
//            }
//        },

        qunit: {
            options: {
                '--web-security': 'no',
                timeout: 60000,
                coverage: {
                    src: ['build/js/balanced.js'],
                    instrumentedFiles: 'temp/',
                    htmlReport: 'report/coverage',
                    coberturaReport: 'report/',
                    linesThresholdPct: 84,
                    statementsThresholdPct: 82,
                    functionsThresholdPct: 76,
                    branchesThresholdPct: 56
                }
            },
            all: ['build/test/runner.html']
        },

    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Build tasks
    grunt.registerTask('default', ['uglify:js', 'uglify:proxy', 'htmlbuild:proxy']);
    grunt.registerTask('build', ['uglify:js', 'uglify:proxy', 'htmlbuild:proxy']);
    grunt.registerTask('build-js', 'uglify:js');
    grunt.registerTask('build-proxy', ['uglify:proxy', 'htmlbuild:proxy']);

    // Clean tasks
    grunt.renameTask('clean', 'purge');
    grunt.registerTask('clean', ['purge:js', 'purge:proxy', 'purge:test']);
    grunt.registerTask('clean-js', 'purge:js');
    grunt.registerTask('clean-proxy', 'purge:proxy');

    // Serve tasks
    grunt.registerTask('serve-proxy', 'connect:proxy');
    grunt.registerTask('serve-example', 'connect:example');

    grunt.registerTask('test', ['build', 'copy:test', 'concat:test', 'qunit']);
};