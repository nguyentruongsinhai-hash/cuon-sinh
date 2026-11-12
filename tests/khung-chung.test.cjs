"use strict";

// Mọi trang phải dùng khung chung Base.astro (đầu trang, chân trang, nút giao diện)
// và không còn sót nội dung của mẫu blog Astro.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const SRC = path.join(__dirname, "..", "src");
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(SRC);
const read = (f) => fs.readFileSync(f, "utf8");
const rel = (f) => path.relative(SRC, f);

test("mọi trang .astro đều đi qua khung chung", () => {
  const pages = files.filter((f) => rel(f).startsWith("pages") && f.endsWith(".astro"));
  assert.ok(pages.length >= 4, "thiếu trang");
  for (const f of pages) {
    assert.match(read(f), /layouts\/(Base|BlogPost)\.astro/, rel(f) + " chưa dùng khung chung");
  }
  assert.match(read(path.join(SRC, "layouts", "BlogPost.astro")), /from '\.\/Base\.astro'/);
});

test("khung chung có nút đổi giao diện và nhúng script giao diện vào head", () => {
  assert.match(read(path.join(SRC, "components", "Header.astro")), /id="nut-giao-dien"/);
  assert.match(read(path.join(SRC, "layouts", "Base.astro")), /set:html=\{themeScript\}/);
});

test("không còn nội dung mẫu của Astro", () => {
  for (const f of files.filter((x) => /\.(astro|md|mdx|ts|js|css)$/.test(x))) {
    assert.doesNotMatch(read(f), /Lorem ipsum|Astro Blog|Hello, Astronaut|Your name here|astrodotbuild|Atkinson/i, rel(f));
  }
});
