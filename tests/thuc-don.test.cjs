"use strict";

// Thực đơn: một nguồn dữ liệu (src/data/thuc-don.mjs) nuôi ba chỗ:
// menu sổ xuống ở đầu trang, trang /thuc-don/ và mục thực đơn ở trang chủ.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");
const nap = () => import("../src/data/thuc-don.mjs");

test("dữ liệu thực đơn: nhóm không trùng, món nào cũng có tên và giá", async () => {
  const { NHOM_MON } = await nap();
  assert.ok(NHOM_MON.length >= 9, "thiếu nhóm món");
  const slugs = NHOM_MON.map((n) => n.slug);
  assert.equal(new Set(slugs).size, slugs.length, "trùng slug nhóm");
  for (const n of NHOM_MON) {
    assert.match(n.slug, /^[a-z0-9-]+$/, "slug nhóm phải là chữ thường không dấu: " + n.slug);
    assert.ok(n.ten && n.mon.length > 0, "nhóm rỗng: " + n.slug);
    const ten = n.mon.map((m) => m.ten);
    assert.equal(new Set(ten).size, ten.length, "trùng tên món trong nhóm " + n.slug);
    for (const m of n.mon) {
      assert.ok(m.ten.trim(), "món thiếu tên trong nhóm " + n.slug);
      assert.ok(Number.isInteger(m.gia) && m.gia >= 1000 && m.gia % 1000 === 0, "giá sai: " + m.ten);
    }
  }
  const tong = NHOM_MON.reduce((s, n) => s + n.mon.length, 0);
  assert.ok(tong >= 60, "thực đơn đầy đủ phải có từ 60 món, đang có " + tong);
});

// Chủ quán chốt 13/11/2026: đồ nhúng lẩu, phần gọi thêm và nhóm "Khác"
// (đậu phộng, hạt mix, khăn ướt) không đưa lên web.
test("không đưa nhóm Gọi thêm và nhóm Khác lên web", async () => {
  const { NHOM_MON } = await nap();
  const slugs = NHOM_MON.map((n) => n.slug);
  assert.deepEqual(slugs, ["cuon", "lau", "mon-chinh", "goi-nom", "khai-vi", "rau", "com-xoi", "combo", "do-uong"]);
  const ten = NHOM_MON.map((n) => n.ten);
  assert.ok(!ten.includes("Gọi thêm") && !ten.includes("Khác"), "còn nhóm đã bỏ: " + ten.join(", "));
  const tatCaMon = NHOM_MON.flatMap((n) => n.mon.map((m) => m.ten));
  for (const boDi of ["Thịt bò nhúng lẩu", "Nước lẩu tôm", "Thịt quay gọi thêm", "Khăn ướt", "Gói hạt mix"]) {
    assert.ok(!tatCaMon.includes(boDi), "món của nhóm đã bỏ vẫn còn trên web: " + boDi);
  }
  // Không còn chỗ nào trỏ khách tới nhóm đã bỏ
  for (const n of NHOM_MON) assert.doesNotMatch(n.moTa, /nhóm Gọi thêm/i, "mô tả nhóm " + n.ten + " còn nhắc nhóm Gọi thêm");
});

// Chủ quán chốt 13/11/2026: hai món gỏi chưa có ảnh thì không đưa lên web.
test("nhóm Gỏi, nộm không còn hai món chưa có ảnh", async () => {
  const { NHOM_MON } = await nap();
  const goi = NHOM_MON.find((n) => n.slug === "goi-nom");
  assert.deepEqual(
    goi.mon.map((m) => m.ten),
    ["Gỏi bò kéo pháo", "Nộm rau càng cua bắp bò", "Gỏi bưởi tôm thịt"],
  );
  for (const m of goi.mon) assert.ok(m.anh, "món gỏi thiếu ảnh: " + m.ten);
});

test("giá in ra đúng kiểu Việt Nam", async () => {
  const { giaVN } = await nap();
  assert.equal(giaVN(98000), "98.000đ");
  assert.equal(giaVN(1268000), "1.268.000đ");
});

test("ảnh món nào khai trong dữ liệu cũng có file thật kèm kích thước", async () => {
  const { NHOM_MON } = await nap();
  let coAnh = 0;
  for (const m of NHOM_MON.flatMap((n) => n.mon)) {
    if (!m.anh) continue;
    coAnh += 1;
    assert.ok(fs.existsSync(path.join(ROOT, "public", "assets", "img", m.anh.file)), "thiếu ảnh " + m.anh.file);
    assert.ok(m.anh.w > 0 && m.anh.h > 0, "ảnh thiếu kích thước: " + m.anh.file);
  }
  assert.ok(coAnh >= 30, "quá ít món có ảnh: " + coAnh);
});

test("trang chủ: mỗi nhóm tối đa 4 món nổi bật, món của tab Nổi bật giữ nguyên", async () => {
  const { NHOM_MON, nhomTrangChu, monTrangChu } = await nap();
  const nhom = nhomTrangChu();
  assert.ok(nhom.length >= 4, "trang chủ phải có ít nhất 4 nhóm món");
  for (const n of nhom) {
    const ds = monTrangChu(n);
    assert.ok(ds.length >= 1 && ds.length <= 4, n.ten + " phải hiện 1 đến 4 món, đang " + ds.length);
    // Món đã lên tab Nổi bật thì cũng phải nằm trong 4 món của nhóm nó
    for (const m of n.mon.filter((x) => x.hot)) assert.ok(ds.includes(m), m.ten + " là món nổi bật nhưng không hiện ở nhóm");
  }
  const hot = NHOM_MON.flatMap((n) => n.mon.filter((m) => m.hot).map((m) => m.ten));
  assert.deepEqual(hot, [
    "Set cuốn tổng hợp",
    "Cuốn heo quay - nhỏ",
    "Lẩu cua sông siêu gạch",
    "Lẩu tôm bầu A Sinh",
    "Gà ta chiên mắm Sài Gòn",
    "Bò sốt tiêu xanh bản gang",
    "Gỏi bò kéo pháo",
    "Nộm rau càng cua bắp bò",
  ]);
});

test("trang chủ lấy món từ dữ liệu chung và có nút xem thêm dẫn sang /thuc-don/", () => {
  const home = read("src", "pages", "index.astro");
  assert.match(home, /from '\.\.\/data\/thuc-don\.mjs'/, "trang chủ chưa dùng dữ liệu thực đơn chung");
  assert.match(home, /monTrangChu\(/, "trang chủ phải giới hạn món theo nhóm");
  assert.match(home, /id="xem-them-mon"/, "thiếu nút xem thêm");
  assert.match(home, /\/thuc-don\/#/, "nút xem thêm phải dẫn tới đúng nhóm ở trang thực đơn");
  const js = read("public", "assets", "js", "site.js");
  assert.match(js, /xem-them-mon/, "site.js chưa đổi nút xem thêm theo nhóm đang chọn");
});

test("trang chủ: dòng ghi chú dưới món mời nhắn fanpage để được tư vấn, không còn nói chỉ hiện vài món", () => {
  const home = read("src", "pages", "index.astro");
  const ghiChu = home.match(/<div class="more reveal">[\s\S]*?<p class="note">([\s\S]*?)<\/p>/);
  assert.ok(ghiChu, "thiếu dòng ghi chú dưới nút xem thực đơn");
  assert.match(ghiChu[1], /tư vấn/, "dòng ghi chú phải mời khách hỏi tư vấn món");
  assert.match(ghiChu[1], /href=\{MESSENGER_URL\}/, "dòng ghi chú phải dẫn sang Messenger của fanpage");
  assert.doesNotMatch(ghiChu[1], /tiêu biểu/, "web đã đủ món, bỏ câu chỉ hiện vài món tiêu biểu");
});

test("đầu trang: bấm Thực đơn sang trang /thuc-don/, rê chuột sổ ra các nhóm món", () => {
  const header = read("src", "components", "Header.astro");
  assert.match(header, /href="\/thuc-don\/"[^>]*>\s*Thực đơn/, "mục Thực đơn phải dẫn sang /thuc-don/");
  assert.match(header, /NHOM_MON\.map/, "menu con phải liệt kê nhóm món từ dữ liệu chung");
  assert.match(header, /'\/thuc-don\/#' \+ n\.slug/, "mỗi nhóm trong menu con dẫn tới đúng nhóm ở trang thực đơn");
  assert.match(header, /aria-controls="menu-thuc-don"/, "điện thoại cần nút mở các nhóm món");
  const css = read("public", "assets", "css", "site.css");
  assert.match(css, /\.nav__item:hover\s+\.sub/, "rê chuột vào Thực đơn phải sổ menu con");
  assert.match(css, /\.nav__item:focus-within\s+\.sub/, "đi bằng bàn phím cũng phải mở được menu con");
  assert.match(css, /\.nav__item\.is-open\s+\.sub/, "trên điện thoại menu con mở bằng nút");
});

test("trang /thuc-don/ có đủ mọi nhóm, mỗi nhóm một mục có id để menu dẫn tới", () => {
  const f = path.join(ROOT, "src", "pages", "thuc-don.astro");
  assert.ok(fs.existsSync(f), "thiếu trang /thuc-don/");
  const trang = fs.readFileSync(f, "utf8");
  assert.match(trang, /layouts\/Base\.astro/);
  assert.match(trang, /NHOM_MON\.map/, "trang thực đơn phải in mọi nhóm từ dữ liệu chung");
  assert.match(trang, /id=\{n\.slug\}/, "mỗi nhóm cần id trùng slug");
  assert.match(trang, /<h1>Thực đơn Cuốn Sinh<\/h1>/);
  assert.match(read("src", "components", "Footer.astro"), /href="\/thuc-don\/"/, "chân trang thiếu link thực đơn");
});

// Kích thước thật của file WebP, đọc thẳng từ phần đầu file (khỏi cần thư viện).
function coWebp(file) {
  const b = fs.readFileSync(file);
  assert.equal(b.toString("ascii", 0, 4) + b.toString("ascii", 8, 12), "RIFFWEBP", "không phải WebP: " + file);
  const kieu = b.toString("ascii", 12, 16);
  if (kieu === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (kieu === "VP8X") return { w: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
  if (kieu === "VP8L") {
    const n = b.readUInt32LE(21);
    return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 };
  }
  throw new Error("WebP lạ: " + kieu);
}

// Chủ quán gửi 6 ảnh combo 1200x800 ngày 13/11/2026: thẻ combo có khung ảnh
// ở cả trang chủ lẫn trang /thuc-don/ (hai trang dùng chung TheCombo.astro).
test("combo nào cũng có ảnh riêng tỷ lệ 3:2, thẻ combo in ảnh đó", async () => {
  const { COMBO } = await nap();
  assert.equal(COMBO.length, 6);
  const files = COMBO.map((c) => c.anh && c.anh.file);
  assert.equal(new Set(files).size, COMBO.length, "combo dùng chung ảnh hoặc thiếu ảnh: " + files.join(", "));
  for (const c of COMBO) {
    assert.match(c.anh.file, /^combo-[a-z0-9-]+\.webp$/, "tên ảnh combo sai kiểu: " + c.anh.file);
    const f = path.join(ROOT, "public", "assets", "img", c.anh.file);
    assert.ok(fs.existsSync(f), "thiếu ảnh " + c.anh.file);
    assert.deepEqual(coWebp(f), { w: c.anh.w, h: c.anh.h }, "kích thước khai sai so với file: " + c.anh.file);
    assert.equal(c.anh.w * 2, c.anh.h * 3, "ảnh combo phải tỷ lệ 3:2: " + c.anh.file);
    assert.ok(fs.statSync(f).size < 300 * 1024, "ảnh combo nặng quá 300KB: " + c.anh.file);
  }

  const the = read("src", "components", "TheCombo.astro");
  assert.match(the, /class="combo__img"/, "thẻ combo chưa có khung ảnh");
  assert.match(the, /src=\{'\/assets\/img\/' \+ c\.anh\.file\}/, "khung ảnh phải lấy file từ dữ liệu combo");
  assert.match(the, /width=\{c\.anh\.w\}/, "ảnh thiếu chiều rộng, trang sẽ giật khi tải");
  assert.match(the, /height=\{c\.anh\.h\}/, "ảnh thiếu chiều cao, trang sẽ giật khi tải");
  assert.match(the, /alt=\{/, "ảnh combo thiếu chữ thay thế");
  assert.match(the, /loading="lazy"/, "ảnh combo nằm dưới màn hình đầu, phải tải lười");

  const css = read("public", "assets", "css", "site.css");
  assert.match(css, /\.combo__img\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/, "khung ảnh combo phải giữ tỷ lệ 3:2");
  assert.match(css, /\.combo__img img\s*\{[^}]*object-fit:\s*cover/, "ảnh phải phủ kín khung");

  for (const trang of ["index.astro", "thuc-don.astro"]) {
    assert.match(read("src", "pages", trang), /<TheCombo combo=\{c\}/, trang + " phải in combo bằng thẻ chung");
  }
});
