"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { autoTheme, nextSwitch, resolveTheme, manualRecord } = require("../assets/js/theme.js");

// Ngày dựng bằng giờ ĐỊA PHƯƠNG, đúng như trình duyệt của người truy cập.
const at = (h, m = 0) => new Date(2026, 10, 12, h, m, 0, 0);

test("ban ngày 06:00-17:59 là giao diện sáng", () => {
  assert.equal(autoTheme(at(6, 0)), "light");
  assert.equal(autoTheme(at(12, 30)), "light");
  assert.equal(autoTheme(at(17, 59)), "light");
});

test("từ 18:00 tới 05:59 là giao diện tối", () => {
  assert.equal(autoTheme(at(18, 0)), "dark");
  assert.equal(autoTheme(at(23, 15)), "dark");
  assert.equal(autoTheme(at(0, 0)), "dark");
  assert.equal(autoTheme(at(5, 59)), "dark");
});

test("mốc đổi kế tiếp là 06:00 hoặc 18:00 gần nhất", () => {
  assert.deepEqual(nextSwitch(at(3, 20)), at(6, 0));
  assert.deepEqual(nextSwitch(at(6, 0)), at(18, 0));
  assert.deepEqual(nextSwitch(at(14, 45)), at(18, 0));
  assert.deepEqual(nextSwitch(at(21, 48)), new Date(2026, 10, 13, 6, 0, 0, 0));
});

test("không có lựa chọn tay thì theo giờ", () => {
  assert.deepEqual(resolveTheme(at(10), null), { theme: "light", manual: false });
  assert.deepEqual(resolveTheme(at(22), undefined), { theme: "dark", manual: false });
});

test("lựa chọn tay thắng cho tới mốc đổi giờ kế tiếp", () => {
  const rec = manualRecord("light", at(21, 48)); // tối mà chọn sáng
  assert.deepEqual(resolveTheme(at(23, 0), rec), { theme: "light", manual: true });
  assert.deepEqual(resolveTheme(new Date(2026, 10, 13, 5, 59), rec), { theme: "light", manual: true });
  // Qua 06:00 sáng hôm sau: hết hạn, quay lại tự động.
  assert.deepEqual(resolveTheme(new Date(2026, 10, 13, 6, 0), rec), { theme: "light", manual: false });
  assert.deepEqual(resolveTheme(new Date(2026, 10, 13, 19, 0), rec), { theme: "dark", manual: false });
});

test("bản ghi hỏng thì bỏ qua, không làm vỡ trang", () => {
  for (const bad of [{}, { theme: "pink", until: Infinity }, { theme: "dark" }, { theme: "dark", until: "x" }, "dark", 7]) {
    assert.deepEqual(resolveTheme(at(10), bad), { theme: "light", manual: false });
  }
});
