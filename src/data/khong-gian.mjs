// Ảnh không gian quán (chủ quán gửi 17/11/2026), dùng cho mục "Không gian" ở
// trang chủ và trang Giới thiệu qua src/components/AnhKhongGian.astro.
// Thêm bớt ảnh thì chỉ sửa ở đây: file nằm trong public/assets/img, đặt tên
// khong-gian-<ten>.webp, rộng 1200. moTa là chữ cho trình đọc màn hình và Google.
export const ANH_KHONG_GIAN = [
	{
		file: 'khong-gian-tang-1-quay.webp',
		w: 1200,
		h: 795,
		chuThich: 'Tầng 1, quầy và lối lên tầng 2',
		moTa: 'Tầng 1 Cuốn Sinh: bàn ghế gỗ sáng màu, đèn mây đan, quầy ốp đá và cầu thang lên tầng 2',
	},
	{
		file: 'khong-gian-tang-1-ban.webp',
		w: 1200,
		h: 795,
		chuThich: 'Tầng 1, nhìn ra cửa',
		moTa: 'Dãy bàn 4 người ở tầng 1 Cuốn Sinh, tường vẽ tranh đồng lúa, đèn hình nón lá treo sát cửa kính',
	},
	{
		file: 'khong-gian-tang-2-cua-so.webp',
		w: 1200,
		h: 795,
		chuThich: 'Tầng 2, dãy bàn cạnh cửa sổ',
		moTa: 'Tầng 2 Cuốn Sinh: cửa sổ lớn nhìn ra hàng cây, ghế băng dọc tường, đèn mây và nón lá treo trần',
	},
	{
		file: 'khong-gian-tang-2-day-ghe.webp',
		w: 1200,
		h: 795,
		chuThich: 'Tầng 2, dãy ghế băng ghép bàn dài',
		moTa: 'Dãy ghế băng dài ở tầng 2 Cuốn Sinh, các bàn kê liền nhau cho nhóm đông, trần treo nón lá',
	},
];
