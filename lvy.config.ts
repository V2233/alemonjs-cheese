import { defineConfig } from 'lvyjs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const includes = (value: string) => process.argv.includes(value);
const alemonjs = () => import('alemonjs').then(res => res.start('src/index.ts'));
const jsxp = () => import('jsxp').then(res => res.createServer());
export default defineConfig({
  alias: {
    entries: [{ find: '@src', replacement: join(__dirname, 'src') }],
  },
  assets: {
    // 支持图片、字体、文本等静态资源
    filter: /\.(png|jpg|jpeg|gif|svg|webp|ico|yaml|txt|ttf|md)$/,
  },
});
