import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'portable-site');
let html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
const jsMatch = html.match(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/);
const cssMatch = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if (!jsMatch || !cssMatch) throw new Error('Expected one built JS and CSS asset');
const asset = href => path.join(root, 'dist', href.replace(/^\//, ''));
const js = await readFile(asset(jsMatch[1]), 'utf8');
const css = await readFile(asset(cssMatch[1]), 'utf8');
if (/\bimport\.meta\b|\bimport\s*\(|\bexport\s*\{/.test(js)) throw new Error('Bundle is not standalone');

// The original module was deferred. A classic inline bundle must run after #root exists.
html = html.replace(jsMatch[0], '');
html = html.replace('</body>', () => `<script>${js.replace(/<\/script/gi, '<\\/script')}</script></body>`);
html = html.replace(cssMatch[0], () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
html = html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'" />`);
if (/<(?:script|link|img)\b[^>]*(?:src|href)="(?:\/|https?:)/i.test(html)) throw new Error('External asset remains');
if (html.indexOf('<div id="root"') > html.indexOf('<script>')) throw new Error('Bundle executes before the root container');
await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'index.html'), html, 'utf8');
await writeFile(path.join(output, 'КАК ОТКРЫТЬ.txt'), '\ufeff' + [
  'ЭНЕРГЕТИЧЕСКИЕ ПРОЕКТЫ — ПРОТОТИП САЙТА',
  '',
  '1. Полностью распакуйте ZIP-архив в любую папку на компьютере.',
  '2. Откройте файл index.html двойным щелчком.',
  '   Если браузер не открылся, нажмите правой кнопкой → Открыть с помощью → браузер.',
  '',
  'Подойдут современные Chrome, Edge, Firefox или Safari.',
  'Интернет, Node.js, установка программ и запуск сервера не требуются.',
  'Все стили, иллюстрации и код уже находятся внутри index.html.',
  '',
  'Доступны обе формы, детали проекта, меню, FAQ и документы.',
  'Это демонстрация: заявки никуда не отправляются, документы являются заглушками.',
  'Исходные параметры проекта не подтверждены; пояснения сохранены в интерфейсе.',
  '',
  'Для пересылки отправьте весь ZIP-архив. Можно также переслать один index.html.',
  'Если почтовая программа показывает только предпросмотр файла, сначала сохраните',
  'и распакуйте архив на компьютере, затем откройте index.html из папки.'
].join('\r\n'), 'utf8');
console.log(`Offline package ready: ${output}`);
