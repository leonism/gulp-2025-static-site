import gulp from "gulp";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import terser from "gulp-terser";
import htmlmin from "gulp-htmlmin";
import imagemin, { mozjpeg, optipng, svgo } from "gulp-imagemin";
import newer from "gulp-newer";
import browserSyncLib from "browser-sync";
import { deleteAsync } from "del";

const sass = gulpSass(dartSass);
const browserSync = browserSyncLib.create();
const { src, dest, watch, series, parallel } = gulp;

const paths = {
  html: {
    src: "src/*.html",
    dest: "dist/",
  },
  styles: {
    src: "src/scss/**/*.scss",
    dest: "dist/css/",
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "dist/js/",
  },
  images: {
    src: "src/images/**/*",
    dest: "dist/images/",
  },
};

// Clean dist folder
function clean() {
  return deleteAsync(["dist/**", "!dist"]);
}

// Compile and minify SCSS
function styles() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        loadPaths: ["src/scss"],
      }).on("error", sass.logError)
    )
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Minify JavaScript
function scripts() {
  return src(paths.scripts.src)
    .pipe(terser())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Minify HTML
function html() {
  return src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Compress Images
function images() {
  return src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin([
        mozjpeg({ quality: 75, progressive: true }),
        optipng({ optimizationLevel: 5 }),
        svgo({
          plugins: [
            { name: "removeViewBox", active: false },
            { name: "cleanupIDs", active: false },
          ],
        }),
      ])
    )
    .pipe(dest(paths.images.dest));
}

// Dev Server
function serve() {
  browserSync.init({
    server: {
      baseDir: "dist/",
    },
  });

  watch(paths.html.src, html);
  watch(paths.styles.src, styles);
  watch(paths.scripts.src, scripts);
  watch(paths.images.src, images);
}

export default series(clean, parallel(html, styles, scripts, images), serve);
