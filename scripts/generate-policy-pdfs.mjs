import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { publicPolicies, getPolicyCategory } from '../lib/policies.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public', 'policies');
await mkdir(output, { recursive: true });

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const browser = await chromium.launch({ channel: 'msedge', headless: true });

for (const policy of publicPolicies) {
  const category = getPolicyCategory(policy.category)?.title || policy.category;
  const sections = policy.sections.map(section => `<section><h2>${escape(section.title)}</h2>${(section.paragraphs || []).map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}${section.points ? `<ul>${section.points.map(point => `<li>${escape(point)}</li>`).join('')}</ul>` : ''}</section>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(policy.title)}</title><style>
    @page{size:A4;margin:20mm 18mm 19mm}*{box-sizing:border-box}body{margin:0;color:#202338;font:11pt/1.55 Arial,sans-serif}header{border-bottom:3px solid #bd252b;padding-bottom:16px;margin-bottom:24px}.school{color:#202a70;font:700 11pt Arial,sans-serif;letter-spacing:.04em}.category{margin-top:22px;color:#bd252b;font-size:8pt;font-weight:700;letter-spacing:.14em;text-transform:uppercase}h1{margin:7px 0 10px;color:#202a70;font:700 28pt/1.15 Georgia,serif}header p{margin:0;color:#626575;font-size:11pt}.draft{display:flex;margin-top:18px;padding:11px 13px;background:#fff4df;border-left:4px solid #ae6217;color:#55452f;font-size:9.5pt}.draft strong{margin-right:5px}section{break-inside:avoid;padding:18px 0;border-top:1px solid #dddde3}h2{margin:0 0 10px;color:#202a70;font:700 17pt Georgia,serif}p{margin:8px 0;color:#4f5262}ul{margin:9px 0 0;padding-left:20px}li{margin:0 0 7px;padding-left:4px}li::marker{color:#bd252b}footer{margin-top:25px;padding-top:12px;border-top:1px solid #dddde3;color:#626575;font-size:8.5pt}
  </style></head><body><header><div class="school">PRESBYTERIAN HIGH SCHOOL · MHONDORO</div><div class="category">${escape(category)}</div><h1>${escape(policy.title)}</h1><p>${escape(policy.description)}</p>${policy.status === 'draft' ? '<div class="draft"><strong>DRAFT FOR SCHOOL REVIEW.</strong> This interim guidance has not yet been adopted as an official school policy and may change after review.</div>' : ''}</header>${sections}<footer>No publication or revision date has been assigned. Direct questions or feedback to the school office.</footer></body></html>`;
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({ path: path.join(output, policy.fileName), format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="width:100%;font:8px Arial;color:#777;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>', margin: { top: '20mm', right: '18mm', bottom: '19mm', left: '18mm' } });
  await page.close();
}

await browser.close();
console.log(`Generated ${publicPolicies.length} draft policy PDFs in ${output}`);
