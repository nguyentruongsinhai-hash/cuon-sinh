// @ts-check

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://cuonsinh.com',
	adapter: cloudflare(),
	// Website tĩnh, không dùng phiên đăng nhập. Tắt để adapter không khai báo
	// binding KV "SESSION" thiếu id, thứ làm `wrangler preview` lỗi 10021.
	session: false,
	integrations: [mdx(), sitemap()],
});
