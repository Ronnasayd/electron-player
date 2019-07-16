const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const imagemin = require("gulp-imagemin");
const cleanCSS = require("gulp-clean-css");
const cache = require("gulp-cached");
const minimist = require("minimist");
const concat = require("gulp-concat");
const sassPartials = require('gulp-sass-partials-imported');
const livereload = require('gulp-livereload');






const src_scss = "app/static/src/scss/**/*.scss";
const src_css = "app/static/src/css/**/*.css";


const images_folder = "app/static/images/**/*.{png,jpeg,jpg,svg,ico}";

const not_node = "!node_modules/"

const dist_css = "app/static/dist/css/"


const html_files = "app/**/*.html"
const js_files = "./**/*.js"




const sassToCssMin = () => {
    return gulp.src([src_scss, "!_*.scss", not_node], { allowEmpty: true })
        .pipe(cache("sassToCssMin"))
        .pipe(sassPartials("app/static/src/scss"))
        .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
        .pipe(sass({
            errLogToConsole: true,
            indentedSyntax: false,
        }).on("error", function (err) {
            console.log(err.message);
            browserSync.notify(err.message, 3000); // Display error in the browser
            this.emit("end"); // Prevent gulp from catching the error and exiting the watch process
        }))
        .pipe(autoprefixer())
        .on("error", function (err) {
            console.log(err.message, err);
            browserSync.notify(err.message, 3000); // Display error in the browser
            this.emit("end"); // Prevent gulp from catching the error and exiting the watch process
        })
        .pipe(cleanCSS())
        .pipe(rename(function (file) {
            file.extname = ".min.css"
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dist_css))
}

const minifyCss = () => {
    return gulp.src([src_css, "!_*.css", not_node], { allowEmpty: true })
        .pipe(cache("minifyCss"))
        .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
        .pipe(autoprefixer())
        .on("error", function (err) {
            console.log(err.message, err);
            browserSync.notify(err.message, 3000); // Display error in the browser
            this.emit("end"); // Prevent gulp from catching the error and exiting the watch process
        })
        .pipe(cleanCSS())
        .pipe(rename(function (file) {
            file.extname = ".min.css"
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dist_css))
}


//  gulp concatfiles --files <list_of_files:file1,file2,file3> --name <name_of_file:all.js> --dist <destination>
const concatFiles = () => {
    let options = minimist(process.argv.slice(2));
    console.log("files: " + options.files);
    console.log("name: " + options.name);
    console.log("dist: " + options.dist);
    return gulp.src(options.files.split(","), { base: "./", allowEmpty: true })
        .pipe(cache("concatFiles"))
        .pipe(sourcemaps.init())
        .pipe(concat(options.name))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(options.dist))
}




const browserReload = (done) => {
    livereload();
    done();
}

const minifyImages = () => {
    return gulp.src([images_folder, not_node], { base: "./", allowEmpty: true })
        .pipe(cache("minifyImages"))
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(gulp.dest("./"))
}


const sass_line = gulp.series(sassToCssMin, browserReload)
const css_line = gulp.series(minifyCss, browserReload);
const image_line = gulp.series(minifyImages);



const reloadServer = () => {
    livereload.listen();

    gulp.watch(src_scss, { interval: 100, usePolling: true }, sass_line);
    gulp.watch(src_css, { interval: 100, usePolling: true }, css_line);
    gulp.watch(images_folder, { interval: 100, usePolling: true }, image_line);
    gulp.watch(html_files, { interval: 100, usePolling: true }, browserReload);
    gulp.watch(js_files, { interval: 100, usePolling: true }, browserReload);
}

const server = gulp.series(gulp.parallel(css_line, sass_line, image_line), reloadServer)

exports.concatfiles = concatFiles
exports.default = server
