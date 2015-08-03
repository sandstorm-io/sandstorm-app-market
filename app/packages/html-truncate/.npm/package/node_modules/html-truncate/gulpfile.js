var path = require('path');
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var INPUT = path.join(__dirname, 'index.js');
var OUTPUT = path.join(__dirname, 'dist');

gulp.task('default', function () {
    return browserify(INPUT)
        .require('./lib/truncate.js', { expose: 'truncate' })
        .bundle()
        .pipe(source('truncate.js'))
        .pipe(gulp.dest(OUTPUT));
});
