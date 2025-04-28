import { src, dest, watch, series, parallel } from "gulp";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import terser from "gulp-terser";
import htmlmin from "gulp-htmlmin";
import fileinclude from "gulp-file-include";
import newer from "gulp-newer";
import browserSyncLib from "browser-sync";
import { deleteAsync } from "del";
import { promises as fs } from "fs";
import path from "path";
import imagemin from "imagemin";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminOptipng from "imagemin-optipng";
import imageminSvgo from "imagemin-svgo";
import imageminPngquant from "imagemin-pngquant";
import webp from "gulp-webp";
import { Transform } from "stream";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Initialize plugins
const sass = gulpSass(dartSass);
const browserSync = browserSyncLib.create();

// Noop stream helper
const noop = () =>
  new Transform({
    transform(chunk, encoding, callback) {
      callback(null, chunk);
    },
  });

// Paths configuration
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
    src: "src/images/**/*.{jpg,jpeg,png,svg}",
    dest: "dist/images/",
  },
  webp: {
    src: "src/images/**/*.{jpg,jpeg,png}",
    dest: "dist/images/",
  },
};

// Clean dist folder
export function clean() {
  return deleteAsync(["dist/**", "!dist"]);
}

// Compile and minify SCSS files
export function styles() {
  const isProd = process.env.NODE_ENV === "production";

  return src(paths.styles.src)
    .pipe(isProd ? noop() : sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(isProd ? noop() : sourcemaps.write("."))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Compile HTML files with includes
export function html() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return src([paths.html.src, "!src/layout/**", "!src/components/**"])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: path.join(__dirname, "src"),
        context: {},
      })
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// Minify JS files
export function scripts() {
  return src(paths.scripts.src)
    .pipe(terser())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Optimize images
export async function images() {
  const files = await imagemin([paths.images.src], {
    destination: paths.images.dest,
    plugins: [
      imageminMozjpeg({ quality: 40, progressive: true }),
      imageminOptipng({
        optimizationLevel: 7,
        bitDepthReduction: true,
        colorTypeReduction: true,
        paletteReduction: true,
      }),
      imageminPngquant({
        quality: [0.6, 0.8],
        speed: 1,
        strip: true,
        dithering: 0.5,
      }),
      imageminSvgo({
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      }),
    ],
  });
  return files;
}

// Convert images to WebP
export function webpImages() {
  return src(paths.webp.src)
    .pipe(newer(paths.webp.dest))
    .pipe(webp({ quality: 75 }))
    .pipe(dest(paths.webp.dest))
    .pipe(browserSync.stream());
}

// Image optimization report
async function logImageSizes() {
  const srcDir = "src/images";
  const distDir = "dist/images";

  try {
    const files = await fs.readdir(srcDir);
    const imageFiles = files.filter((file) =>
      [".png", ".jpg", ".jpeg", ".svg"].includes(
        path.extname(file).toLowerCase()
      )
    );

    console.log("Image Optimization Report:");
    console.log("-------------------------");

    for (const file of imageFiles) {
      try {
        const srcPath = path.join(srcDir, file);
        const distPath = path.join(distDir, file);
        const [srcStat, distStat] = await Promise.all([
          fs.stat(srcPath),
          fs.stat(distPath).catch(() => null),
        ]);

        if (distStat) {
          const srcSize = srcStat.size;
          const distSize = distStat.size;
          const savings = (((srcSize - distSize) / srcSize) * 100).toFixed(2);
          console.log(
            `${file}: ${(srcSize / 1024).toFixed(2)}KB → ${(
              distSize / 1024
            ).toFixed(2)}KB (${savings}% saved)`
          );
        }
      } catch (err) {
        console.log(`Error processing ${file}: ${err.message}`);
      }
    }
  } catch (err) {
    console.log(`Error reading directory: ${err.message}`);
  }
}

// Dev Server
export function serve() {
  browserSync.init({
    server: {
      baseDir: "dist/",
    },
    notify: false,
    open: false,
  });

  watch(paths.html.src, series(html));
  watch(paths.styles.src, series(styles));
  watch(paths.scripts.src, series(scripts));
  watch(paths.images.src, series(images));
  watch(paths.webp.src, series(webpImages));
}

// Build task
export const build = series(
  clean,
  parallel(html, styles, scripts, images, webpImages),
  logImageSizes
);

// Default task
export default series(build, serve);
