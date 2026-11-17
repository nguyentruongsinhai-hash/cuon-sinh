"use strict";

// Chủ quán gửi 4 ảnh không gian ngày 17/11/2026: mục "Không gian" ở trang chủ và
// trang Giới thiệu có thêm lưới ảnh thật của quán (hai trang dùng chung một component).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const ROOT = path.join(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");
const nap = () => import(pathToFileURL(path.join(ROOT, "src", "data", "khong-gian.mjs")).href);

function coWebp(file) {
  const b = fs.readFileSync(file);
  assert.equal(b.toString("ascii", 0, 4) + b.toString("ascii", 8, 12), "RIFFWEBP", "không phải WebP: " + file);
  const kieu = b.toString("ascii", 12, 16);
  if (kieu === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (kieu === "VP8X") return { w: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
  throw new Error("WebP lạ: " + kieu);
}

test("có đủ 4 ảnh không gian, đúng kích thước khai và đủ nhẹ", async () => {
  const { ANH_KHONG_GIAN } = await nap();
  assert.equal(ANH_KHONG_GIAN.length, 4);
  assert.equal(new Set(ANH_KHONG_GIAN.map((a) => a.file)).size, 4, "ảnh bị trùng");
  for (const a of ANH_KHONG_GIAN) {
    assert.match(a.file, /^khong-gian-[a-z0-9-]+\.webp$/, "tên ảnh sai kiểu: " + a.file);
    const f = path.join(ROOT, "public", "assets", "img", a.file);
    assert.ok(fs.existsSync(f), "thiếu ảnh " + a.file);
    assert.deepEqual(coWebp(f), { w: a.w, h: a.h }, "kích thước khai sai so với file: " + a.file);
    assert.ok(fs.statSync(f).size < 300 * 1024, "ảnh nặng quá 300KB: " + a.file);
    assert.ok(a.moTa && a.moTa.length > 20, "ảnh thiếu mô tả cho người dùng trình đọc màn hình: " + a.file);
    assert.ok(a.chuThich, "ảnh thiếu chú thích: " + a.file);
  }
});

test("lưới ảnh không gian hiện ở trang chủ lẫn trang Giới thiệu, không làm trang giật", () => {
  const the = read("src", "components", "AnhKhongGian.astro");
  assert.match(the, /src=\{'\/assets\/img\/' \+ a\.file\}/);
  assert.match(the, /alt=\{a\.moTa\}/);
  assert.match(the, /width=\{a\.w\}/, "ảnh thiếu chiều rộng, trang sẽ giật khi tải");
  assert.match(the, /height=\{a\.h\}/, "ảnh thiếu chiều cao, trang sẽ giật khi tải");
  assert.match(the, /loading="lazy"/, "ảnh nằm dưới màn hình đầu nên phải tải chậm");
  for (const trang of ["index.astro", "about.astro"]) {
    const t = read("src", "pages", trang);
    const muc = t.slice(t.indexOf('<p class="eyebrow eyebrow--lon">Không gian</p>'));
    assert.match(muc.slice(0, muc.indexOf("</section>")), /<AnhKhongGian \/>/, trang + " chưa có ảnh trong mục Không gian");
  }
  const css = read("public", "assets", "css", "site.css");
  assert.match(css, /\.space-anh img\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/, "khung ảnh phải giữ tỷ lệ 3:2");
  assert.match(css, /\.space-anh img\s*\{[^}]*object-fit:\s*cover/);
});
