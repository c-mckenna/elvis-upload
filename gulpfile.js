// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var fs            = require('fs');
var header        = require('gulp-header');
var eslint        = require('gulp-eslint');
var babel         = require('gulp-babel');
var concat        = require('gulp-concat');
var concatCss     = require('gulp-concat-css');
var uglify        = require('gulp-uglify');
var templateCache = require('gulp-angular-templatecache');
var addStream     = require('add-stream');

var directories = {
	assets:      'dist/upload/assets',
	source:      'source',
	resources:  'resources',
	outresources:'dist/upload/resources',
   views:      'views',
   outbower:   'dist/upload/bower_components'
};

// Lint Task
gulp.task('lint', function() {
    return gulp.src(directories.source + '/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('resources', function () {
    return gulp.src(directories.resources + '/**/*')
        .pipe(gulp.dest(directories.outresources));
});

gulp.task('views', function () {
    return gulp.src(directories.views + '/**/*')
        .pipe(gulp.dest('dist'));
});

//Concatenate & Minify JS
gulp.task('scripts', ["commonScripts", 'uploadScripts']);

//Concatenate & Minify JS
gulp.task('commonScripts', function() {
   return prepareScripts('common');
});

gulp.task('uploadScripts', function() {
   return prepareScripts('upload');
});

function prepareScripts(name) {
   return gulp.src(directories.source + '/' + name + '/**/*.js')
      .pipe(babel({
            compact: false,
            comments: true,
            presets: ['es2015'],
            plugins: ["syntax-async-generators", "transform-regenerator"]
      }))
	   .pipe(addStream.obj(prepareNamedTemplates(name)))
      .pipe(concat(name + '.js'))
      .pipe(header(fs.readFileSync(directories.source + '/licence.txt', 'utf8')))
      .pipe(gulp.dest(directories.assets));
}


//Concatenate & Minify JS
gulp.task('squash', []); // ['squashCommon','squashIcsm', 'squashWater', 'squashStart', 'squashImagery', 'squashUpload']);

gulp.task('squashCommon', function() {
	return gulp.src(directories.assets + '/common.js')
      .pipe(babel({
            compact: true,
            comments:	false,
            presets: ['es2015'],
            plugins: ["syntax-async-generators"]
      }))
		.pipe(uglify())
      .pipe(header(fs.readFileSync(directories.source + '/licence.txt', 'utf8')))
		.pipe(gulp.dest(directories.assets + "/min"));
});

gulp.task('squashUpload', function() {
	return squashJs('upload');
});

function squashJs(name) {
	return gulp.src(directories.assets + '/' + name + '.js')
		.pipe(uglify())
		.pipe(gulp.dest(directories.assets + "/min"));
}


// Watch Files For Changes
gulp.task('watch', function() {
	// We watch both JS and HTML files.
    gulp.watch(directories.source + '/**/*(*.js|*.html)', ['lint']);
    gulp.watch(directories.source + '/common/**/*(*.js|*.html)', ['commonScripts']);
    gulp.watch(directories.source + '/upload/**/*(*.js|*.html)', ['uploadScripts']);
    gulp.watch(directories.source + '/**/*.css', ['concatCss']);
    gulp.watch(directories.assets + '/common.js', ['squashCommon']);
    gulp.watch(directories.views +  '/*', ['views']);
    gulp.watch(directories.resources + '/**/*', ['resources']);
    //gulp.watch('scss/*.scss', ['sass']);
});

gulp.task('concatCss', function () {
  return gulp.src(directories.source + '/**/*.css')
    .pipe(concatCss("upload.css"))
    .pipe(gulp.dest(directories.assets));
});

gulp.task('package', function() {
   return gulp.src('package.json')
      .pipe(gulp.dest(directories.assets));
});

gulp.task('build', ['views', 'package', 'scripts', 'concatCss', 'resources'])

// Default Task
gulp.task('default', ['lint', 'scripts', 'concatCss', 'watch', 'package', 'resources', 'views']);

function prepareNamedTemplates(name) {
   return gulp.src(directories.source + '/' + name + '/**/*.html')
      .pipe(templateCache({module: name + ".templates", root:name, standalone : true}));
}