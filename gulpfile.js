var gulp          = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		cleancss      = require('gulp-clean-css'),
		browsersync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		del           = require('del'),
		notify        = require('gulp-notify'),
		imagemin      = require('gulp-imagemin'),
		pngquant      = require('imagemin-pngquant'),
		cache         = require('gulp-cache'),
		rsync         = require('gulp-rsync');

gulp.task('browser-sync', function() {
	browsersync({
	server: {
	 baseDir: 'app'
	},
	notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	});
});

gulp.task('sass', function() {
	return gulp.src(['app/scss/**/*.scss'])
	 .pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
	 .pipe(rename({ suffix:'.min', prefix : '' }))
	 .pipe(autoprefixer(['last 15 versions']))
	 .pipe(cleancss( {level: {1: { specialComments: 0 } } }))
	 .pipe(gulp.dest('app/css'))
	 .pipe(browsersync.stream())
});

gulp.task('js', function() {
	return gulp.src([
	'app/libs/bootstrap/js/bootstrap.min.js',
	'app/libs/jquery/dist/jquery.min.js',
	'app/js/common.js' // Always at the end
	 ])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Minify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browsersync.reload({ stream: true }));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch(['app/scss/**/*.sass','app/scss/**/*.scss'], ['sass']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browsersync.reload);
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({
	interlaced: true,
	progressive: true,
	svgoPlugins: [{removeViewBox: false}],
	use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['removedist', 'img', 'sass', 'js'], function() {
	var buildCss = gulp.src('app/css/**/*').pipe(gulp.dest('dist/css'));
	var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));
	var buildJs = gulp.src('app/js/**/*').pipe(gulp.dest('dist/js'));
	var buildHtml = gulp.src('app/*.html').pipe(gulp.dest('dist'));
});

gulp.task('rsync', function() {
	return gulp.src('dist/**').pipe(rsync({
	root: 'dist',
	hostname: 'username@yousite.com',
	destination: 'yousite/public_html',
	//include: ['*.htaccess'], //Includes files to deploy
	exclude: ['**/Thumbs.db', '**/*.DS_Store'], //Exlclude files from deploy
	recursive: true,
	archive: true,
	silent: false,
	compress: true
	}));
});

gulp.task('removedist', function() {
	return del.sync('dist');
});

gulp.task('clearcache', function() {
	return cache.clearAll();
});


gulp.task('default', ['watch']);
