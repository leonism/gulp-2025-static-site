// gulpfile.mjs

import { src, dest, watch, series, parallel } from "gulp";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import terser from "gulp-terser";
import htmlmin from "gulp-htmlmin";
import imagemin from "gulp-imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminOptipng from "imagemin-optipng";
import imageminSvgo from "imagemin-svgo";
import newer from "gulp-newer";
import browserSyncLib from "browser-sync";
import { deleteAsync } from "del";

// Initialize Sass compiler
const sass = gulpSass(dartSass);

// Initialize BrowserSync
const browserSync = browserSyncLib.create();

// Paths
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

// 🧹 Clean dist folder
export function clean() {
  return deleteAsync(["dist/**", "!dist"]);
}

// 💅 Compile and minify SCSS with sourcemaps
export function styles() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// 📝 Minify HTML
export function html() {
  return src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// 📜 Minify JavaScript
export function scripts() {
  return src(paths.scripts.src)
    .pipe(terser())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// 🖼️ Optimize images — final, correct version
export function images() {
  return src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(
      imagemin([
        imageminMozjpeg({ quality: 75, progressive: true }),
        imageminOptipng({ optimizationLevel: 5 }),
        imageminSvgo({
          plugins: [{ name: "removeViewBox", active: false }],
        }),
      ])
    )
    .pipe(dest(paths.images.dest))
    .pipe(browserSync.stream());
}

// 🔄 Live-reload Dev Server
export function serve() {
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

// 🏗️ Master Tasks
export const build = series(clean, parallel(html, styles, scripts, images));
export default series(build, serve);
