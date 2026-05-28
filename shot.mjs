import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 });

// 1. Nueva tarea (Btn is a div, use text selector)
await page.click('text=Nueva tarea');
await page.waitForTimeout(700);
await page.screenshot({ path: '/tmp/t1-create-task.png' });
const hasModal = await page.$('[placeholder*="Título"]');
console.log('1. NUEVA TAREA:', hasModal ? 'OK' : 'FAIL');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// 2. List page
await page.click('button:has-text("Lista")');
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/t2-list.png' });

// Click filter buttons - also divs?
const filterBtns = await page.$$eval('button', els => els.map(e => e.textContent?.trim()).filter(Boolean));
console.log('LIST BUTTONS:', JSON.stringify(filterBtns.slice(0, 30)));

await page.click('button:has-text("Ejecución")');
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/t3-list-ejecucion.png' });

await page.click('button:has-text("Todas")');
await page.waitForTimeout(300);

// 3. Task detail
await page.click('button:has-text("Tablero")');
await page.waitForTimeout(400);
await page.click('text=Cerrar onboarding rediseño');
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/t4-task-detail.png' });
const hasDetail = await page.$('textarea');
console.log('3. TASK DETAIL:', hasDetail ? 'OK' : 'FAIL');
await page.click('text=Listo');
await page.waitForTimeout(300);

// 4. Sidebar project click
await page.click('button:has-text("Rediseño app")');
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/t5-project-filtered.png' });
const subtitle = await page.$eval('[style*="Mono"], [style*="monospace"]', el => el.textContent).catch(() => '');

// 5. Create project
await page.click('button:has-text("Proyectos")');
await page.waitForTimeout(400);
await page.click('text=Nuevo proyecto');
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/t6-create-project.png' });
const hasProjModal = await page.$('[placeholder*="Nombre del proyecto"]');
console.log('5. NUEVO PROYECTO:', hasProjModal ? 'OK' : 'FAIL');
await page.keyboard.press('Escape');

// 6. Search
await page.click('text=buscar...');
await page.waitForTimeout(500);
const inp = await page.$('input');
if (inp) { await inp.type('backend'); await page.waitForTimeout(300); }
await page.screenshot({ path: '/tmp/t7-search.png' });
const hasSearch = await page.$('input');
console.log('6. SEARCH:', hasSearch ? 'OK' : 'FAIL');
await page.keyboard.press('Escape');

// 7. Calendar navigation
await page.click('button:has-text("Calendario")');
await page.waitForTimeout(400);
const subtitle7 = await page.$eval('text=Mayo 2026', el => el.textContent).catch(() => null);
console.log('7. CALENDAR INITIAL:', subtitle7 ? 'OK' : 'FAIL');
// Click next month (arrow button)
const navBtns = await page.$$('button');
// find the → button near "Hoy"
for (const btn of navBtns) {
  const txt = await btn.textContent();
  if (txt?.trim() === 'Hoy') {
    // next sibling
    break;
  }
}
await page.screenshot({ path: '/tmp/t8-calendar.png' });

console.log('ALL ERRORS:', errors.length > 0 ? errors : 'none');
await browser.close();
