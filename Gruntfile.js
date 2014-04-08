module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		
		clean: {
			build: {
				src: ['build', 'app/assets/js/dist']
			}
		},
		copy: {
			images: {
				expand: true,
				cwd: 'app/assets/images',
				src: '**',
				dest: 'build/images/'
			},
			cssutils: {
				expand: true,
				cwd: 'app/assets/less/utils',
				src: ['*.css'],
				dest: 'build/css/utils'
			}
		},
		ngmin: {
			controllers: {
				files: [{
					expand: true,
					cwd: 'app/assets/js/src/controllers',
					src: ['*.js'],
					dest: 'app/assets/js/dist'

				}]
			},
			directives: {
				files: [{
					expand: true,
					cwd: 'app/assets/js/src/directives',
					src: ['*.js'],
					dest: 'app/assets/js/dist'

				}]
			}
		},
		concat: {
			libs: {
				files: {
					'build/js/libs.js' : ['app/assets/js/libs/*.js']
				}
			},
			main: {
				src: ['app/assets/js/src/filters.js', 'app/assets/js/src/app.main.js', 'app/assets/js/dist/*.js'],
				dest: 'build/js/main.js'
			}
		},
		less: {
			compile: {
				options: {},
				files: {
					'build/css/style.css' : 'app/assets/less/style.less'
				}
			}
		},
		jade: {
			main: {
				files: {
					'build/index.html' : 'app/views/index.jade'
				}
			},
			partials: {
				files: [{
					expand: true,
					cwd: 'app/views/partials',
					src: ['*.jade'],
					dest: 'build/partials',
					ext: '.html'

				}]
			},
		},
		watch: {
			ngjs: {
				files: ['app/assets/js/src/**/*.js'],
				tasks: ['ngmin', 'concat:main']
			},
			libsjs: {
				files: ['app/assets/js/libs/*.js'],
				tasks: ['concat:libs']
			},
			less: {
				files: ['app/assets/less/*.less'],
				tasks: ['less']
			},
			jade: {
				files: ['app/views/**/*.jade'],
				tasks: ['jade']
			}
		},
		nodemon: {
			server: {
				options: {
					file: 'server.js'
				}
			}
		},
		concurrent: {
			starter: {
				tasks: ['watch', 'nodemon:server'],
				options: {
					logConcurrentOutput: true
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('build', ['clean', 'copy', 'ngmin', 'concat', 'less', 'jade']);
	grunt.registerTask('default', ['concurrent:starter']);
};