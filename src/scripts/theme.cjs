/*
 * Giao diện sáng/tối của cuonsinh.com.
 *
 * Luật:
 *  - Mặc định theo GIỜ ĐỊA PHƯƠNG của người truy cập (múi giờ trên máy họ):
 *    06:00-17:59 là giao diện sáng, còn lại là giao diện tối.
 *  - Người dùng bấm nút thì lựa chọn đó thắng, nhưng chỉ tới mốc đổi giờ kế tiếp
 *    (06:00 hoặc 18:00). Qua mốc đó trang quay lại chạy tự động.
 *  - Thêm ?theme=light hoặc ?theme=dark vào địa chỉ để xem thử, không lưu lại.
 *
 * File này nạp đồng bộ trong <head> để đặt giao diện trước khi trang vẽ ra,
 * tránh nháy màu. Phần logic thuần được xuất cho Node để chạy test.
 */
(function (root) {
  "use strict";

  var DAY_START = 6; // 06:00 bắt đầu giao diện sáng
  var DAY_END = 18; // 18:00 bắt đầu giao diện tối
  var KEY = "cs-theme";
  var COLORS = { light: "#fbf8f1", dark: "#10150f" };

  function isTheme(v) {
    return v === "light" || v === "dark";
  }

  /** Giao diện tự động theo giờ địa phương của `date`. */
  function autoTheme(date) {
    var h = date.getHours();
    return h >= DAY_START && h < DAY_END ? "light" : "dark";
  }

  /** Thời điểm kế tiếp giao diện tự động đổi (06:00 hoặc 18:00 giờ địa phương). */
  function nextSwitch(date) {
    var n = new Date(date.getTime());
    var h = date.getHours();
    if (h < DAY_START) {
      n.setHours(DAY_START, 0, 0, 0);
    } else if (h < DAY_END) {
      n.setHours(DAY_END, 0, 0, 0);
    } else {
      n.setDate(n.getDate() + 1);
      n.setHours(DAY_START, 0, 0, 0);
    }
    return n;
  }

  /** Chọn giao diện: lựa chọn tay còn hạn thì dùng, không thì theo giờ. */
  function resolveTheme(date, saved) {
    if (saved && isTheme(saved.theme) && typeof saved.until === "number" && saved.until > date.getTime()) {
      return { theme: saved.theme, manual: true };
    }
    return { theme: autoTheme(date), manual: false };
  }

  /** Bản ghi lưu lại khi người dùng tự chọn giao diện. */
  function manualRecord(theme, date) {
    return { theme: theme, until: nextSwitch(date).getTime() };
  }

  var api = {
    DAY_START: DAY_START,
    DAY_END: DAY_END,
    autoTheme: autoTheme,
    nextSwitch: nextSwitch,
    resolveTheme: resolveTheme,
    manualRecord: manualRecord,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    return;
  }

  // ---- Phần chạy trên trình duyệt ----
  var doc = root.document;
  var el = doc.documentElement;
  var preview = null;

  try {
    var q = new URLSearchParams(root.location.search).get("theme");
    if (isTheme(q)) preview = q;
  } catch (e) {}

  function readSaved() {
    try {
      return JSON.parse(root.localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }

  function writeSaved(rec) {
    try {
      if (rec) root.localStorage.setItem(KEY, JSON.stringify(rec));
      else root.localStorage.removeItem(KEY);
    } catch (e) {}
  }

  function current() {
    if (preview) return { theme: preview, manual: true };
    return resolveTheme(new Date(), readSaved());
  }

  function apply() {
    var r = current();
    el.setAttribute("data-theme", r.theme);
    el.setAttribute("data-theme-mode", r.manual ? "manual" : "auto");
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", COLORS[r.theme]);
    if (!r.manual) writeSaved(null); // lựa chọn tay hết hạn thì dọn đi
    try {
      root.dispatchEvent(new CustomEvent("cs-theme", { detail: r }));
    } catch (e) {}
    return r;
  }

  function toggle() {
    var next = current().theme === "dark" ? "light" : "dark";
    preview = null;
    // Bấm về đúng giao diện tự động thì coi như trả lại chế độ tự động.
    if (next === autoTheme(new Date())) writeSaved(null);
    else writeSaved(manualRecord(next, new Date()));
    return apply();
  }

  el.classList.add("js");
  apply();

  // Trang mở lâu qua mốc 06:00/18:00 thì tự đổi; tab khác đổi thì đổi theo.
  root.setInterval(apply, 60 * 1000);
  root.addEventListener("storage", function (e) {
    if (e.key === KEY) apply();
  });
  doc.addEventListener("visibilitychange", function () {
    if (!doc.hidden) apply();
  });

  api.apply = apply;
  api.toggle = toggle;
  api.current = current;
  root.CSTheme = api;
})(typeof window !== "undefined" ? window : globalThis);
