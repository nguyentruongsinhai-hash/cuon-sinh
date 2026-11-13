"use strict";

// Địa chỉ xem thử của từng nhánh phải được BẬT TƯỜNG MINH.
// Lý do: khi wrangler.jsonc có "routes" mà thiếu "preview_urls", wrangler tự TẮT
// địa chỉ xem thử. Ngày 12/11/2026 một lần deploy có "routes" đã tắt cả workers.dev
// lẫn địa chỉ xem thử trong khi tên miền thật chưa gắn được, làm website không còn
// địa chỉ nào mở được (lỗi 1042).
// Dòng "workers_dev" đã có test giữ ở tests/phap-ly-va-ten-mien.test.cjs.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// wrangler.jsonc là JSON có chú thích: bỏ chú thích dòng rồi mới parse.
const cfg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, ""),
);

test("địa chỉ xem thử của nhánh được bật tường minh", () => {
  assert.equal(cfg.preview_urls, true);
});
