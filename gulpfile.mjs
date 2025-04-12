/**
 * Gulp Configuration File
 *
 * Modern static site build system with:
 * - Sass compilation with sourcemaps
 * - JavaScript minification
 * - HTML minification
 * - Image optimization (JPEG, PNG, SVG)
 * - Live reload development server
 *
 * All tasks process files from src/ to dist/ directory
 */

// Core modules
import gulp from "gulp";
import { deleteAsync } from "del";

// CSS processing
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";

// JS processing
import terser from "gulp-terser";

// HTML processing
import htmlmin from "gulp-htmlmin";

// Image optimization
import imagemin from "gulp-imagemin";
import mozjpeg from "imagemin-mozjpeg";
import optipng from "imagemin-optipng";
import svgo from "imagemin-svgo";

// Utilities
import newer from "gulp-newer";
import browserSyncLib from "browser-sync";

// Initialize plugins
const sass = gulpSass(dartSass);
const browserSync = browserSyncLib.create();
const { src, dest, watch, series, parallel } = gulp;

/**
 * File path configurations
 * Defines source and destination paths for all asset types
 */
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
    src: "src/images/**/*.{jpg,png,svg}",
    dest: "dist/images/",
  },
};

/**
 * Optimizes images and copies to dist folder
 * - Processes only changed files
 * - Applies format-specific optimizations:
 *   - JPEG: 75% quality with progressive loading
 *   - PNG: Level 5 optimization
 *   - SVG: SVGO cleanup
 */
function images() {
  return src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(dest(paths.images.dest))
    .pipe(
      imagemin([
        mozjpeg({ quality: 75 }),
        optipng({ optimizationLevel: 5 }),
        svgo(),
      ])
    )
    .pipe(dest(paths.images.dest));
}

/**
 * Cleans dist directory while preserving the folder structure
 */
function clean() {
  return deleteAsync(["dist/**", "!dist"]);
}

/**
 * Processes SCSS stylesheets:
 * - Compiles to CSS
 * - Adds vendor prefixes
 * - Minifies output
 * - Generates sourcemaps
 * - Live-injects changes
 */
function styles() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

/**
 * Processes JavaScript files:
 * - Minifies using Terser
 * - Generates production-ready files
 */
function scripts() {
  return src(paths.scripts.src)
    .pipe(terser())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

/**
 * Processes HTML files:
 * - Minifies by removing whitespace
 * - Optimizes for production
 */
function html() {
  return src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

/**
 * Development server with live reload
 * - Serves files from dist directory
 * - Watches for changes in all assets
 * - Automatically reloads browser
 */
function serve() {
  browserSync.init({
    server: { baseDir: "dist/" },
  });

  watch(paths.html.src, html);
  watch(paths.styles.src, styles);
  watch(paths.scripts.src, scripts);
  watch(paths.images.src, images);
}

// Production build task
const build = series(clean, parallel(html, styles, scripts, images));

// Exported tasks
export { clean, build };
export default series(clean, parallel(html, styles, scripts, images), serve);
