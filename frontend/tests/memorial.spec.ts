import { test, expect } from '@playwright/test';

declare global { interface Window {
  meshY: number[];
  meshMatrices: number[];
  meshFrames: { at: number; positions: number[] }[];
  meshPalette: number[];
  particleProbe: { draws: number; count: number; brown: number; green: number; colorUploads: number };
} }

const record = { id: 'a', ar_name: 'أمل النجار', en_name: 'Amal Najjar', age: 0, dob: '2024-01-01', sex: 'f', update: '10' };
const statistics = { total: 2, total_with_age: 2, children_under_18: 1, infants_under_1: 1, unknown_age: 0,
  average_age: 35, median_age: 35, min_age: 0, max_age: 70, male: 1, female: 1,
  cohorts: [{ id: 'infants', range: '0–4', count: 1 }, { id: 'children', range: '5–14', count: 0 },
    { id: 'youth', range: '15–24', count: 0 }, { id: 'adults', range: '25–49', count: 0 }, { id: 'elders', range: '50+', count: 1 }],
  age_distribution: [], records_by_year: [] };

test.beforeEach(async ({ page }) => {
  await page.route('**/api/memorial', route => route.fulfill({ json: { statistics, records: [record],
    dataset: { status: 'fallback', origin: 'bundled', record_count: 2, checked_at: null, source_revision: 10,
      source_docs: 'https://data.techforpalestine.org/docs/killed-in-gaza/' } } }));
  await page.route('**/api/records?**', route => {
    const q = new URL(route.request().url()).searchParams.get('q');
    return route.fulfill({ json: { items: q === 'missing' ? [] : [record], total: q === 'missing' ? 0 : 1,
      page: 1, page_size: 12, total_pages: 1 } });
  });
});

test('real statistics, provenance and narrow layouts', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.dataset-note')).toContainText('نسخة محفوظة');
  await expect(page.locator('#stats')).toContainText('70');
  await expect(page.locator('#stats')).not.toContainText('21,637');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await expect(page.locator('.chapter')).toHaveCount(6);
  await expect(page.locator('#archive')).toHaveCount(0);
  await page.getByRole('link', { name: 'البحث في السجلات' }).click();
  await expect(page).toHaveURL(/\/archive/);
  await expect(page.getByLabel('الاسم أو اسم العائلة')).toBeVisible();
});

test('age summaries are whole years while counts and percentages retain precision', async ({ page }) => {
  await page.route('**/api/memorial', route => route.fulfill({ json: {
    statistics: { ...statistics, total: 72835, children_under_18: 21637, average_age: 28.7, median_age: 27.5 },
    records: [record], dataset: { status: 'fallback', origin: 'bundled', record_count: 72835,
      source_docs: 'https://data.techforpalestine.org/docs/killed-in-gaza/' },
  } }));
  await page.goto('/');
  const cards = page.locator('.stat-trio-card');
  await expect(cards.nth(0).locator('.trio-number')).toHaveText('21,637');
  await expect(cards.nth(0).locator('.trio-badge')).toHaveText('29.7٪ من الأسماء المسجّلة');
  await expect(cards.nth(1).locator('.trio-number')).toHaveText('29');
  await expect(cards.nth(1).locator('.trio-desc')).toContainText('28 عامًا');
  await expect(cards.nth(2).locator('.trio-number')).toHaveText('70');
  await expect(page.locator('.segment-pct').first()).toHaveText('50.0٪');
});

test('search, clear focus, no results and record dialog', async ({ page }) => {
  await page.goto('/archive');
  const search = page.getByLabel('الاسم أو اسم العائلة');
  await search.fill('missing');
  await expect(page.getByText('لا توجد أسماء مطابقة')).toBeVisible();
  await page.getByRole('button', { name: 'مسح البحث' }).click();
  await expect(search).toBeFocused();
  const open = page.getByRole('button', { name: /عرض سجل أمل النجار/ });
  await open.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(open).toBeFocused();
});

test('failed archive request retries and old queries do not win', async ({ page }) => {
  let fail = true;
  await page.route('**/api/records?**', async route => {
    const q = new URL(route.request().url()).searchParams.get('q');
    if (fail) return route.fulfill({ status: 503, body: 'unavailable' });
    if (q === 'slow') await new Promise(resolve => setTimeout(resolve, 700));
    await route.fulfill({ json: { items: q === 'missing' ? [] : [record], total: q === 'missing' ? 0 : 1,
      page: 1, page_size: 12, total_pages: 1 } }).catch(() => {});
  });
  await page.goto('/archive');
  await expect(page.getByText('تعذّر تحميل الأسماء.')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'إعادة تحميل الأسماء' }).click();
  await expect(page.getByRole('button', { name: /عرض سجل أمل النجار/ })).toBeVisible();
  await page.getByLabel('الاسم أو اسم العائلة').fill('slow');
  await page.waitForTimeout(350);
  await page.getByLabel('الاسم أو اسم العائلة').fill('missing');
  await expect(page.getByText('لا توجد أسماء مطابقة')).toBeVisible();
  await page.waitForTimeout(800);
  await expect(page.getByText('لا توجد أسماء مطابقة')).toBeVisible();
});

test('automatic reduced motion and WebGL fallback without a motion control', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes('webgl')) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true');
  await expect(page.locator('.opening-count')).toBeVisible();
  await expect(page.getByRole('button', { name: /تشغيل الحركة|إيقاف الحركة/ })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'false');
  await expect(page.getByRole('link', { name: 'البحث في السجلات' })).toBeAttached();
});

test('formation anchors move with their sections while changing shape', async ({ page }) => {
  await page.goto('/');
  const mesh = page.locator('#human-particle-canvas');
  await expect(mesh).toHaveAttribute('data-scene', 'number');
  const center = Number(await mesh.getAttribute('data-center-y'));
  await page.evaluate(() => window.scrollTo({ top: 180, behavior: 'instant' }));
  await expect.poll(async () => Number(await mesh.getAttribute('data-center-y'))).toBeCloseTo(center - 180, 0);
  await expect(mesh).toHaveCSS('opacity', '1');
  await page.locator('#crowd').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
  await expect(mesh).toHaveAttribute('data-scene', 'scatter');
  await expect(mesh).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'instant' }));
  const crowdCenter = await page.locator('#crowd').evaluate(el => {
    const rect = el.getBoundingClientRect();
    // Long chapters hold the formation while filling the viewport, then carry it out with their edge.
    return Math.max(rect.top, Math.min(0, rect.bottom - window.innerHeight)) + window.innerHeight * .53;
  });
  await expect.poll(async () => Number(await mesh.getAttribute('data-center-y'))).toBeCloseTo(crowdCenter, 0);
  await page.locator('#stats').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
  await expect(mesh).toHaveAttribute('data-scene', 'stats');
  await expect(mesh).toHaveCSS('opacity', '1');
});

test('particles travel with section content and settle continuously after one scroll', async ({ page }) => {
  await page.addInitScript(() => {
    const samples: number[] = [];
    window.meshY = samples;
    for (const method of ['bufferData', 'bufferSubData'] as const) {
      const original = WebGL2RenderingContext.prototype[method];
      Object.defineProperty(WebGL2RenderingContext.prototype, method, { value: function(this: WebGL2RenderingContext, ...args: unknown[]) {
        const data = args[method === 'bufferData' ? 1 : 2];
        // The one-record fixture produces one 4×4 instance transform.
        if (data instanceof Float32Array && data.length === 16) samples.push(data[13]);
        return Reflect.apply(original, this, args);
      } });
    }
  });
  await page.goto('/');
  const readY = () => page.evaluate(() => window.meshY);
  await expect.poll(async () => (await readY()).length).toBeGreaterThan(0);
  await page.waitForTimeout(1500);
  const before = (await readY()).at(-1)!;
  await page.evaluate(() => {
    window.meshY.length = 0;
    window.scrollTo({ top: 180, behavior: 'instant' });
  });
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'number');
  // The actual uploaded transform follows its section upward by 180px, not just a DOM attribute.
  await expect.poll(async () => (await readY()).at(-1) ?? before, { timeout: 3000 }).toBeCloseTo(before + 1.8, 2);
  await page.waitForTimeout(300);
  const scrolled = (await readY()).at(-1)!;
  await page.evaluate(() => {
    window.meshY.length = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  // Reversing the reader's scroll returns the same figure down with its section.
  await expect.poll(async () => (await readY()).at(-1) ?? scrolled, { timeout: 3000 }).toBeCloseTo(before, 2);
  expect(scrolled - (await readY()).at(-1)!).toBeCloseTo(1.8, 2);
  await page.waitForTimeout(300);
  const departure = (await readY()).at(-1)!;
  await page.evaluate(() => {
    window.meshY.length = 0;
    const chapter = document.querySelector('#crowd')!;
    window.scrollTo({ top: chapter.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  });
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'scatter');
  const chapterScroll = await page.evaluate(() => window.scrollY);
  await expect.poll(async () => (await readY()).length).toBeGreaterThan(5);
  // One input starts a continuous morph; it finishes while scrollY stays fixed.
  await page.waitForTimeout(180);
  const during = (await readY()).at(-1)!;
  await page.waitForTimeout(1200);
  const after = (await readY()).at(-1)!;
  expect(await page.evaluate(() => window.scrollY)).toBe(chapterScroll);
  expect(Math.abs(after - during)).toBeGreaterThan(.02);
  const samples = [departure, ...await readY()];
  const largestStep = Math.max(...samples.slice(1).map((y, i) => Math.abs(y - samples[i])));
  // A full-viewport wrap would teleport the name while moving between sections.
  expect(largestStep * 100).toBeLessThan(page.viewportSize()!.height * .55);
  const settledUploads = (await readY()).length;
  await page.waitForTimeout(350);
  expect((await readY()).length).toBe(settledUploads);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true');
  await page.evaluate(() => {
    window.meshY.length = 0;
    const chapter = document.querySelector('#stats')!;
    window.scrollTo({ top: chapter.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  });
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'stats');
  await page.waitForTimeout(200);
  const reducedSamples = await readY();
  expect(reducedSamples.length).toBeGreaterThan(0);
  expect(reducedSamples.every(y => Math.abs(y - reducedSamples.at(-1)!) < .01)).toBe(true);
});

test('Palestine stands behind the closing passage at the original centre', async ({ page }) => {
  await page.goto('/#finale');
  const mesh = page.locator('#human-particle-canvas');
  await expect(mesh).toHaveAttribute('data-scene', 'finale');
  await page.evaluate(() => document.fonts.ready);
  const viewport = page.viewportSize()!;
  await expect.poll(() => page.evaluate(() => {
    const rect = document.querySelector('#finale')!.getBoundingClientRect();
    const offset = Math.max(rect.top, Math.min(0, rect.bottom - window.innerHeight));
    const center = Number(document.querySelector('#human-particle-canvas')!.getAttribute('data-center-y'));
    return (center - offset) / window.innerHeight;
  })).toBeCloseTo(viewport.width < 760 ? .54 : .51, 2);
  const bounds = await page.locator('#finale').evaluate(el => ({
    top: el.querySelector('.finale-lead-block')!.getBoundingClientRect().top,
    bottom: el.querySelector('.flag-quote')!.getBoundingClientRect().bottom,
    y: Number(document.querySelector('#human-particle-canvas')!.getAttribute('data-center-y')),
  }));
  expect(bounds.y).toBeGreaterThan(bounds.top);
  expect(bounds.y).toBeLessThan(bounds.bottom);
});

test('assistant renders Arabic Markdown and rejects executable content', async ({ page }) => {
  await page.route('**/api/agent/chat', route => route.fulfill({ json: {
    answer: '## أسماء في الذاكرة\n\n**أمل** تبقى في السجل.\n\n- اسم واحد\n- حياة كاملة\n\n| الاسم | العمر |\n| --- | --- |\n| أمل | 0 |\n\n[المصدر](https://data.techforpalestine.org/docs/killed-in-gaza/)\n\n[رابط غير آمن](javascript:alert(1))\n\n<script>window.markdownExecuted = true</script>',
    model: 'test', records: [record], tools_used: [], fallback_used: false,
  } }));
  await page.goto('/#archivist');
  await page.getByRole('textbox', { name: /سؤالك/ }).fill('ابحث عن أمل');
  await page.getByRole('button', { name: 'اسأل حارس الأرشيف', exact: true }).click();
  const prose = page.locator('.agent-prose');
  await expect(prose.getByRole('heading', { name: 'أسماء في الذاكرة' })).toBeVisible();
  await expect(prose.locator('strong')).toHaveText('أمل');
  await expect(prose.getByRole('listitem')).toHaveCount(2);
  await expect(prose.getByRole('table')).toBeVisible();
  await expect(prose.getByRole('link', { name: 'المصدر', exact: true })).toHaveAttribute('rel', /noopener/);
  await expect(prose.locator('a[href^="javascript:"]')).toHaveCount(0);
  await expect(prose.locator('script')).toHaveCount(0);
  expect(await page.evaluate(() => 'markdownExecuted' in window)).toBe(false);
});

test('low-resource devices receive a bounded field that stops rendering when idle', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2 });
    Object.defineProperty(navigator, 'deviceMemory', { value: 2 });
    window.particleProbe = { draws: 0, count: 0, brown: 0, green: 0, colorUploads: 0 };
    const original = WebGL2RenderingContext.prototype.drawElementsInstanced;
    WebGL2RenderingContext.prototype.drawElementsInstanced = function(...args) {
      window.particleProbe.draws++; window.particleProbe.count = args[4];
      return Reflect.apply(original, this, args);
    };
    const upload = WebGL2RenderingContext.prototype.bufferSubData;
    Object.defineProperty(WebGL2RenderingContext.prototype, 'bufferSubData', { value: function(this: WebGL2RenderingContext, ...args: unknown[]) {
      if (args[2] instanceof Float32Array && args[2].length === 600 * 3) window.particleProbe.colorUploads++;
      return Reflect.apply(upload, this, args);
    } });
  });
  await page.route('**/api/memorial', route => route.fulfill({ json: { statistics,
    records: Array.from({ length: 2400 }, (_, i) => ({ ...record, id: String(i) })), dataset: { status: 'fallback', record_count: 2400 } } }));
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => window.particleProbe.count)).toBe(600);
  await page.waitForTimeout(1800);
  const idle = await page.evaluate(() => window.particleProbe.draws);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.particleProbe.draws)).toBe(idle);
  await page.evaluate(async () => {
    window.particleProbe.draws = 0; window.particleProbe.colorUploads = 0;
    const start = performance.now();
    await new Promise<void>(resolve => {
      const move = (now: number) => { window.scrollTo({ top: (now - start) * .15, behavior: 'instant' });
        if (now - start < 1000) requestAnimationFrame(move); else resolve(); };
      requestAnimationFrame(move);
    });
  });
  const measured = await page.evaluate(() => window.particleProbe);
  expect(measured.draws).toBeGreaterThan(10);
  expect(measured.draws).toBeLessThanOrEqual(40);
  expect(measured.colorUploads).toBe(0);
  await page.waitForTimeout(1400);
  const settled = await page.evaluate(() => window.particleProbe.draws);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.particleProbe.draws)).toBe(settled);
  await page.evaluate(() => {
    window.particleProbe.draws = 0;
    const chapter = document.querySelector('#crowd')!;
    window.scrollTo({ top: chapter.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  });
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'scatter');
  await page.waitForTimeout(1200);
  const transitionDraws = await page.evaluate(() => window.particleProbe.draws);
  expect(transitionDraws).toBeGreaterThan(10);
  expect(transitionDraws).toBeLessThanOrEqual(40);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.particleProbe.draws)).toBe(transitionDraws);
});

test('opening number uses all four Palestine flag colors', async ({ page }) => {
  await page.addInitScript(() => {
    window.meshPalette = [];
    for (const method of ['bufferData', 'bufferSubData'] as const) {
      const original = WebGL2RenderingContext.prototype[method];
      Object.defineProperty(WebGL2RenderingContext.prototype, method, { value: function(this: WebGL2RenderingContext, ...args: unknown[]) {
        const data = args[method === 'bufferData' ? 1 : 2];
        if (data instanceof Float32Array && data.length === 256 * 3) window.meshPalette = Array.from(data);
        return Reflect.apply(original, this, args);
      } });
    }
  });
  await page.route('**/api/memorial', route => route.fulfill({ json: { statistics: { ...statistics, total: 72835 },
    records: Array.from({ length: 256 }, (_, i) => ({ ...record, id: String(i) })), dataset: { status: 'fallback', record_count: 72835 } } }));
  await page.goto('/');
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'number');
  await expect.poll(() => page.evaluate(() => window.meshPalette.length)).toBe(256 * 3);
  const colors = await page.evaluate(() => {
    const found = { red: 0, green: 0, white: 0, black: 0 };
    for (let i = 0; i < window.meshPalette.length; i += 3) {
      const [r, g, b] = window.meshPalette.slice(i, i + 3);
      if (r > .1 && r > g * 3 && r > b * 3) found.red++;
      if (g > .1 && g > r * 2 && g > b * 1.3) found.green++;
      if (r > .65 && g > .65 && b > .65) found.white++;
      if (r < .03 && g < .03 && b < .03) found.black++;
    }
    return found;
  });
  expect(colors.red).toBeGreaterThan(0);
  expect(colors.green).toBeGreaterThan(0);
  expect(colors.white).toBeGreaterThan(0);
  expect(colors.black).toBeGreaterThan(0);
});

test('olive branch particles reveal names on hover and open records on tap', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    window.meshMatrices = [];
    for (const method of ['bufferData', 'bufferSubData'] as const) {
      const original = WebGL2RenderingContext.prototype[method];
      Object.defineProperty(WebGL2RenderingContext.prototype, method, { value: function(this: WebGL2RenderingContext, ...args: unknown[]) {
        const data = args[method === 'bufferData' ? 1 : 2];
        if (data instanceof Float32Array && data.length === 128 * 16) window.meshMatrices = Array.from(data);
        return Reflect.apply(original, this, args);
      } });
    }
  });
  await page.route('**/api/memorial', route => route.fulfill({ json: { statistics,
    records: Array.from({ length: 128 }, (_, i) => ({ ...record, id: String(i) })), dataset: { status: 'fallback', record_count: 128 } } }));
  await page.goto('/#declaration');
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'names');
  await expect.poll(() => page.evaluate(() => window.meshMatrices.length)).toBe(128 * 16);
  await page.waitForTimeout(1600);
  const particle = await page.evaluate(() => {
    // Project the uploaded transforms through this canvas's orthographic camera (zoom100).
    for (let i = 0; i < window.meshMatrices.length; i += 16) {
      const x = window.innerWidth / 2 + window.meshMatrices[i + 12] * 100;
      const y = window.innerHeight / 2 - window.meshMatrices[i + 13] * 100;
      if (x < 20 || x > window.innerWidth - 20 || y < 120 || y > window.innerHeight - 30) continue;
      const target = document.elementFromPoint(x, y);
      if (target && !target.closest('button, a, input, select, textarea, .one-record, .card, [role="button"]')) return { x, y };
    }
    return null;
  });
  expect(particle, 'a visible olive particle outside the record card').not.toBeNull();
  if (isMobile) {
    await page.touchscreen.tap(particle!.x, particle!.y);
  } else {
    await page.mouse.move(particle!.x, particle!.y);
    await expect(page.locator('.particle-memorial-pill')).toContainText('أمل النجار');
    await page.mouse.click(particle!.x, particle!.y);
  }
  await expect(page.getByRole('dialog')).toContainText('أمل النجار');
  // Opening on pointerup must survive its synthesized click; a separate backdrop gesture still closes it.
  if (isMobile) await page.touchscreen.tap(4, 4);
  else await page.mouse.click(4, 4);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('one name has a brown-and-green olive branch behind its readable record', async ({ page }) => {
  await page.addInitScript(() => {
    window.particleProbe = { draws: 0, count: 0, brown: 0, green: 0, colorUploads: 0 };
    for (const method of ['bufferData', 'bufferSubData'] as const) {
      const original = WebGL2RenderingContext.prototype[method];
      Object.defineProperty(WebGL2RenderingContext.prototype, method, { value: function(this: WebGL2RenderingContext, ...args: unknown[]) {
        const data = args[method === 'bufferData' ? 1 : 2];
        if (data instanceof Float32Array && data.length === 128 * 3) {
          window.particleProbe.brown = 0; window.particleProbe.green = 0;
          for (let i = 0; i < data.length; i += 3) {
            if (data[i] > data[i + 1] * 1.3) window.particleProbe.brown++;
            if (data[i + 1] > data[i] * 1.1) window.particleProbe.green++;
          }
        }
        return Reflect.apply(original, this, args);
      } });
    }
  });
  await page.route('**/api/memorial', route => route.fulfill({ json: { statistics,
    records: Array.from({ length: 128 }, (_, i) => ({ ...record, id: String(i) })), dataset: { status: 'fallback', record_count: 128 } } }));
  await page.goto('/#declaration');
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'names');
  await expect.poll(() => page.evaluate(() => window.particleProbe.brown)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.particleProbe.green)).toBeGreaterThan(0);
  await page.locator('.one-record button').click();
  await expect(page.getByRole('dialog')).toContainText('أمل النجار');
});

test('URL filters, native sorting, paging and browser history', async ({ page }) => {
  await page.route('**/api/records?**', route => {
    const params = new URL(route.request().url()).searchParams;
    return route.fulfill({ json: { items: [record], total: 25,
      page: Math.min(3, Number(params.get('page'))), page_size: 12, total_pages: 3 } });
  });
  await page.goto('/archive?q=أمل&age=0');
  await expect(page.getByLabel('الاسم أو اسم العائلة')).toHaveValue('أمل');
  await expect(page.getByLabel('العمر المسجّل')).toHaveValue('0');
  await page.getByLabel('ترتيب الأسماء').selectOption('age:false');
  await expect(page).toHaveURL(/sort=age.*ascending=false/);
  await page.getByRole('button', { name: 'التالي' }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.goBack();
  await expect(page.getByText('صفحة ١ من ٣')).toBeVisible();
  await page.getByLabel('العمر المسجّل').fill('151');
  await expect(page.getByText('أدخل عمرًا صحيحًا من ٠ إلى ١٥٠.')).toBeVisible();
  await page.getByLabel('العمر المسجّل').fill('0');
  await expect(page.getByRole('button', { name: /عرض سجل أمل النجار/ })).toBeEnabled();
});

test('optional assistant retains a failed question and retries', async ({ page }) => {
  let fail = true;
  await page.route('**/api/agent/chat', route => fail
    ? route.fulfill({ status: 503, body: 'unavailable' })
    : route.fulfill({ json: { answer: 'نتائج من الأرشيف', model: 'local-algorithmic-fallback', records: [record], tools_used: [], fallback_used: true } }));
  await page.goto('/#archivist');
  const question = page.getByRole('textbox', { name: /سؤالك/ });
  await question.fill('ابحث عن أمل');
  await page.getByRole('button', { name: 'اسأل حارس الأرشيف', exact: true }).click();
  await expect(page.locator('.dialogue-user-query')).toContainText('ابحث عن أمل');
  await expect(page.getByRole('button', { name: /إعادة المحاولة/ })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: /المحاولة/ }).click();
  await expect(page.getByText('نتائج من الأرشيف', { exact: true })).toBeVisible();
});
