// Dữ liệu có cấu trúc (JSON-LD) để Google hiểu cuonsinh.com là web của một nhà hàng
// có địa chỉ, giờ mở cửa, thực đơn và chỗ đặt bàn. Mọi thông tin lấy từ src/consts.ts
// và src/data, không gõ tay lại ở đây: sửa giờ hay địa chỉ một nơi là đủ.
//
// Cố ý KHÔNG khai điểm đánh giá (aggregateRating): Google không nhận sao do chính quán
// tự khai trên web mình, và số sao trên Maps đổi liên tục.
import {
	CA_MO_CUA,
	DEFAULT_OG_IMAGE,
	DIA_CHI,
	FACEBOOK_URL,
	MAPS_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	TEN_QUAN,
	TOA_DO,
} from '../consts';
import { ANH_KHONG_GIAN } from '../data/khong-gian.mjs';
import { NHOM_MON, giaVN } from '../data/thuc-don.mjs';

const CA_TUAN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Khoảng giá một món (thẻ món có ảnh, không tính combo và đồ uống), ví dụ "88.000đ - 618.000đ". */
export function khoangGia() {
	const gia = NHOM_MON.filter((n) => n.kieu === 'the').flatMap((n) => n.mon.map((m) => m.gia));
	return giaVN(Math.min(...gia)) + ' - ' + giaVN(Math.max(...gia));
}

/** Nút "Nhà hàng": dùng ở trang chủ và trang Liên hệ. `site` là Astro.site. */
export function nhaHangLd(site) {
	const u = (p) => new URL(p, site).href;
	return {
		'@type': 'Restaurant',
		'@id': u('/#nha-hang'),
		name: TEN_QUAN,
		alternateName: SITE_NAME,
		description: SITE_DESCRIPTION,
		url: u('/'),
		telephone: '+84844566922',
		image: [u(DEFAULT_OG_IMAGE), u('/assets/img/set-cuon-tong-hop.webp'), ...ANH_KHONG_GIAN.map((a) => u('/assets/img/' + a.file))],
		logo: u('/assets/logo-cuon-sinh.png'),
		servesCuisine: ['Món Việt', 'Món cuốn', 'Lẩu'],
		priceRange: khoangGia(),
		currenciesAccepted: 'VND',
		hasMenu: u('/thuc-don/'),
		acceptsReservations: u('/dat-ban/'),
		hasMap: MAPS_URL,
		address: {
			'@type': 'PostalAddress',
			streetAddress: DIA_CHI.duong,
			addressLocality: DIA_CHI.quan,
			addressRegion: DIA_CHI.thanhPho,
			addressCountry: 'VN',
		},
		geo: { '@type': 'GeoCoordinates', latitude: TOA_DO.lat, longitude: TOA_DO.lng },
		areaServed: { '@type': 'City', name: DIA_CHI.thanhPho },
		openingHoursSpecification: CA_MO_CUA.map((c) => ({
			'@type': 'OpeningHoursSpecification',
			dayOfWeek: CA_TUAN,
			opens: c.mo,
			closes: c.dong,
		})),
		potentialAction: {
			'@type': 'ReserveAction',
			target: { '@type': 'EntryPoint', urlTemplate: u('/dat-ban/'), inLanguage: 'vi' },
			result: { '@type': 'FoodEstablishmentReservation', name: 'Đặt bàn tại ' + TEN_QUAN },
		},
		sameAs: [FACEBOOK_URL],
	};
}

/** Nút "Website": cho Google biết tên web là "Cuốn Sinh". Chỉ đặt ở trang chủ. */
export function webSiteLd(site) {
	const u = (p) => new URL(p, site).href;
	return {
		'@type': 'WebSite',
		'@id': u('/#web'),
		name: SITE_NAME,
		alternateName: TEN_QUAN,
		url: u('/'),
		inLanguage: 'vi',
		publisher: { '@id': u('/#nha-hang') },
	};
}

/** Đường dẫn phân cấp. `cap` = [{ ten, path }], Trang chủ tự thêm ở đầu. */
export function duongDanLd(site, cap) {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: [{ ten: 'Trang chủ', path: '/' }, ...cap].map((c, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: c.ten,
			item: new URL(c.path, site).href,
		})),
	};
}

/** Gói nhiều nút vào một khối JSON-LD. Thoát "<" để chuỗi không đóng nhầm thẻ script. */
export function goiLd(...nut) {
	return JSON.stringify({ '@context': 'https://schema.org', '@graph': nut.filter(Boolean) }).replace(/</g, '\\u003c');
}
