// Xử lý form đặt bàn của cuonsinh.com.
//
// Đường đi của một đơn:
//   1. Trang web gửi JSON lên /api/dat-ban (src/pages/api/dat-ban.js).
//   2. File này kiểm tra dữ liệu rồi ghi MỘT dòng vào Google Sheets: đó là sổ lưu
//      thông tin khách, nằm trên Drive của quán.
//   3. Cột "Zalo" để trống và cột "Tin Zalo" chứa sẵn tin đúng mẫu nhóm BÁO ĐẶT BÀN.
//      Javis (chạy trên máy của quán, đang cầm tài khoản Zalo hotline) đọc các dòng
//      còn trống cột "Zalo", gửi tin vào nhóm rồi điền giờ gửi vào cột đó.
//      Worker không gửi Zalo trực tiếp được vì Zalo không có API cho nhóm chat.
//
// File viết bằng JS thuần, không phụ thuộc Astro hay Cloudflare, để test chạy
// được bằng `node --test` (fetch và đồng hồ truyền từ ngoài vào).
//
// Biến môi trường của Worker (đặt bằng `wrangler secret put`, KHÔNG ghi vào mã):
//   SHEET_ID         id file Google Sheets sổ đặt bàn
//   SHEET_TAB        tên tab, mặc định "DAT BAN WEB"
//   GOOGLE_SA_EMAIL  email service account được chia sẻ quyền sửa file đó
//   GOOGLE_SA_KEY    private key PEM của service account

export const HOTLINE = "0844 566 922";
export const KHUNG_GIO = [["09:00", "14:00"], ["16:30", "22:00"]];
export const SO_NGAY_TOI_DA = 60;
export const TAB_MAC_DINH = "DAT BAN WEB";
// Thứ tự cột trong sổ. Đổi ở đây thì phải đổi hàng tiêu đề trong file Sheets.
export const COT = [
  "Mã đơn", "Nhận lúc", "Ngày đến", "Giờ đến", "Họ tên", "SĐT",
  "Số người", "Ghi chú", "Nguồn", "Trạng thái", "Zalo", "Tin Zalo",
];

const LOI_HE_THONG = `Hệ thống đặt bàn đang trục trặc. Anh/chị gọi giúp bên em số ${HOTLINE} để giữ bàn nhé.`;
const HAN_GOI_MS = 8000;

/**
 * Xử lý một đơn. Trả { status, body }; không ném lỗi ra ngoài.
 * Chỉ báo thành công khi dòng đã nằm trong Sheets: đơn không lưu được mà báo
 * "đã nhận" thì khách tới quán không có bàn.
 */
export async function xuLyDatBan(d, env = {}, { fetch: fetchFn = globalThis.fetch, now = new Date(), log = () => {} } = {}) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return ketQua(400, "Dữ liệu gửi lên không hợp lệ.");
  if (d.website) return ketQua(200, "ok", { ma_don: "" }); // bẫy bot: ô ẩn người thật không điền

  const loi = kiemTra(d, now);
  if (loi) return ketQua(400, loi);

  const don = {
    ma_don: taoMa(now),
    nhan_luc: dinhDangGio(gioVN(now)),
    ngay: d.ngay,
    gio: d.gio,
    ho_ten: sach(d.ho_ten, 80),
    sdt: chuanSdt(d.sdt),
    so_nguoi: parseInt(d.so_nguoi, 10),
    ghi_chu: sach(d.ghi_chu || "", 500),
  };

  try {
    await ghiSheet(env, don, fetchFn);
  } catch (e) {
    log("dat-ban: khong ghi duoc Sheets", don.ma_don, e && e.message);
    return ketQua(502, LOI_HE_THONG);
  }
  return ketQua(200, "ok", { ma_don: don.ma_don });
}

function ketQua(status, thong_bao, them = {}) {
  return { status, body: { ok: status === 200, thong_bao, ...them } };
}

// ---------- kiểm tra dữ liệu ----------

/** Trả chuỗi rỗng nếu đơn hợp lệ, ngược lại là câu báo lỗi cho khách. */
export function kiemTra(d, now = new Date()) {
  if (!d.ho_ten || sach(d.ho_ten, 80).length < 2) return "Vui lòng nhập họ tên.";
  if (!chuanSdt(d.sdt)) return "Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).";
  const n = parseInt(d.so_nguoi, 10);
  if (!(n >= 1 && n <= 60)) return "Số người từ 1 đến 60. Nhóm đông hơn vui lòng gọi hotline.";
  if (!ngayHopLe(d.ngay)) return "Vui lòng chọn ngày đến.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.gio || "")) return "Vui lòng chọn giờ đến.";
  if (!KHUNG_GIO.some(([a, b]) => d.gio >= a && d.gio <= b)) {
    return "Quán nhận khách 9:00-14:00 và 16:30-22:00. Giờ khác vui lòng gọi hotline.";
  }
  const bayGio = gioVN(now);
  const homNay = bayGio.toISOString().slice(0, 10);
  if (d.ngay < homNay) return "Ngày đến đã qua.";
  const toiDa = new Date(bayGio.getTime() + SO_NGAY_TOI_DA * 864e5).toISOString().slice(0, 10);
  if (d.ngay > toiDa) return `Chỉ nhận đặt trước tối đa ${SO_NGAY_TOI_DA} ngày.`;
  if (d.ngay === homNay) {
    const phut = bayGio.getUTCHours() * 60 + bayGio.getUTCMinutes();
    const [h, m] = d.gio.split(":").map(Number);
    if (h * 60 + m < phut + 60) return `Đặt trong ngày cần trước ít nhất 60 phút. Gấp hơn vui lòng gọi ${HOTLINE}.`;
  }
  return "";
}

function ngayHopLe(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s; // loại 2026-02-31
}

/** Đưa số điện thoại về dạng 10 số bắt đầu bằng 0; sai thì trả chuỗi rỗng. */
export function chuanSdt(s) {
  let x = String(s || "").replace(/[\s.\-()]/g, "");
  if (x.startsWith("+84")) x = "0" + x.slice(3);
  else if (x.startsWith("84") && x.length === 11) x = "0" + x.slice(2);
  return /^0\d{9}$/.test(x) ? x : "";
}

function sach(s, max) {
  return String(s).replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

// ---------- thời gian, mã đơn ----------

function gioVN(d) {
  return new Date(d.getTime() + 7 * 3600e3); // đọc bằng getUTC* để ra giờ Việt Nam
}

const p2 = (n) => String(n).padStart(2, "0");

function dinhDangGio(v) {
  return `${p2(v.getUTCHours())}:${p2(v.getUTCMinutes())} ${p2(v.getUTCDate())}/${p2(v.getUTCMonth() + 1)}/${v.getUTCFullYear()}`;
}

function taoMa(now) {
  const v = gioVN(now);
  const r = crypto.getRandomValues(new Uint8Array(2));
  const duoi = Array.from(r, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `WEB${String(v.getUTCFullYear()).slice(2)}${p2(v.getUTCMonth() + 1)}${p2(v.getUTCDate())}-${duoi}`;
}

// ---------- tin cho nhóm Zalo BÁO ĐẶT BÀN ----------

// Đúng mẫu "đặt bàn tại quán" nhóm đang dùng, thêm dòng nguồn và mã đơn.
// "Số người đi kèm" là TỔNG số người, đã tính cả người đặt.
export function tinDatBan(don) {
  const [y, m, d] = don.ngay.split("-");
  return [
    `${Number(d)}/${Number(m)} - đặt bàn tại quán`,
    `Họ tên: ${don.ho_ten}`,
    `Số điện thoại: ${don.sdt}`,
    `Số người đi kèm: ${don.so_nguoi}`,
    `Thời gian đặt bàn: ${don.gio} ${d}/${m}/${y}`,
    `Ghi chú: ${don.ghi_chu || "không"}`,
    `Nguồn: website, mã ${don.ma_don}, nhận ${don.nhan_luc}. Nhân viên gọi xác nhận lại với khách.`,
  ].join("\n");
}

// ---------- Google Sheets (service account, JWT RS256) ----------

async function ghiSheet(env, don, fetchFn) {
  if (!env.SHEET_ID || !env.GOOGLE_SA_EMAIL || !env.GOOGLE_SA_KEY) throw new Error("thiếu cấu hình Sheets");
  const token = await layTokenGoogle(env.GOOGLE_SA_EMAIL, env.GOOGLE_SA_KEY, fetchFn);
  const vung = encodeURIComponent(`'${env.SHEET_TAB || TAB_MAC_DINH}'!A:L`);
  // RAW: Sheets không tự hiểu lại giá trị, nên số điện thoại giữ số 0 đầu và
  // ghi chú bắt đầu bằng "=" không biến thành công thức.
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}/values/${vung}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const hang = [
    don.ma_don, don.nhan_luc, don.ngay, don.gio, don.ho_ten, don.sdt, don.so_nguoi,
    don.ghi_chu, "website", "mới", "", tinDatBan(don),
  ];
  const r = await fetchFn(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ values: [hang] }),
    signal: AbortSignal.timeout(HAN_GOI_MS),
  });
  if (!r.ok) throw new Error(`sheets ${r.status} ${(await r.text()).slice(0, 200)}`);
}

const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
const b64urlJson = (obj) => b64url(new TextEncoder().encode(JSON.stringify(obj)));

async function layTokenGoogle(email, pem, fetchFn) {
  const now = Math.floor(Date.now() / 1000);
  const dau = b64urlJson({ alg: "RS256", typ: "JWT" });
  const than = b64urlJson({
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 600,
  });
  const khoa = await crypto.subtle.importKey(
    "pkcs8", pemSangDer(pem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"],
  );
  const ky = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", khoa, new TextEncoder().encode(`${dau}.${than}`)));
  const r = await fetchFn("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${dau}.${than}.${b64url(ky)}`,
    signal: AbortSignal.timeout(HAN_GOI_MS),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.access_token) throw new Error(`google token ${r.status}`);
  return j.access_token;
}

function pemSangDer(pem) {
  // Khoá dán vào secret thường bị đổi xuống dòng thành chuỗi "\n"
  const b64 = String(pem).replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
