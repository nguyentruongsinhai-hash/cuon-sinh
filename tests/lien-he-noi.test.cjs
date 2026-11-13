"use strict";

// Cụm nút liên hệ nổi ở góc phải (Zalo, hotline, Messenger) phải có trên mọi trang
// và mỗi nút trỏ đúng kênh của nó.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");

test("ba đường dẫn liên hệ đúng kênh", () => {
  const consts = read("src", "consts.ts");
  assert.match(consts, /ZALO_URL = 'https:\/\/zalo\.me\/0844566922'/, "Zalo phải mở chat với số của quán");
  assert.match(consts, /HOTLINE_TEL = 'tel:0844566922'/, "hotline phải mở màn hình gọi với số của quán");
  assert.match(consts, /MESSENGER_URL = 'https:\/\/m\.me\/nhahangcuonsinh'/, "Messenger phải mở chat với Fanpage");
});

test("cụm nút nổi có đủ ba nút, đúng thứ tự Zalo, hotline, Messenger", () => {
  const html = read("src", "components", "LienHeNoi.astro");
  const thuTu = [...html.matchAll(/href=\{(ZALO_URL|HOTLINE_TEL|MESSENGER_URL)\}/g)].map((m) => m[1]);
  assert.deepEqual(thuTu, ["ZALO_URL", "HOTLINE_TEL", "MESSENGER_URL"]);
  // Nút chỉ có biểu tượng nên phải có nhãn đọc được cho trình đọc màn hình
  assert.equal((html.match(/aria-label=/g) || []).length >= 4, true, "thiếu nhãn aria");
  // Gọi điện mở ngay trên máy khách, không mở tab mới
  assert.doesNotMatch(html, /href=\{HOTLINE_TEL\}[^>]*target=/, "nút gọi không được mở tab mới");
});

test("mọi trang đều có cụm nút nổi qua khung chung", () => {
  const base = read("src", "layouts", "Base.astro");
  assert.match(base, /import LienHeNoi from '\.\.\/components\/LienHeNoi\.astro'/);
  assert.match(base, /<LienHeNoi \/>/);
});

test("cụm nút nổi ghim ở góc phải và né thanh thao tác trên điện thoại", () => {
  const css = read("public", "assets", "css", "site.css");
  assert.match(css, /\.lien-he\s*\{[^}]*position:\s*fixed[^}]*right:/, "phải ghim cố định bên phải");
  assert.match(css, /\.lien-he\s*\{[^}]*bottom:\s*calc\(60px/, "trên điện thoại phải nằm trên thanh thao tác 60px");
});

test("thanh đáy điện thoại: nút Nhắn tin mở Zalo của quán", () => {
  const dock = fs.readFileSync(path.join(__dirname, "..", "src", "components", "Dock.astro"), "utf8");
  assert.match(dock, /<a href=\{ZALO_URL\}[^>]*>[\s\S]*?Nhắn tin<\/a/, "nút Nhắn tin phải dẫn về Zalo");
  assert.doesNotMatch(dock, /MESSENGER_URL/, "thanh đáy không còn dẫn sang Messenger");
});
