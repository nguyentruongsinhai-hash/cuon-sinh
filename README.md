# cuon-sinh

Website nhà hàng Cuốn Sinh - món cuốn & lẩu, Thanh Xuân, Hà Nội (cuonsinh.com)

Dựng bằng [Astro](https://astro.build) (mẫu blog) và chạy trên Cloudflare Workers qua adapter `@astrojs/cloudflare`.

## Lệnh thường dùng

| Lệnh | Việc làm |
| :-- | :-- |
| `npm install` | Cài thư viện |
| `npm run dev` | Chạy thử ở `localhost:4321` |
| `npm run build` | Build bản chính thức vào `./dist/` |
| `npm run preview` | Xem thử bản build trước khi đưa lên |
| `npm run deploy` | Build rồi đưa lên Cloudflare (`wrangler deploy`) |
| `npm run generate-types` | Sinh kiểu TypeScript cho binding Cloudflare |

## Cấu trúc

- `src/pages/` - các trang (trang chủ, giới thiệu, blog)
- `src/content/blog/` - bài viết dạng Markdown / MDX
- `src/components/`, `src/layouts/` - khối giao diện dùng lại
- `src/consts.ts` - tên và mô tả website
- `public/` - file tĩnh (favicon, ảnh)
- `astro.config.mjs` - cấu hình Astro và adapter Cloudflare
- `wrangler.jsonc` - cấu hình Worker trên Cloudflare

## Yêu cầu

Node.js từ 22.23.4 trở lên.
