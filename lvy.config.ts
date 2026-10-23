import { defineConfig } from 'lvyjs';
import tailwindcss from 'lvyjs-plugin-tailwindcss';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const includes = (value: string) => process.argv.includes(value);
const alemonjs = () => import('alemonjs').then(res => res.start('src/index.ts'));
const jsxp = () => import('jsxp').then(res => res.createServer());
export default defineConfig({
  env: process.env,
  alias: {
    entries: [{ find: '@src', replacement: join(__dirname, 'src') }],
  },
  plugins: [tailwindcss()],
  // assets: {
  //   // 支持图片、字体、文本等静态资源
  //   filter: /\.(png|jpg|jpeg|gif|svg|webp|ico|yaml|txt|ttf|md|css)$/,
  // },
  build: {
    tsdown: {
      // dts: true,
      tsconfig: 'tsconfig.alemonjs.json',
    },
  },
});
