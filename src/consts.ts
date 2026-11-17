// Thông tin dùng chung cho mọi trang của cuonsinh.com.
export const SITE_NAME = 'Cuốn Sinh';
// Tiêu đề trang chủ trên Google: tên quán + món + khu vực, là ba thứ khách gõ khi tìm.
// Câu "Tươi ngon mỗi cuốn, ấm áp mỗi bữa" vẫn là dòng chữ lớn ở đầu trang chủ.
export const SITE_TITLE = 'Cuốn Sinh - Nhà hàng món cuốn, lẩu tại Thanh Xuân, Hà Nội';
export const SITE_DESCRIPTION =
	'Nhà hàng Cuốn Sinh: món cuốn, lẩu và món Việt chia sẻ tại Số 3, ngõ 58 Vũ Trọng Phụng, Thanh Xuân, Hà Nội. Đặt bàn: 0844 566 922.';
export const HOTLINE = '0844 566 922';
export const HOTLINE_TEL = 'tel:0844566922';
// Zalo của quán đăng ký bằng chính số hotline: link này mở thẳng khung chat.
export const ZALO_URL = 'https://zalo.me/0844566922';
export const MESSENGER_URL = 'https://m.me/nhahangcuonsinh';
export const FACEBOOK_URL = 'https://www.facebook.com/nhahangcuonsinh';
export const MAPS_URL =
	'https://www.google.com/maps/search/?api=1&query=Nh%C3%A0+h%C3%A0ng+Cu%E1%BB%91n+Sinh%2C+S%E1%BB%91+3+ng%C3%B5+58+V%C5%A9+Tr%E1%BB%8Dng+Ph%E1%BB%A5ng%2C+Thanh+Xu%C3%A2n%2C+H%C3%A0+N%E1%BB%99i';
export const DEFAULT_OG_IMAGE = '/assets/img/lau-cua-song-sieu-gach.webp';

// Địa chỉ và giờ nhận khách: MỘT nguồn cho trang Liên hệ và dữ liệu có cấu trúc gửi
// Google (src/lib/schema.mjs). Tên, địa chỉ, số điện thoại phải giống hệt trên Google
// Maps và Fanpage, đổi ở đây thì nhớ đổi cả hai nơi đó.
export const TEN_QUAN = 'Nhà hàng Cuốn Sinh';
export const DIA_CHI = {
	duong: 'Số 3, ngõ 58 Vũ Trọng Phụng',
	quan: 'Thanh Xuân',
	thanhPho: 'Hà Nội',
};
export const DIA_CHI_DAY_DU = `${DIA_CHI.duong}, ${DIA_CHI.quan}, ${DIA_CHI.thanhPho}`;
// Toạ độ lấy từ chính ghim "Cuốn Sinh, 3 Ng. 58 Đ. Vũ Trọng Phụng" trên Google Maps (kiểm 17/11/2026).
export const TOA_DO = { lat: 20.9999156, lng: 105.8080349 };
// Mở cả tuần, hai ca. Giờ này cũng nằm ở public/assets/js/site.js (dòng "Đang mở cửa").
export const CA_MO_CUA = [
	{ ten: 'Ca trưa', mo: '09:00', dong: '14:00' },
	{ ten: 'Ca tối', mo: '16:30', dong: '22:00' },
];
// Bản đồ nhúng ở trang Liên hệ (không cần khoá API).
export const MAPS_EMBED_URL =
	'https://www.google.com/maps?q=Nh%C3%A0+h%C3%A0ng+Cu%E1%BB%91n+Sinh%2C+S%E1%BB%91+3+ng%C3%B5+58+V%C5%A9+Tr%E1%BB%8Dng+Ph%E1%BB%A5ng%2C+Thanh+Xu%C3%A2n%2C+H%C3%A0+N%E1%BB%99i&hl=vi&z=17&output=embed';
