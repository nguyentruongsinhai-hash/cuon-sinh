"use strict";

// Nền SEO của cuonsinh.com (chủ quán giao 17/11/2026): Google phải đọc được đây là
// một nhà hàng có địa chỉ, giờ mở cửa, thực đơn, chỗ đặt bàn, và tìm được mọi trang.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");

test("robots.txt cho đọc toàn trang và chỉ tới sitemap", () => {
  const r = read("public", "robots.txt");
  assert.match(r, /^User-agent: \*$/m);
  assert.match(r, /^Allow: \/$/m);
  assert.match(r, /^Sitemap: https:\/\/cuonsinh\.com\/sitemap-index\.xml$/m);
  // Chặn nhầm cả trang là mất hết kết quả tìm kiếm
  assert.doesNotMatch(r, /^Disallow: \/$/m);
});

test("dữ liệu nhà hàng lấy từ một nguồn, không gõ tay lại trong trang", () => {
  const schema = read("src", "lib", "schema.mjs");
  for (const truong of ["'@type': 'Restaurant'", "openingHoursSpecification", "hasMenu", "acceptsReservations", "priceRange", "PostalAddress", "image:"]) {
    assert.ok(schema.includes(truong), "schema thiếu " + truong);
  }
  // Sao đánh giá tự khai trên web của chính quán: Google không nhận, số lại nhanh cũ
  assert.doesNotMatch(schema, /aggregateRating\s*:/);
  for (const trang of ["index.astro", "lien-he.astro"]) {
    const html = read("src", "pages", trang);
    assert.match(html, /nhaHangLd\(Astro\.site\)/, trang + " chưa khai nhà hàng");
    assert.doesNotMatch(html, /"streetAddress"/, trang + " còn gõ tay địa chỉ trong JSON-LD");
  }
  const consts = read("src", "consts.ts");
  assert.match(consts, /duong: 'Số 3, ngõ 58 Vũ Trọng Phụng'/);
  assert.match(consts, /mo: '09:00', dong: '14:00'/);
  assert.match(consts, /mo: '16:30', dong: '22:00'/);
});

test("giờ ở dữ liệu có cấu trúc khớp giờ hiện dòng 'Đang mở cửa'", () => {
  // site.js tính trạng thái mở cửa bằng phút trong ngày; hai nơi lệch nhau là Google
  // và trang web nói hai giờ khác nhau.
  const js = read("public", "assets", "js", "site.js");
  assert.match(js, /\[9 \* 60, 14 \* 60\], \[16 \* 60 \+ 30, 22 \* 60\]/);
});

test("tiêu đề trang chủ có tên quán, món và khu vực", () => {
  const m = read("src", "consts.ts").match(/SITE_TITLE = '([^']+)'/);
  assert.ok(m, "thiếu SITE_TITLE");
  for (const tu of ["Cuốn Sinh", "cuốn", "lẩu", "Thanh Xuân", "Hà Nội"]) assert.ok(m[1].includes(tu), "tiêu đề thiếu: " + tu);
  assert.ok(m[1].length <= 60, "tiêu đề dài quá 60 ký tự, Google sẽ cắt");
});

test("khung chung có canonical, thẻ chia sẻ và đường dẫn phân cấp", () => {
  const base = read("src", "layouts", "Base.astro");
  assert.match(base, /<link rel="canonical" href=\{canonical\} \/>/);
  assert.match(base, /max-image-preview:large/);
  assert.match(base, /name="twitter:card" content="summary_large_image"/);
  assert.match(base, /duongDanLd\(Astro\.site/);
  // Trang lỗi không được lên Google
  assert.match(read("src", "pages", "404.astro"), /<Base [^>]*noindex/);
});

test("mô tả từng trang đủ ngắn để Google không cắt giữa chừng", () => {
  const dir = path.join(ROOT, "src", "pages");
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".astro"))) {
    const m = fs.readFileSync(path.join(dir, f), "utf8").match(/description="([^"]+)"/);
    if (m) assert.ok(m[1].length <= 165, f + ": mô tả dài " + m[1].length + " ký tự");
  }
});

test("trang Liên hệ có địa chỉ, giờ, bản đồ và nằm ở chân trang", () => {
  const html = read("src", "pages", "lien-he.astro");
  assert.match(html, /<h1>Liên hệ và chỉ đường tới Cuốn Sinh<\/h1>/);
  assert.match(html, /DIA_CHI_DAY_DU/);
  assert.match(html, /CA_MO_CUA\.map/);
  assert.match(html, /<iframe[\s\S]*?title=[\s\S]*?loading="lazy"/, "bản đồ phải có tên và tải lười");
  assert.match(read("src", "components", "Footer.astro"), /href="\/lien-he\/"/);
});

// Chủ quán gửi mã đo 18/11/2026. Thẻ Google Analytics nằm ở khung chung nên mọi trang
// đều được đếm; form đặt bàn gửi xong thì báo một sự kiện để đếm lượt đặt bàn.
test("mọi trang gắn Google Analytics và đếm lượt đặt bàn", () => {
  assert.match(read("src", "consts.ts"), /export const GA_ID = 'G-10WBWYDWB8';/);
  const base = read("src", "layouts", "Base.astro");
  assert.match(base, /googletagmanager\.com\/gtag\/js\?id=\$\{GA_ID\}/);
  assert.match(base, /<script is:inline async src=\{gaSrc\}>/);
  assert.match(base, /gtag\('config', GA_ID\)/);
  const js = read("public", "assets", "js", "site.js");
  assert.match(js, /gtag\("event", "dat_ban_thanh_cong"/);
  // Không gửi tên hay số điện thoại của khách sang Google
  const m = js.match(/gtag\("event", "dat_ban_thanh_cong",[^)]*\)/);
  assert.ok(m && !/ten|sdt|dien_thoai|phone/i.test(m[0].replace("dat_ban_thanh_cong", "")), "sự kiện không được kèm thông tin cá nhân");
  assert.match(read("src", "pages", "chinh-sach-bao-mat.astro"), /Google Analytics/);
});
