/* Tương tác trang chủ Cuốn Sinh. Không dùng thư viện ngoài. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const HOTLINE = "0844 566 922";
  // Hai khung nhận khách, tính bằng phút trong ngày (giờ Việt Nam)
  const KHUNG = [[9 * 60, 14 * 60], [16 * 60 + 30, 22 * 60]];
  const hh = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  // Giờ Việt Nam hiện tại, đọc bằng getUTC* (quán ở Hà Nội dù khách đang ở múi giờ nào)
  const vn = () => new Date(Date.now() + 7 * 3600e3);

  /* ---------- Nút đổi giao diện ---------- */
  const nutGD = $("#nut-giao-dien");
  function capNhatNutGD() {
    if (!nutGD || !window.CSTheme) return;
    const r = window.CSTheme.current();
    const toi = r.theme === "dark";
    const nhan = toi ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";
    nutGD.setAttribute("aria-label", nhan);
    nutGD.title = nhan + (r.manual ? "" : " (đang tự đổi theo giờ của bạn)");
  }
  if (nutGD && window.CSTheme) {
    nutGD.addEventListener("click", () => window.CSTheme.toggle());
    window.addEventListener("cs-theme", capNhatNutGD);
    capNhatNutGD();
  }

  /* ---------- Thanh đầu trang: viền khi cuộn, menu điện thoại ---------- */
  const top = $(".top");
  const nav = $("#menu-chinh");
  const nutMenu = $(".menu-btn");
  const khiCuon = () => top.classList.toggle("is-stuck", window.scrollY > 8);
  window.addEventListener("scroll", khiCuon, { passive: true });
  khiCuon();

  function datMenu(mo) {
    nav.classList.toggle("is-open", mo);
    nutMenu.setAttribute("aria-expanded", String(mo));
    nutMenu.setAttribute("aria-label", mo ? "Đóng menu" : "Mở menu");
  }
  nutMenu.addEventListener("click", () => datMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) datMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { datMenu(false); nutMenu.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !e.target.closest(".top")) datMenu(false);
  });

  /* ---------- Trạng thái đang nhận khách ---------- */
  const tt = $("#trang-thai-mo");
  function capNhatTrangThai() {
    if (!tt) return;
    const v = vn();
    const phut = v.getUTCHours() * 60 + v.getUTCMinutes();
    const dangMo = KHUNG.find(([a, b]) => phut >= a && phut < b);
    let chu;
    if (dangMo) {
      chu = `Đang trong giờ nhận khách, tới ${hh(dangMo[1])}`;
    } else {
      const sau = KHUNG.find(([a]) => a > phut);
      chu = sau ? `Ngoài giờ nhận khách, mở lại lúc ${hh(sau[0])}` : `Ngoài giờ nhận khách, mở lại ${hh(KHUNG[0][0])} sáng mai`;
    }
    tt.classList.toggle("is-open", Boolean(dangMo));
    $(".open__txt", tt).textContent = chu;
    tt.hidden = false;
  }
  capNhatTrangThai();
  setInterval(capNhatTrangThai, 60 * 1000);

  /* ---------- Lọc món, lọc combo ---------- */
  function boLoc(nutSel, mucSel, khop) {
    const nut = $$(nutSel);
    const muc = $$(mucSel);
    function chon(n) {
      nut.forEach((b) => {
        const on = b === n;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      muc.forEach((m) => {
        const hien = khop(m, n);
        m.hidden = !hien;
        m.classList.remove("is-in");
        if (hien) { void m.offsetWidth; m.classList.add("is-in"); }
      });
    }
    nut.forEach((b) => b.addEventListener("click", () => chon(b)));
    const dau = nut.find((b) => b.classList.contains("is-on")) || nut[0];
    if (dau) chon(dau);
  }
  boLoc(".tab", ".dish", (m, n) => (n.dataset.cat === "hot" ? m.hasAttribute("data-hot") : m.dataset.cat === n.dataset.cat));
  boLoc(".people__btn", ".combo", (m, n) => m.dataset.people === n.dataset.people);

  // Giá chia đầu người, làm tròn nghìn, tính từ giá đang in trên thẻ combo
  $$(".combo").forEach((c) => {
    const gia = parseInt($(".combo__price", c).textContent.replace(/\D/g, ""), 10);
    const nguoi = parseInt(c.dataset.people, 10);
    if (!gia || !nguoi) return;
    const moi = Math.round(gia / nguoi / 1000) * 1000;
    const p = document.createElement("p");
    p.className = "combo__per";
    p.textContent = `Khoảng ${moi.toLocaleString("vi-VN")}đ mỗi người`;
    $(".combo__price", c).after(p);
  });

  /* ---------- Hiện dần khi cuộn tới ---------- */
  const an = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-seen"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    an.forEach((x) => io.observe(x));
  } else {
    an.forEach((x) => x.classList.add("is-seen"));
  }

  // Tô mục menu ứng với khối đang xem
  const lienKet = $$('.nav a[href^="#"]:not(.nav__cta)');
  const khoi = lienKet.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && khoi.length) {
    const io2 = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        lienKet.forEach((a) => a.classList.toggle("is-here", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    khoi.forEach((k) => io2.observe(k));
  }

  /* ---------- Form đặt bàn (cùng API /api/dat-ban với trang /dat-ban/) ---------- */
  const form = $("#form-dat-ban");
  if (!form) return;
  const kq = $("#ket-qua");
  const oNgay = form.elements.ngay;
  const oGio = form.elements.gio;
  const oNguoi = form.elements.so_nguoi;
  const nutGui = $('button[type="submit"]', form);

  const homNay = vn().toISOString().slice(0, 10);
  oNgay.min = homNay;
  oNgay.max = new Date(vn().getTime() + 60 * 864e5).toISOString().slice(0, 10);
  oNgay.value = homNay;

  const MOC = [];
  for (const [a, b] of KHUNG) for (let t = a; t <= b; t += 15) MOC.push(t);

  function napGio() {
    const cu = oGio.value;
    let tu = 0;
    if (oNgay.value === homNay) {
      const v = vn();
      tu = v.getUTCHours() * 60 + v.getUTCMinutes() + 60; // đặt trước ít nhất 60 phút
    }
    oGio.innerHTML = "";
    const con = MOC.filter((t) => t >= tu).map(hh);
    if (!con.length) {
      oGio.add(new Option("Hôm nay đã hết giờ nhận, chọn ngày khác", ""));
      return;
    }
    con.forEach((g) => oGio.add(new Option(g, g)));
    if (con.includes(cu)) oGio.value = cu;
    else if (con.includes("18:30")) oGio.value = "18:30";
  }
  oNgay.addEventListener("change", napGio);
  // Mặc định hôm nay; nếu hôm nay đã hết giờ nhận thì nhảy sang ngày mai
  function ngayMacDinh() {
    oNgay.value = homNay;
    napGio();
    if (!oGio.value) {
      oNgay.value = new Date(vn().getTime() + 864e5).toISOString().slice(0, 10);
      napGio();
    }
  }
  ngayMacDinh();

  // Nút cộng trừ số người
  const kep = (n) => Math.min(60, Math.max(1, n || 1));
  $$(".stepper__btn", form).forEach((b) => b.addEventListener("click", () => {
    oNguoi.value = kep(parseInt(oNguoi.value, 10) + parseInt(b.dataset.step, 10));
  }));
  oNguoi.addEventListener("change", () => { oNguoi.value = kep(parseInt(oNguoi.value, 10)); });

  // Bấm "Đặt bàn với combo này": điền sẵn số người và ghi chú
  $$("[data-ghi-chu]").forEach((a) => a.addEventListener("click", () => {
    oNguoi.value = kep(parseInt(a.dataset.soNguoi, 10));
    const gc = form.elements.ghi_chu;
    if (!gc.value.includes(a.dataset.ghiChu)) gc.value = (gc.value ? gc.value.trim() + ". " : "") + "Gọi " + a.dataset.ghiChu;
  }));

  function bao(loai, chu) {
    kq.className = "form__msg" + (loai ? " is-" + loai : "");
    kq.textContent = chu;
  }

  function kiemTra(d) {
    const sai = [];
    if (!d.ho_ten.trim()) sai.push(["ho_ten", "Anh chị cho quán xin họ tên."]);
    const so = d.sdt.replace(/[\s.\-()]/g, "").replace(/^\+84/, "0");
    if (!/^0\d{9}$/.test(so)) sai.push(["sdt", "Số điện thoại cần đủ 10 số, bắt đầu bằng 0."]);
    if (!d.ngay) sai.push(["ngay", "Vui lòng chọn ngày đến."]);
    if (!d.gio) sai.push(["gio", "Vui lòng chọn giờ đến."]);
    const n = parseInt(d.so_nguoi, 10);
    if (!(n >= 1 && n <= 60)) sai.push(["so_nguoi", `Đặt bàn trực tuyến nhận 1 đến 60 người. Đoàn đông hơn xin gọi ${HOTLINE}.`]);
    return sai;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    bao("", "");
    $$(".is-bad", form).forEach((x) => { x.classList.remove("is-bad"); x.removeAttribute("aria-invalid"); });
    const d = Object.fromEntries(new FormData(form));
    const sai = kiemTra(d);
    if (sai.length) {
      sai.forEach(([ten]) => { form.elements[ten].classList.add("is-bad"); form.elements[ten].setAttribute("aria-invalid", "true"); });
      bao("err", sai[0][1]);
      form.elements[sai[0][0]].focus();
      return;
    }
    nutGui.disabled = true;
    nutGui.textContent = "Đang gửi...";
    try {
      const r = await fetch("/api/dat-ban", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(d),
      });
      const j = await r.json();
      if (j.ok) {
        form.reset();
        ngayMacDinh();
        bao("ok", `Cuốn Sinh đã nhận yêu cầu đặt bàn${j.ma_don ? " (mã " + j.ma_don + ")" : ""}. Nhân viên sẽ gọi lại xác nhận bàn cho anh chị sớm nhất.`);
      } else {
        bao("err", j.thong_bao || "Chưa gửi được, vui lòng thử lại.");
      }
    } catch {
      bao("err", `Chưa gửi được yêu cầu. Anh chị gọi ${HOTLINE} để giữ bàn nhé.`);
    } finally {
      nutGui.disabled = false;
      nutGui.textContent = "Gửi đặt bàn";
    }
  });
})();
