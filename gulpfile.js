var gulp = require("gulp");
var $ = require("gulp-load-plugins")({ lazy: true });
var replace = require("gulp-string-replace");

gulp.task("styles", async function () {
  log("Compiling SASS");
  gulp
    .src("style.css")
    .pipe($.sass().on("error", $.sass.logError))
    .pipe(gulp.dest("Content"));
});

gulp.task("lint", function () {
  return gulp.src("*.js").pipe($.jshint()).pipe($.jshint.reporter("default"));
});

gulp.task("bundlejs", function () {
  return gulp
    .src(["todo.js"])
    .pipe($.concat("bundle.js"))
    .pipe(gulp.dest("Content"))
    .pipe($.uglify({ mangle: false }))
    .pipe($.rename("bundle.min.js"))
    .pipe(gulp.dest("Content"));
});

gulp.task(
  "bundlecss",
  gulp.series("styles", async function () {
    return gulp
      .src("Content/style.css")
      .pipe($.minifyCss())
      .pipe($.rename("bundle.min.css"))
      .pipe(gulp.dest("Content"));
  })
);

function log(msg) {
  if (typeof msg === "object") {
    var item;
    for (item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}

// For TeamCity
gulp.task("build", gulp.series("bundlejs", "bundlecss"), async function () {});

gulp.task(
  "default",
  gulp.series("build", function () {
    gulp.watch("Content/scss/**/*.scss", ["bundlecss"]);
    var watcher = gulp.watch("app/**/*.js", ["lint", "bundlejs"]);
    watcher.on("change", function (event) {
      console.log(
        "File " + event.path + " was " + event.type + ", running tasks..."
      );
    });
  })
);
