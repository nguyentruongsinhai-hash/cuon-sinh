// Thực đơn Cuốn Sinh: MỘT nguồn dữ liệu cho ba chỗ trên web
//   1. menu sổ xuống ở đầu trang (src/components/Header.astro)
//   2. trang thực đơn đầy đủ /thuc-don/ (src/pages/thuc-don.astro)
//   3. mục "Món nên thử" và combo ở trang chủ (src/pages/index.astro)
// Tên món và giá chép theo bảng giá Sapo của quán (bản 10/11/2026). Đổi giá,
// thêm bớt món thì chỉ sửa ở file này.
//
// Mỗi nhóm: slug (địa chỉ /thuc-don/#slug), ten, goiLa (chữ trên nút "Xem thêm ..."),
//   moTa, kieu ('the' = thẻ có ảnh, 'combo' = thẻ combo, 'bang' = bảng giá gọn),
//   trangChu (nhóm có tab ở trang chủ), mon.
// Mỗi món: ten, gia (đồng), anh {file, w, h} nếu có ảnh thật, ghiChu,
//   hot (lên tab "Nổi bật" ở trang chủ), top (hiện ở tab của nhóm ở trang chủ, tối đa 4).
// Mỗi combo: ten, gia, nguoi, coLau, gom (các món), anh (ảnh ngang 1200x800, tỷ lệ 3:2,
//   file đặt tên combo-<ten>.webp trong public/assets/img).

const anh = (file, w, h) => ({ file, w, h });

export const NHOM_MON = [
	{
		slug: 'cuon',
		ten: 'Cuốn',
		goiLa: 'món cuốn',
		moTa: 'Bánh tráng, rau sống, thịt và nước chấm bày sẵn, cả bàn cùng cuốn. Cỡ nhỏ vừa 1 người, cỡ lớn vừa 2 người.',
		kieu: 'the',
		trangChu: true,
		mon: [
			{ ten: 'Set cuốn tổng hợp', gia: 288000, anh: anh('set-cuon-tong-hop.webp', 667, 1000), hot: true, top: true },
			{ ten: 'Cuốn heo quay - nhỏ', gia: 98000, anh: anh('cuon-heo-quay-nho.webp', 1000, 667), ghiChu: '1 người', hot: true, top: true },
			{ ten: 'Set cuốn nem lụi Huế', gia: 129000, anh: anh('cuon-nem-lui-hue.webp', 1000, 667), top: true },
			{ ten: 'Cuốn cá lăng nướng riềng', gia: 198000, anh: anh('cuon-ca-lang-nuong-rieng.webp', 1000, 573), top: true },
			{ ten: 'Sét cuốn thịt heo quay - lớn', gia: 178000, anh: anh('set-cuon-heo-quay-lon.webp', 667, 1000), ghiChu: '2 người' },
			{ ten: 'Cuốn chân giò - nhỏ', gia: 88000, anh: anh('cuon-chan-gio-nho.webp', 667, 1000), ghiChu: '1 người' },
			{ ten: 'Bánh tráng cuốn thịt chân giò - lớn', gia: 158000, anh: anh('cuon-chan-gio-lon.webp', 667, 1000), ghiChu: '2 người' },
		],
	},
	{
		slug: 'lau',
		ten: 'Lẩu',
		goiLa: 'lẩu',
		moTa: 'Nồi lớn vừa 4 đến 5 người, nồi bé vừa 2 người.',
		kieu: 'the',
		trangChu: true,
		mon: [
			{ ten: 'Lẩu cua sông siêu gạch', gia: 618000, anh: anh('lau-cua-song-sieu-gach.webp', 1000, 666), ghiChu: 'Nồi lớn, 4-5 người', hot: true, top: true },
			{ ten: 'Lẩu tôm bầu A Sinh', gia: 618000, anh: anh('lau-tom-bau-a-sinh.webp', 1000, 669), ghiChu: 'Nồi lớn, 4-5 người', hot: true, top: true },
			{ ten: 'Lẩu ốc Sài Thành - nồi lớn', gia: 588000, anh: anh('lau-oc-sai-thanh.webp', 667, 1000), ghiChu: '4-5 người', top: true },
			{ ten: 'Lẩu bê tơ nhúng mẻ', gia: 468000, anh: anh('lau-be-to-nhung-me.webp', 685, 1000), ghiChu: '2-3 người', top: true },
			{ ten: 'Lẩu cua sông - nồi bé', gia: 358000, anh: anh('lau-cua-song-noi-be.webp', 667, 1000), ghiChu: '2 người' },
			{ ten: 'Lẩu tôm bầu - nồi bé', gia: 358000, anh: anh('lau-tom-bau-noi-be.webp', 668, 1000), ghiChu: '2 người' },
			{ ten: 'Lẩu ốc - nồi bé', gia: 358000, anh: anh('lau-oc-noi-be.webp', 800, 1000), ghiChu: '2 người' },
		],
	},
	{
		slug: 'mon-chinh',
		ten: 'Món chính',
		goiLa: 'món chính',
		moTa: 'Gà ta, bò, ếch đồng, ốc: món mặn để cả bàn chia nhau.',
		kieu: 'the',
		trangChu: true,
		mon: [
			{ ten: 'Gà ta chiên mắm Sài Gòn', gia: 198000, anh: anh('ga-ta-chien-mam-sai-gon.webp', 986, 1000), hot: true, top: true },
			{ ten: 'Bò sốt tiêu xanh bản gang', gia: 198000, anh: anh('bo-sot-tieu-xanh-ban-gang.webp', 1000, 651), hot: true, top: true },
			{ ten: 'Nọng heo chiên lá móc mật', gia: 188000, anh: anh('nong-heo-chien-la-moc-mat.webp', 1000, 666), top: true },
			{ ten: 'Chả ốc bọc giấy bạc', gia: 156000, anh: anh('cha-oc-boc-giay-bac.webp', 1000, 869), top: true },
			{ ten: 'Gà ta lắc muối', gia: 198000, anh: anh('ga-ta-lac-muoi.webp', 861, 1000) },
			{ ten: 'Trứng non tim chim cháy tỏi', gia: 198000, anh: anh('trung-non-tim-chim-chay-toi.webp', 1000, 898) },
			{ ten: 'Bắp bò ngâm mắm tiêu xanh', gia: 158000, anh: anh('bap-bo-ngam-mam-tieu-xanh.webp', 1000, 921) },
			{ ten: 'Ếch đồng lắc muối', gia: 169000, anh: anh('ech-dong-lac-muoi.webp', 1000, 918) },
			{ ten: 'Ếch đồng chiên mắm', gia: 159000, anh: anh('ech-dong-chien-mam.webp', 1000, 771) },
			{ ten: 'Ốc nhồi thịt hấp sả', gia: 138000, anh: anh('oc-nhoi-thit-hap-sa.webp', 969, 1000) },
			{ ten: 'Gà hơ mông tiềm bí đỏ', gia: 368000, anh: anh('ga-ho-mong-tiem-bi-do.webp', 667, 1000), ghiChu: 'Đặt trước 1 ngày' },
			{ ten: 'Cá diêu hồng sốt mắm xoài', gia: 268000, anh: anh('ca-dieu-hong-sot-mam-xoai.webp', 1000, 673), ghiChu: 'Đặt trước 1 ngày' },
		],
	},
	{
		slug: 'goi-nom',
		ten: 'Gỏi, nộm',
		goiLa: 'gỏi, nộm',
		moTa: 'Món trộn chua ngọt, thanh miệng, hợp mở đầu bữa.',
		kieu: 'the',
		trangChu: true,
		mon: [
			{ ten: 'Gỏi bò kéo pháo', gia: 138000, anh: anh('goi-bo-keo-phao.webp', 980, 1000), hot: true, top: true },
			{ ten: 'Nộm rau càng cua bắp bò', gia: 138000, anh: anh('nom-rau-cang-cua-bap-bo.webp', 1000, 861), hot: true, top: true },
			{ ten: 'Gỏi bưởi tôm thịt', gia: 148000, anh: anh('goi-buoi-tom-thit.webp', 974, 1000), top: true },
		],
	},
	{
		slug: 'khai-vi',
		ten: 'Khai vị',
		goiLa: 'khai vị',
		moTa: 'Món chiên giòn, ăn chơi trong lúc chờ món chính.',
		kieu: 'the',
		trangChu: true,
		mon: [
			{ ten: 'Nấm hải sản chiên lắc muối tôm', gia: 88000, anh: anh('nam-hai-san-chien-lac-muoi-tom.webp', 906, 1000), top: true },
			{ ten: 'Đậu hũ Nhật chiên chà bông', gia: 128000, anh: anh('dau-hu-nhat-chien-cha-bong.webp', 1000, 844), top: true },
			{ ten: 'Chả ram tôm đất', gia: 118000, anh: anh('cha-ram-tom-dat.webp', 958, 1000), top: true },
			{ ten: 'Khoai tây chiên', gia: 68000, anh: anh('khoai-tay-chien.webp', 1000, 768), top: true },
			{ ten: 'Khoai lang Nhật chiên vừng', gia: 68000, anh: anh('khoai-lang-nhat-chien-vung.webp', 1000, 989) },
		],
	},
	{
		slug: 'rau',
		ten: 'Rau',
		goiLa: 'món rau',
		moTa: 'Rau theo mùa, luộc hoặc xào.',
		kieu: 'the',
		trangChu: true,
		mon: [
			{ ten: 'Ngó xuân luộc chấm kho quẹt', gia: 98000, anh: anh('ngo-xuan-luoc-cham-kho-quet.webp', 1000, 811), top: true },
			{ ten: 'Ngó xuân xào tỏi', gia: 98000, anh: anh('ngo-xuan-xao-toi.webp', 1000, 641), top: true },
			{ ten: 'Đậu Pháp xào trứng tim chim', gia: 138000, anh: anh('dau-phap-xao-trung-tim-chim.webp', 1000, 642), top: true },
			{ ten: 'Đậu Pháp xào sốt sampa', gia: 98000 },
			{ ten: 'Rau muống xào tỏi', gia: 88000, anh: anh('rau-muong-xao-toi.webp', 1000, 612), top: true },
		],
	},
	{
		slug: 'com-xoi',
		ten: 'Cơm, xôi',
		goiLa: 'cơm, xôi',
		moTa: 'Món chắc bụng, gọi kèm cho đủ bữa.',
		kieu: 'the',
		trangChu: true,
		mon: [
			{ ten: 'Cơm chiên tôm dứa', gia: 88000, anh: anh('com-chien-tom-dua.webp', 1000, 992), top: true },
			{ ten: 'Xôi chim trứng non đặc biệt', gia: 128000, anh: anh('xoi-chim-trung-non-dac-biet.webp', 1000, 624), top: true },
			{ ten: 'Miến xào tôm nấm', gia: 138000 },
		],
	},
	{
		slug: 'combo',
		ten: 'Combo',
		goiLa: 'combo',
		moTa: 'Mâm bày sẵn theo số người. Món trong combo không đổi sang món khác, muốn thêm món thì gọi theo giá lẻ.',
		kieu: 'combo',
		mon: [
			{
				ten: 'Combo Hàn Huyên',
				anh: anh('combo-han-huyen.webp', 1200, 800),
				gia: 315000,
				nguoi: 2,
				gom: ['Cuốn heo quay - nhỏ', 'Cuốn chân giò - nhỏ', 'Set cuốn nem lụi Huế'],
			},
			{
				ten: 'Combo Tâm Giao',
				anh: anh('combo-tam-giao.webp', 1200, 800),
				gia: 456000,
				nguoi: 2,
				coLau: true,
				gom: ['Cuốn heo quay - nhỏ', '1 lẩu nồi bé tự chọn: tôm bầu, cua sông hoặc ốc'],
			},
			{
				ten: 'Combo Quây Quần',
				anh: anh('combo-quay-quan.webp', 1200, 800),
				gia: 652000,
				nguoi: 4,
				gom: ['Set cuốn tổng hợp', 'Nộm rau càng cua bắp bò', 'Ốc nhồi thịt hấp sả', 'Nấm hải sản chiên lắc muối tôm'],
			},
			{
				ten: 'Combo Đoàn Viên',
				anh: anh('combo-doan-vien.webp', 1200, 800),
				gia: 872000,
				nguoi: 4,
				coLau: true,
				gom: [
					'Sét cuốn thịt heo quay - lớn',
					'Nộm rau càng cua bắp bò',
					'Gà ta chiên mắm Sài Gòn',
					'1 lẩu nồi bé tự chọn: tôm bầu, cua sông hoặc ốc',
				],
			},
			{
				ten: 'Combo Sum Vầy',
				anh: anh('combo-sum-vay.webp', 1200, 800),
				gia: 1268000,
				nguoi: 6,
				coLau: true,
				gom: [
					'Set cuốn tổng hợp',
					'Gỏi bò kéo pháo',
					'Chả ốc bọc giấy bạc',
					'Khoai tây chiên',
					'1 lẩu nồi lớn tự chọn: tôm bầu A Sinh hoặc cua sông siêu gạch',
				],
			},
			{
				ten: 'Combo Hoan Hỷ',
				anh: anh('combo-hoan-hy.webp', 1200, 800),
				gia: 1784000,
				nguoi: 8,
				coLau: true,
				gom: [
					'Set cuốn tổng hợp',
					'Gỏi bò kéo pháo',
					'Chả ốc bọc giấy bạc',
					'Nọng heo chiên lá móc mật',
					'Bò sốt tiêu xanh bản gang',
					'Gà ta chiên mắm Sài Gòn',
					'1 lẩu nồi lớn tự chọn: tôm bầu A Sinh hoặc cua sông siêu gạch',
				],
			},
		],
	},
	{
		slug: 'do-uong',
		ten: 'Đồ uống',
		goiLa: 'đồ uống',
		moTa: 'Nước ngọt, trà, nước sấu, nước me và bia.',
		kieu: 'bang',
		mon: [
			{ ten: 'Trà đá cốc', gia: 10000 },
			{ ten: 'Trà đá ca', gia: 35000 },
			{ ten: 'Trà chanh', gia: 25000 },
			{ ten: 'Trà quất', gia: 25000 },
			{ ten: 'Nước sấu đá', gia: 38000 },
			{ ten: 'Nước me đá', gia: 38000 },
			{ ten: 'Nước cam', gia: 20000 },
			{ ten: 'Coca lon', gia: 20000 },
			{ ten: 'Sprite lon', gia: 20000 },
			{ ten: 'Dasani chai', gia: 18000 },
			{ ten: 'Bia Sài Gòn Xanh', gia: 28000 },
			{ ten: 'Bia Tiger Bạc', gia: 28000 },
			{ ten: 'Bia Hà Nội chai nhỏ', gia: 25000 },
			{ ten: 'Rượu mơ', gia: 68000 },
		],
	},
];

// 98000 -> "98.000đ". Tự chấm phần nghìn để không phụ thuộc bộ ngôn ngữ của máy build.
export const giaVN = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

export const TONG_SO_MON = NHOM_MON.reduce((s, n) => s + n.mon.length, 0);

// Các nhóm có tab ở mục thực đơn trang chủ
export const nhomTrangChu = () => NHOM_MON.filter((n) => n.trangChu);

// Món của một nhóm hiện ở trang chủ: tối đa 4, món nổi bật luôn có mặt
export const monTrangChu = (n) => n.mon.filter((m) => m.hot || m.top).slice(0, 4);

// Combo đang bán, dùng cho mục combo ở trang chủ và trang thực đơn
export const COMBO = NHOM_MON.find((n) => n.slug === 'combo').mon;
