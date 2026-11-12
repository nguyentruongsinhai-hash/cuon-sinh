"use strict";

// Địa chỉ thử workers.dev và địa chỉ xem thử của từng nhánh phải được BẬT TƯỜNG MINH.
// Lý do: khi wrangler.jsonc có "routes" mà thiếu "workers_dev", wrangler tự TẮT
// workers.dev và cả địa chỉ xem thử. Ngày 12/11/2026 một lần deploy có "routes"
// đã tắt cả hai trong khi tên miền thật chưa gắn được, làm website không còn
// địa chỉ nào mở được (lỗi 1042).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// wrangler.jsonc là JSON có chú thích: bỏ chú thích dòng rồi mới parse.
const cfg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, ""),
);

test("workers.dev được bật tường minh, không phụ thuộc mặc định của wrangler", () => {
  assert.equal(cfg.workers_dev, true);
});

test("địa chỉ xem thử của nhánh được bật tường minh", () => {
  assert.equal(cfg.preview_urls, true);
});
