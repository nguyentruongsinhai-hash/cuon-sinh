"use strict";

// Ba trang pháp lý phải có trong repo (chân trang dẫn tới chúng, và chúng được
// khai với Facebook/Zalo), và Worker phải nhận đúng tên miền thật của quán.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");

const PHAP_LY = {
  "dieu-khoan-dich-vu": "Điều khoản dịch vụ",
  "chinh-sach-bao-mat": "Chính sách bảo mật",
  "xoa-du-lieu": "Hướng dẫn yêu cầu xoá dữ liệu",
};

test("ba trang pháp lý có trong repo, đúng địa chỉ cũ và có ngày cập nhật", () => {
  for (const [slug, h1] of Object.entries(PHAP_LY)) {
    const f = path.join(ROOT, "src", "pages", slug + ".astro");
    assert.ok(fs.existsSync(f), "thiếu trang /" + slug + "/");
    const html = fs.readFileSync(f, "utf8");
    assert.ok(html.includes("<h1>" + h1 + "</h1>"), slug + " sai tiêu đề");
    assert.match(html, /Cập nhật lần cuối: \d{2}\/\d{2}\/\d{4}/, slug + " thiếu ngày cập nhật");
    assert.match(html, /0844 566 922/, slug + " thiếu hotline");
  }
});

test("mọi link nội bộ ở chân trang đều có trang thật", () => {
  const hrefs = [...read("src", "components", "Footer.astro").matchAll(/href="\/([a-z0-9-]+)\/"/g)].map((m) => m[1]);
  assert.ok(hrefs.length >= 5, "chân trang thiếu link");
  for (const slug of hrefs) {
    const co = ["src/pages/" + slug + ".astro", "src/pages/" + slug + "/index.astro"].some((p) =>
      fs.existsSync(path.join(ROOT, p)),
    );
    assert.ok(co, "chân trang dẫn tới /" + slug + "/ nhưng chưa có trang");
  }
});

test("Worker nhận tên miền cuonsinh.com và www.cuonsinh.com", () => {
  // wrangler.jsonc là JSON có chú thích: bỏ chú thích dòng rồi mới parse.
  const cfg = JSON.parse(read("wrangler.jsonc").replace(/^\s*\/\/.*$/gm, ""));
  // Gắn bằng route của zone cuonsinh.com, phủ mọi đường dẫn của cả hai tên miền.
  const mien = (cfg.routes || []).filter((r) => r.zone_name === "cuonsinh.com").map((r) => r.pattern);
  assert.deepEqual(mien.sort(), ["cuonsinh.com/*", "www.cuonsinh.com/*"]);
  // Có routes mà thiếu dòng này thì wrangler tắt địa chỉ *.workers.dev.
  assert.equal(cfg.workers_dev, true);
});

test("trang /dat-ban/ của site cũ vẫn còn, dùng chung form với trang chủ", () => {
  // Site cũ trên Pages có /dat-ban/ (link đã gửi cho khách, gắn ở Fanpage). Chuyển
  // tên miền sang Worker mà thiếu trang này thì khách bấm link cũ gặp 404.
  const f = path.join(ROOT, "src", "pages", "dat-ban.astro");
  assert.ok(fs.existsSync(f), "thiếu trang /dat-ban/");
  const trang = fs.readFileSync(f, "utf8");
  assert.ok(trang.includes("<h1>Đặt bàn</h1>"), "trang đặt bàn sai tiêu đề");
  assert.match(trang, /<FormDatBan\s*\/>/, "trang đặt bàn chưa gắn form");
  assert.match(read("src", "pages", "index.astro"), /<FormDatBan\s*\/>/, "trang chủ chưa dùng form chung");
  const form = read("src", "components", "FormDatBan.astro");
  assert.match(form, /id="form-dat-ban"/);
  for (const ten of ["ho_ten", "sdt", "ngay", "gio", "so_nguoi", "ghi_chu", "website"]) {
    assert.ok(form.includes('name="' + ten + '"'), "form thiếu ô " + ten);
  }
  assert.match(form, /id="ket-qua"/);
});
