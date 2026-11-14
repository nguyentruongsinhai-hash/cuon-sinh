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

// Chủ quán báo 14/11/2026: thêm trang vào màn hình chính iPhone ra ô đen chữ "C".
// iPhone không dùng favicon.svg, nó cần apple-touch-icon dạng PNG, vuông, KHÔNG trong
// suốt (chỗ trong suốt bị tô đen). Android lấy icon từ manifest.
test("thêm vào màn hình chính ra icon chiếc nón của quán", () => {
  const ROOT = path.join(__dirname, "..");
  const coPng = (f) => {
    const b = fs.readFileSync(f);
    assert.equal(b.toString("latin1", 1, 4), "PNG", "không phải PNG: " + f);
    // IHDR: rộng, cao (4 byte mỗi số), rồi độ sâu màu và kiểu màu (2 = RGB, không có kênh trong suốt)
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), kieuMau: b[25] };
  };
  const base = read(path.join(SRC, "layouts", "Base.astro"));
  assert.match(base, /<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png" \/>/);
  assert.match(base, /<link rel="manifest" href="\/site\.webmanifest" \/>/);
  assert.match(base, /<meta name="apple-mobile-web-app-title" content="Cuốn Sinh" \/>/);
  assert.deepEqual(coPng(path.join(ROOT, "public", "apple-touch-icon.png")), { w: 180, h: 180, kieuMau: 2 });

  const mf = JSON.parse(read(path.join(ROOT, "public", "site.webmanifest")));
  assert.equal(mf.short_name, "Cuốn Sinh");
  for (const co of [192, 512]) {
    const ic = mf.icons.find((i) => i.sizes === co + "x" + co);
    assert.ok(ic, "manifest thiếu icon " + co);
    assert.equal(ic.type, "image/png");
    assert.deepEqual(coPng(path.join(ROOT, "public", ic.src)), { w: co, h: co, kieuMau: 2 });
  }
});
