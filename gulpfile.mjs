/**
 * Gulp Configuration File
 *
 * This file defines tasks for automating front-end development workflows including:
 * - SCSS compilation and minification
 * - JavaScript minification
 * - HTML minification
 * - Image optimization
 * - Live reloading via BrowserSync
 *
 * All tasks are configured to process files from 'src/' to 'dist/' directory.
 */

// Import required modules
import gulp from "gulp";
import * as dartSass from "sass"; // Dart Sass compiler (faster implementation of Sass)
import gulpSass from "gulp-sass"; // Gulp plugin for Sass compilation
import sourcemaps from "gulp-sourcemaps"; // Generate source maps for debugging
import autoprefixer from "gulp-autoprefixer"; // Add vendor prefixes to CSS
import cleanCSS from "gulp-clean-css"; // Minify CSS
import terser from "gulp-terser"; // Minify JavaScript
import htmlmin from "gulp-htmlmin"; // Minify HTML
import imagemin, { mozjpeg, optipng, svgo } from "gulp-imagemin"; // Optimize images
import newer from "gulp-newer"; // Only process changed files
import browserSyncLib from "browser-sync"; // Live reload server
import { deleteAsync } from "del"; // Delete files/folders

// Initialize plugins
const sass = gulpSass(dartSass); // Create Sass compiler instance
const browserSync = browserSyncLib.create(); // Create BrowserSync instance
const { src, dest, watch, series, parallel } = gulp; // Gulp methods

/**
 * Paths configuration object
 * Defines source and destination paths for all file types
 */
const paths = {
  html: {
    src: "src/*.html", // Source HTML files
    dest: "dist/", // Destination directory
  },
  styles: {
    src: "src/scss/**/*.scss", // All SCSS files recursively
    dest: "dist/css/", // Output CSS directory
  },
  scripts: {
    src: "src/js/**/*.js", // All JavaScript files recursively
    dest: "dist/js/", // Output JS directory
  },
  images: {
    src: "src/images/**/*", // All image files recursively
    dest: "dist/images/", // Output images directory
  },
};

/**
 * Clean task - Deletes all files in the dist folder except the folder itself
 * @returns {Promise} Promise that resolves when deletion is complete
 */
function clean() {
  return deleteAsync(["dist/**", "!dist"]);
}

/**
 * Styles task - Processes SCSS files:
 * 1. Initializes sourcemaps
 * 2. Compiles SCSS to CSS
 * 3. Adds vendor prefixes
 * 4. Minifies CSS
 * 5. Writes sourcemaps
 * 6. Outputs to destination
 * 7. Injects changes via BrowserSync
 * @returns {Stream} Gulp stream
 */
function styles() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        loadPaths: ["src/scss"], // Additional paths for @import resolution
      }).on("error", sass.logError) // Log errors without breaking
    )
    .pipe(autoprefixer({ cascade: false })) // Add vendor prefixes
    .pipe(cleanCSS({ level: 2 })) // Minify with level 2 optimizations
    .pipe(sourcemaps.write(".")) // Write sourcemaps to same directory
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream()); // Live inject CSS changes
}

/**
 * Scripts task - Processes JavaScript files:
 * 1. Minifies using Terser
 * 2. Outputs to destination
 * 3. Injects changes via BrowserSync
 * @returns {Stream} Gulp stream
 */
function scripts() {
  return src(paths.scripts.src)
    .pipe(terser()) // Minify JavaScript
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

/**
 * HTML task - Processes HTML files:
 * 1. Minifies HTML
 * 2. Outputs to destination
 * 3. Injects changes via BrowserSync
 * @returns {Stream} Gulp stream
 */
function html() {
  return src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true })) // Remove unnecessary whitespace
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

/**
 * Images task - Optimizes images:
 * 1. Only processes newer files
 * 2. Optimizes using different tools for each format:
 *    - JPEG: MozJPEG with 75% quality, progressive loading
 *    - PNG: OptiPNG with level 5 optimization
 *    - SVG: SVGO with custom plugins
 * 3. Outputs to destination
 * @returns {Stream} Gulp stream
 */
function images() {
  return src(paths.images.src)
    .pipe(newer(paths.images.dest)) // Only process changed images
    .pipe(
      imagemin([
        mozjpeg({ quality: 75, progressive: true }),
        optipng({ optimizationLevel: 5 }),
        svgo({
          plugins: [
            { name: "removeViewBox", active: false }, // Keep viewBox attribute
            { name: "cleanupIDs", active: false }, // Don't cleanup IDs
          ],
        }),
      ])
    )
    .pipe(dest(paths.images.dest));
}

/**
 * Serve task - Starts development server with BrowserSync:
 * 1. Initializes server from dist directory
 * 2. Sets up watchers for all file types
 *    - Triggers appropriate tasks on file changes
 *    - Automatically reloads browser when needed
 */
function serve() {
  browserSync.init({
    server: {
      baseDir: "dist/", // Serve files from dist directory
    },
  });

  // Watch for changes in all file types
  watch(paths.html.src, html);
  watch(paths.styles.src, styles);
  watch(paths.scripts.src, scripts);
  watch(paths.images.src, images);
}

// Default task - cleans dist, runs all processing tasks in parallel, then starts server
export default series(clean, parallel(html, styles, scripts, images), serve);
