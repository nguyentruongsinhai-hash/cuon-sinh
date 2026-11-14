"use strict";

// API /api/dat-ban: nhận form đặt bàn, ghi một dòng vào Google Sheets (sổ lưu
// thông tin khách) và soạn sẵn tin cho nhóm Zalo BÁO ĐẶT BÀN.
// Test không gọi mạng: fetch và đồng hồ được truyền vào.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { generateKeyPairSync } = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const nap = () => import("../src/lib/dat-ban.mjs");

// 10:00 ngày 13/11/2026 giờ Việt Nam
const BAY_GIO = new Date("2026-11-13T03:00:00Z");
const DON = { ho_ten: "  Nguyễn  Văn A ", sdt: "+84 912 345 678", ngay: "2026-11-14", gio: "18:30", so_nguoi: "4", ghi_chu: "Sinh nhật" };

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const ENV = {
  SHEET_ID: "sheet-gia",
  GOOGLE_SA_EMAIL: "web@du-an-gia.iam.gserviceaccount.com",
  GOOGLE_SA_KEY: privateKey.export({ type: "pkcs8", format: "pem" }),
};

function fetchGia({ sheetsOk = true, hook = 202 } = {}) {
  const goi = [];
  const fn = async (url, init = {}) => {
    goi.push({ url: String(url), init });
    if (String(url).startsWith("https://oauth2.googleapis.com/token")) {
      return new Response(JSON.stringify({ access_token: "token-gia" }), { status: 200 });
    }
    if (String(url).startsWith("https://sheets.googleapis.com/")) {
      return sheetsOk ? new Response("{}", { status: 200 }) : new Response("quota", { status: 429 });
    }
    if (String(url).startsWith("https://javis.vi-du/")) {
      if (hook === "nem") throw new Error("mất mạng");
      return new Response("{}", { status: hook });
    }
    throw new Error("gọi mạng ngoài dự kiến: " + url);
  };
  fn.goi = goi;
  return fn;
}

test("kiểm tra dữ liệu: nhận đơn hợp lệ, chặn đơn sai", async () => {
  const { kiemTra } = await nap();
  assert.equal(kiemTra(DON, BAY_GIO), "");
  assert.match(kiemTra({ ...DON, ho_ten: " " }, BAY_GIO), /họ tên/);
  assert.match(kiemTra({ ...DON, sdt: "12345" }, BAY_GIO), /Số điện thoại/);
  assert.match(kiemTra({ ...DON, so_nguoi: "61" }, BAY_GIO), /1 đến 60/);
  assert.match(kiemTra({ ...DON, gio: "15:00" }, BAY_GIO), /9:00-14:00/);
  assert.match(kiemTra({ ...DON, ngay: "2026-11-12" }, BAY_GIO), /đã qua/);
  assert.match(kiemTra({ ...DON, ngay: "2027-03-01" }, BAY_GIO), /60 ngày/);
  // Đặt trong ngày phải trước ít nhất 60 phút: 10:00 đặt 10:30 là quá sát
  assert.match(kiemTra({ ...DON, ngay: "2026-11-13", gio: "10:30" }, BAY_GIO), /60 phút/);
  assert.equal(kiemTra({ ...DON, ngay: "2026-11-13", gio: "11:00" }, BAY_GIO), "");
});

test("đơn hợp lệ được ghi một dòng vào Sheets, kèm tin soạn sẵn cho nhóm Zalo", async () => {
  const { xuLyDatBan } = await nap();
  const fetchFn = fetchGia();
  const kq = await xuLyDatBan(DON, ENV, { fetch: fetchFn, now: BAY_GIO });

  assert.equal(kq.status, 200);
  assert.equal(kq.body.ok, true);
  assert.match(kq.body.ma_don, /^WEB261113-[0-9A-F]{4}$/);

  const ghi = fetchFn.goi.find((g) => g.url.startsWith("https://sheets.googleapis.com/"));
  assert.ok(ghi, "chưa gọi Sheets");
  assert.match(ghi.url, /spreadsheets\/sheet-gia\/values\/.*:append\?valueInputOption=RAW/);
  assert.equal(ghi.init.headers.authorization, "Bearer token-gia");
  const [hang] = JSON.parse(ghi.init.body).values;
  assert.equal(hang.length, 12);
  assert.deepEqual(hang.slice(1, 11), ["10:00 13/11/2026", "2026-11-14", "18:30", "Nguyễn Văn A", "0912345678", 4, "Sinh nhật", "website", "mới", ""]);
  // Cột cuối là tin đúng mẫu nhóm BÁO ĐẶT BÀN, để bộ chuyển tin gửi nguyên văn
  assert.equal(
    hang[11],
    [
      "14/11 - đặt bàn tại quán",
      "Họ tên: Nguyễn Văn A",
      "Số điện thoại: 0912345678",
      "Số người đi kèm: 4",
      "Thời gian đặt bàn: 18:30 14/11/2026",
      "Ghi chú: Sinh nhật",
      `Nguồn: website, mã ${kq.body.ma_don}, nhận 10:00 13/11/2026. Nhân viên gọi xác nhận lại với khách.`,
    ].join("\n"),
  );
});

test("dữ liệu sai trả 400 và không ghi gì", async () => {
  const { xuLyDatBan } = await nap();
  const fetchFn = fetchGia();
  const kq = await xuLyDatBan({ ...DON, sdt: "abc" }, ENV, { fetch: fetchFn, now: BAY_GIO });
  assert.equal(kq.status, 400);
  assert.equal(kq.body.ok, false);
  assert.equal(fetchFn.goi.length, 0);
});

test("bẫy bot: ô ẩn có chữ thì trả ok giả và không ghi gì", async () => {
  const { xuLyDatBan } = await nap();
  const fetchFn = fetchGia();
  const kq = await xuLyDatBan({ ...DON, website: "http://spam" }, ENV, { fetch: fetchFn, now: BAY_GIO });
  assert.equal(kq.status, 200);
  assert.equal(fetchFn.goi.length, 0);
});

test("không lưu được đơn thì KHÔNG báo thành công, mời khách gọi hotline", async () => {
  const { xuLyDatBan } = await nap();
  // Thiếu cấu hình Sheets
  const thieu = await xuLyDatBan(DON, {}, { fetch: fetchGia(), now: BAY_GIO });
  assert.equal(thieu.status, 502);
  assert.equal(thieu.body.ok, false);
  assert.match(thieu.body.thong_bao, /0844 566 922/);
  // Sheets từ chối
  const loi = await xuLyDatBan(DON, ENV, { fetch: fetchGia({ sheetsOk: false }), now: BAY_GIO });
  assert.equal(loi.status, 502);
  assert.equal(loi.body.ok, false);
});

const ENV_HOOK = {
  ...ENV,
  JAVIS_HOOK_URL: "https://javis.vi-du/hooks/wh_gia",
  JAVIS_HOOK_TOKEN: "token-hook-gia",
  JAVIS_ACCESS_CLIENT_ID: "id-gia.access",
  JAVIS_ACCESS_CLIENT_SECRET: "khoa-gia",
};

test("ghi sổ xong thì gọi hook Javis đúng một lần, chỉ gửi mã đơn", async () => {
  const { xuLyDatBan } = await nap();
  const f = fetchGia();
  const kq = await xuLyDatBan(DON, ENV_HOOK, { fetch: f, now: BAY_GIO });
  assert.equal(kq.status, 200);
  const goi = f.goi.filter((g) => g.url.startsWith("https://javis.vi-du/"));
  assert.equal(goi.length, 1);
  const sheets = f.goi.findIndex((g) => g.url.startsWith("https://sheets.googleapis.com/"));
  assert.ok(sheets >= 0 && sheets < f.goi.indexOf(goi[0]), "phải ghi sổ trước rồi mới gọi hook");
  const { init } = goi[0];
  assert.equal(init.method, "POST");
  assert.equal(init.headers.authorization, "Bearer token-hook-gia");
  assert.equal(init.headers["idempotency-key"], kq.body.ma_don);
  assert.equal(init.headers["cf-access-client-id"], "id-gia.access");
  assert.equal(init.headers["cf-access-client-secret"], "khoa-gia");
  assert.ok(init.headers["user-agent"]);
  assert.deepEqual(JSON.parse(init.body), { event: "dat_ban_web", ma_don: kq.body.ma_don });
  assert.doesNotMatch(init.body, /912345678|Nguyễn/, "không gửi thông tin khách qua hook");
});

test("hook lỗi hoặc mất mạng thì đơn vẫn thành công vì dòng đã vào sổ", async () => {
  const { xuLyDatBan } = await nap();
  for (const hook of [500, 302, 403, "nem"]) {
    const nhat = [];
    const kq = await xuLyDatBan(DON, ENV_HOOK, { fetch: fetchGia({ hook }), now: BAY_GIO, log: (...a) => nhat.push(a.join(" ")) });
    assert.equal(kq.status, 200, "hook " + hook);
    assert.equal(nhat.length, 1, "phải ghi nhật ký lỗi hook " + hook);
    assert.doesNotMatch(nhat[0], /token-hook-gia|khoa-gia/, "nhật ký không được chứa bí mật");
  }
});

test("chưa đặt địa chỉ hook thì bỏ qua, và không ghi được sổ thì không gọi hook", async () => {
  const { xuLyDatBan } = await nap();
  const f1 = fetchGia();
  assert.equal((await xuLyDatBan(DON, ENV, { fetch: f1, now: BAY_GIO })).status, 200);
  assert.equal(f1.goi.filter((g) => g.url.startsWith("https://javis.vi-du/")).length, 0);
  const f2 = fetchGia({ sheetsOk: false });
  assert.equal((await xuLyDatBan(DON, ENV_HOOK, { fetch: f2, now: BAY_GIO })).status, 502);
  assert.equal(f2.goi.filter((g) => g.url.startsWith("https://javis.vi-du/")).length, 0);
});

test("trang API chạy trên Worker (không dựng tĩnh) và form gọi đúng địa chỉ", () => {
  const api = fs.readFileSync(path.join(ROOT, "src", "pages", "api", "dat-ban.js"), "utf8");
  assert.match(api, /export const prerender = false/);
  assert.match(api, /export async function POST/);
  assert.match(fs.readFileSync(path.join(ROOT, "public", "assets", "js", "site.js"), "utf8"), /fetch\("\/api\/dat-ban"/);
});

test("điện thoại: ô Giờ đến nằm dưới ô Ngày đến, không chồng lên nhau", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "public", "assets", "css", "site.css"), "utf8");
  // iPhone vẽ ô ngày rộng hơn nửa hàng nên hai ô đè nhau: màn hẹp phải xếp một cột.
  assert.match(
    css,
    /@media \(max-width: 560px\) \{\s*\.field-row \{ grid-template-columns: 1fr;/,
    "màn hẹp phải xếp Ngày đến và Giờ đến thành một cột",
  );
  assert.match(css, /\.field input, \.field select, \.field textarea \{\s*width: 100%; min-width: 0;/, "ô nhập không được rộng hơn cột chứa nó");
});

test("iPhone: ô Ngày đến không tràn ra ngoài khung form", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "public", "assets", "css", "site.css"), "utf8");
  // Safari iOS vẽ ô ngày theo bề rộng riêng của nó, bỏ qua width: 100%. Phải tắt kiểu vẽ mặc định.
  const ngay = css.match(/\.field input\[type="date"\] \{([^}]*)\}/);
  assert.ok(ngay, "thiếu luật riêng cho ô ngày");
  assert.match(ngay[1], /-webkit-appearance: none/, "phải tắt kiểu vẽ mặc định của Safari cho ô ngày");
  assert.match(ngay[1], /max-width: 100%/, "ô ngày không được rộng hơn khung");
  assert.match(css, /\.field \{[^}]*grid-template-columns: minmax\(0, 1fr\)/, "cột của ô nhập phải co được theo khung");
});
