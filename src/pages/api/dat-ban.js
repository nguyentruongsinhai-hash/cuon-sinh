// POST /api/dat-ban: nhận form đặt bàn. Chạy trên Worker (không dựng tĩnh).
// Toàn bộ logic nằm ở src/lib/dat-ban.mjs; file này chỉ nối với Cloudflare.
import { env } from "cloudflare:workers";
import { xuLyDatBan } from "../../lib/dat-ban.mjs";

export const prerender = false;

const KICH_THUOC_TOI_DA = 4096; // form thật chỉ vài trăm byte

function tra(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function POST({ request }) {
  let d;
  try {
    const chu = await request.text();
    if (chu.length > KICH_THUOC_TOI_DA) throw new Error("quá dài");
    d = JSON.parse(chu);
  } catch {
    return tra(400, { ok: false, thong_bao: "Dữ liệu gửi lên không hợp lệ." });
  }
  const kq = await xuLyDatBan(d, env, { log: console.error });
  return tra(kq.status, kq.body);
}

export function ALL() {
  return tra(405, { ok: false, thong_bao: "Chỉ nhận POST." });
}
