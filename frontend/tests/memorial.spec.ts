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

test('phone age categories remain readable and easy to select at every proportion', async ({ page, isMobile }) => {
  const counts = [1, 16, 22, 47, 14];
  await page.route('**/api/memorial', route => route.fulfill({ json: {
    statistics: { ...statistics, total: 100, total_with_age: 100,
      cohorts: statistics.cohorts.map((cohort, i) => ({ ...cohort, count: counts[i] })) },
    records: [record], dataset: { status: 'fallback', record_count: 100 },
  } }));
  await page.goto('/#stats');
  for (const width of [320, 360, 390, 430, 844]) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    const buttons = page.locator('.spectrum-segment');
    await expect(buttons).toHaveCount(5);
    const sizes = await buttons.evaluateAll(elements => elements.map(el => {
      const r = el.getBoundingClientRect(), label = el.querySelector('.segment-label')!;
      const range = document.createRange(); range.selectNodeContents(label);
      return { width: r.width, height: r.height, lines: range.getClientRects().length,
        fits: el.scrollWidth <= el.clientWidth + 1 };
    }));
    for (const size of sizes) {
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
      expect(size.lines).toBe(1);
      expect(size.fits).toBe(true);
    }
    const track = page.locator('.spectrum-track');
    await expect(track).toBeVisible();
    const proportions = await track.evaluate(el => Array.from(el.children).map(child =>
      child.getBoundingClientRect().width / el.getBoundingClientRect().width * 100));
    proportions.forEach((value, i) => expect(value).toBeCloseTo(counts[i], 0));
    for (let i = 0; i < counts.length; i++) {
      if (isMobile) await buttons.nth(i).tap(); else await buttons.nth(i).click();
      await expect(buttons.nth(i)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.spectrum-detail-box')).toContainText(statistics.cohorts[i].range);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test('phone controls fit their labels and keep comfortable touch and input sizes', async ({ page }) => {
  await page.goto('/#archivist');
  for (const width of [320, 390, 430, 844]) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    expect(await page.locator('#archivist-query').evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    for (const selector of ['.wordmark', '.archive-desk-source a', '.dataset-source a', '.archive-colophon a[href*="github.com"]']) {
      const sizes = await page.locator(selector).evaluateAll(elements => elements.map(el => {
        const r = el.getBoundingClientRect(); return { width: r.width, height: r.height };
      }));
      for (const size of sizes) {
        expect(size.height).toBeGreaterThanOrEqual(44);
        expect(size.width).toBeGreaterThanOrEqual(44);
      }
    }
  }
  await page.goto('/archive');
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const labelsFit = await page.locator('.archive-filters select').evaluateAll(elements => elements.every(el => {
      const select = el as HTMLSelectElement, style = getComputedStyle(el);
      const context = document.createElement('canvas').getContext('2d')!;
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      return context.measureText(select.selectedOptions[0].text).width + parseFloat(style.paddingLeft)
        + parseFloat(style.paddingRight) + 24 <= el.clientWidth;
    }));
    expect(labelsFit).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
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

test('formations stay suspended at their approved viewport centres between sections', async ({ page }) => {
  await page.goto('/');
  const mesh = page.locator('#human-particle-canvas');
  await expect(mesh).toHaveAttribute('data-scene', 'number');
  const center = Number(await mesh.getAttribute('data-center-y'));
  await page.evaluate(() => window.scrollTo({ top: 180, behavior: 'instant' }));
  await expect.poll(async () => Number(await mesh.getAttribute('data-center-y'))).toBeCloseTo(center, 0);
  await expect(mesh).toHaveCSS('opacity', '1');
  await page.locator('#crowd').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
  await expect(mesh).toHaveAttribute('data-scene', 'scatter');
  await expect(mesh).toHaveCSS('opacity', '1');
  const crowdCenter = Number(await mesh.getAttribute('data-center-y'));
  await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'instant' }));
  await expect.poll(async () => Number(await mesh.getAttribute('data-center-y'))).toBeCloseTo(crowdCenter, 0);
  await page.locator('#stats').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
  await expect(mesh).toHaveAttribute('data-scene', 'stats');
  await expect(mesh).toHaveCSS('opacity', '1');
});

test('souls progressively disperse before the next shape and stop rendering at rest', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    window.meshMatrices = [];
    window.meshPalette = [];
    window.meshY = [];
    window.meshFrames = [];
    for (const method of ['bufferData', 'bufferSubData'] as const) {
      const original = WebGL2RenderingContext.prototype[method];
      Object.defineProperty(WebGL2RenderingContext.prototype, method, { value: function(this: WebGL2RenderingContext, ...args: unknown[]) {
        const data = args[method === 'bufferData' ? 1 : 2];
        if (data instanceof Float32Array && data.length === 128 * 3) window.meshPalette = Array.from(data);
        if (data instanceof Float32Array && data.length === 128 * 16) {
          window.meshMatrices = Array.from(data);
          window.meshY.push(data[13]);
          window.meshFrames.push({ at: performance.now(), positions: window.meshMatrices });
          if (window.meshFrames.length > 120) window.meshFrames.shift();
        }
        return Reflect.apply(original, this, args);
      } });
    }
  });
  await page.route('**/api/memorial', route => route.fulfill({ json: { statistics: { ...statistics, total: 72835 },
    records: Array.from({ length: 128 }, (_, i) => ({ ...record, id: String(i) })), dataset: { status: 'fallback', record_count: 72835 } } }));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => window.meshMatrices.length)).toBe(128 * 16);
  await page.waitForTimeout(1500);
  const formed = await page.evaluate(() => window.meshMatrices);
  const displacement = (reference: number[]) => page.evaluate(previous => {
    let squared = 0;
    for (let i = 0; i < window.meshMatrices.length; i += 16) {
      squared += (window.meshMatrices[i + 12] - previous[i + 12]) ** 2
        + (window.meshMatrices[i + 13] - previous[i + 13]) ** 2;
    }
    return Math.sqrt(squared / (window.meshMatrices.length / 16));
  }, reference);
  const scrollProgress = (id: string, progress: number) => page.locator(`#${id}`).evaluate((el, value) => {
    const rect = el.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY + value * (rect.height - window.innerHeight * .3), behavior: 'instant' });
  }, progress);
  await scrollProgress('number', .2);
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'number');
  await expect.poll(() => displacement(formed)).toBeGreaterThan(.08);
  await page.waitForTimeout(1400);
  const early = await displacement(formed);
  await scrollProgress('number', .4);
  await page.waitForTimeout(1500);
  const midway = await displacement(formed);
  await scrollProgress('number', .7);
  await page.waitForTimeout(1500);
  const dispersed = await displacement(formed);
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'number');
  // Each record travels farther from its numeral position as the reader leaves the chapter.
  expect(midway).toBeGreaterThan(early * 2);
  expect(dispersed).toBeGreaterThan(midway * 1.5);
  const spread = await page.evaluate(() => {
    const xs: number[] = [], ys: number[] = [];
    for (let i = 0; i < window.meshMatrices.length; i += 16) {
      xs.push(window.meshMatrices[i + 12]); ys.push(window.meshMatrices[i + 13]);
    }
    return { width: (Math.max(...xs) - Math.min(...xs)) * 100, height: (Math.max(...ys) - Math.min(...ys)) * 100,
      scales: window.meshMatrices.filter((_, i) => i % 16 === 0) };
  });
  expect(spread.width).toBeGreaterThan(page.viewportSize()!.width * .7);
  expect(spread.height).toBeGreaterThan(page.viewportSize()!.height * .45);
  // Use the same tiny, quiet figures as the living-register background.
  for (const scale of spread.scales) expect(scale).toBeCloseTo(.025, 3);
  const departurePalette = await page.evaluate(() => window.meshPalette);
  const settledUploads = await page.evaluate(() => window.meshY.length);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.meshY.length)).toBe(settledUploads);
  const cloudPoint = await page.evaluate(() => {
    for (let i = 0; i < window.meshMatrices.length; i += 16) {
      const x = window.innerWidth / 2 + window.meshMatrices[i + 12] * 100;
      const y = window.innerHeight / 2 - window.meshMatrices[i + 13] * 100;
      if (x < 20 || x > window.innerWidth - 20 || y < 120 || y > window.innerHeight - 30) continue;
      const target = document.elementFromPoint(x, y);
      if (target && !target.closest('button, a, input, select, textarea, .card, [role="button"]')) return { x, y };
    }
    return null;
  });
  expect(cloudPoint, 'the dispersed field has a visible figure').not.toBeNull();
  if (isMobile) await page.touchscreen.tap(cloudPoint!.x, cloudPoint!.y);
  else {
    await page.mouse.move(cloudPoint!.x, cloudPoint!.y);
    await page.mouse.click(cloudPoint!.x, cloudPoint!.y);
  }
  await page.waitForTimeout(100);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.particle-memorial-pill')).toHaveCount(0);

  const cloud = await page.evaluate(() => window.meshMatrices);
  await scrollProgress('crowd', 0);
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'scatter');
  const chapterScroll = await page.evaluate(() => window.scrollY);
  await page.waitForTimeout(1600);
  expect(await page.evaluate(() => window.scrollY)).toBe(chapterScroll);
  expect(await displacement(cloud)).toBeGreaterThan(.2);
  expect(await page.evaluate(() => Math.max(...window.meshMatrices.filter((_, i) => i % 16 === 0)))).toBeLessThan(.094);

  await scrollProgress('crowd', .7);
  await page.waitForTimeout(1600);
  const mapDeparture = await page.evaluate(() => ({
    palette: window.meshPalette,
    scales: window.meshMatrices.filter((_, i) => i % 16 === 0),
    uploads: window.meshY.length,
  }));
  expect(mapDeparture.palette).toEqual(departurePalette);
  for (const scale of mapDeparture.scales) expect(scale).toBeCloseTo(.025, 3);
  expect(await displacement(cloud)).toBeLessThan(.02);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.meshY.length)).toBe(mapDeparture.uploads);

  await page.evaluate(() => { window.meshFrames = []; });
  await scrollProgress('archivist', 0);
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'archivist');
  await page.waitForTimeout(1600);
  expect(await displacement(cloud)).toBeLessThan(.02);
  expect(await page.evaluate(() => window.meshPalette)).toEqual(departurePalette);
  expect(await page.evaluate(() => window.meshFrames.length)).toBeGreaterThan(1);
  const quietStretch = await page.evaluate(() => Math.max(...window.meshFrames.map(frame =>
    Math.max(...frame.positions.filter((_, i) => i%16===5).map((height, i) => Math.abs(height/frame.positions[i*16]-1))))));
  expect(quietStretch, 'the quiet field keeps the same figure proportions on entry').toBeLessThan(.01);

  await scrollProgress('stats', 0);
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'stats');
  await page.waitForTimeout(1600);
  const tree = await page.evaluate(() => window.meshMatrices);
  const treePalette = await page.evaluate(() => window.meshPalette);
  await scrollProgress('stats', .4);
  await page.waitForTimeout(1500);
  expect(await displacement(tree), 'the tree stays complete through the first 40% of its chapter').toBeLessThan(.02);
  expect(await page.evaluate(() => window.meshPalette)).toEqual(treePalette);
  await scrollProgress('stats', .65);
  await page.waitForTimeout(1500);
  expect(await displacement(tree)).toBeGreaterThan(.15);
  expect(await displacement(cloud)).toBeGreaterThan(.15);
  await scrollProgress('stats', .85);
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'stats');
  await page.waitForTimeout(1500);
  expect(await displacement(cloud)).toBeLessThan(.02);
  await scrollProgress('stats', .4);
  await page.waitForTimeout(1500);
  expect(await displacement(tree), 'scrolling back restores the held tree').toBeLessThan(.02);

  await scrollProgress('crowd', 0);
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'scatter');
  await page.waitForTimeout(1100);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true');
  await page.waitForTimeout(200);
  const reducedBefore = await page.evaluate(() => window.meshMatrices);
  await scrollProgress('crowd', .2);
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'scatter');
  await page.waitForTimeout(200);
  expect(await displacement(reducedBefore)).toBeLessThan(.02);
});

test('Palestine keeps its centre and the remembrance note stays in the responsive navbar', async ({ page, isMobile }) => {
  await page.goto('/#finale');
  const mesh = page.locator('#human-particle-canvas');
  await expect(mesh).toHaveAttribute('data-scene', 'finale');
  await page.evaluate(() => document.fonts.ready);
  const viewport = page.viewportSize()!;
  await expect.poll(() => page.evaluate(() => {
    const center = Number(document.querySelector('#human-particle-canvas')!.getAttribute('data-center-y'));
    return center / window.innerHeight;
  })).toBeCloseTo(viewport.width < 760 ? .54 : .51, 2);
  const bounds = await page.locator('#finale').evaluate(el => ({
    top: el.querySelector('.finale-lead-block')!.getBoundingClientRect().top,
    bottom: el.querySelector('.flag-quote')!.getBoundingClientRect().bottom,
    y: Number(document.querySelector('#human-particle-canvas')!.getAttribute('data-center-y')),
  }));
  expect(bounds.y).toBeGreaterThan(bounds.top);
  expect(bounds.y).toBeLessThan(bounds.bottom);
  const note = page.locator('.masthead').getByText('هؤلاء مَن وُثِّقَت أسماؤهم… وليسوا كلَّ مَن فقدنا.', { exact: true });
  await expect(note).toBeVisible();
  await expect(page.getByText('هؤلاء مَن وُثِّقَت أسماؤهم… وليسوا كلَّ مَن فقدنا.', { exact: true })).toHaveCount(1);
  await expect(page.locator('svg[viewBox="0 0 12 19"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  if (isMobile) for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(note).toBeVisible();
    const layout = await note.evaluate(el => ({
      top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom,
      headerBottom: document.querySelector('.masthead')!.getBoundingClientRect().bottom,
      pageWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth,
    }));
    expect(layout.top).toBeGreaterThanOrEqual(0);
    expect(layout.bottom).toBeLessThanOrEqual(layout.headerBottom + 1);
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth);
  }
  const beforeFooter = Number(await mesh.getAttribute('data-center-y'));
  await page.locator('.archive-colophon').evaluate(el => window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * .45, behavior: 'instant',
  }));
  await expect.poll(async () => Number(await mesh.getAttribute('data-center-y'))).toBeLessThan(beforeFooter - 30);
  const readBoundary = () => mesh.evaluate(el => {
    const clip = getComputedStyle(el).clipPath.match(/inset\(0px 0px ([\d.]+)px/);
    return { bottom: clip ? Number(clip[1]) : -1,
      footer: document.querySelector('.archive-colophon')!.getBoundingClientRect().top, height: window.innerHeight,
      css: getComputedStyle(el).clipPath, mode: el.getAttribute('data-scene'), center: el.getAttribute('data-center-y') };
  });
  // Resizing and scroll anchoring can finish on separate animation frames.
  await expect.poll(async () => (await readBoundary()).bottom).toBeGreaterThan(0);
  const boundary = await readBoundary();
  expect(boundary.bottom, JSON.stringify(boundary)).toBeGreaterThan(0);
  expect(boundary.height - boundary.bottom).toBeLessThanOrEqual(boundary.footer + 1);
});

test('source acknowledgement credits and thanks Tech For Palestine clearly on narrow screens', async ({ page, isMobile }) => {
  await page.goto('/#finale');
  const credits = page.locator('.archive-colophon').getByRole('region', { name: 'مصدر الأسماء', exact: true });
  await expect(credits.getByRole('heading', { name: 'مصدر الأسماء', exact: true })).toBeVisible();
  await expect(credits.getByRole('link', { name: 'Tech For Palestine', exact: true })).toHaveAttribute('href', 'https://data.techforpalestine.org/docs/killed-in-gaza/');
  await expect(credits.getByRole('link', { name: 'مستودع البيانات المفتوح', exact: true })).toHaveAttribute('href', 'https://github.com/TechForPalestine/palestine-datasets');
  const logo = credits.getByRole('img', { name: 'شعار Tech For Palestine' });
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const website = page.locator('.archive-colophon').getByRole('link', { name: 'babaqi.io', exact: true });
  await expect(website).toHaveAttribute('href', 'https://babaqi.io');
  await expect(website).toHaveAttribute('rel', /noopener/);
  const thanks = credits.getByText('شكرًا للقائمين على المشروع ولكلّ مَن يسهم في توثيق الأسماء وصون الذاكرة.', { exact: true });
  await expect(thanks).toBeVisible();
  if (isMobile) await page.setViewportSize({ width: 320, height: 844 });
  await credits.scrollIntoViewIfNeeded();
  const layout = await credits.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const paragraphs = Array.from(el.querySelectorAll('p')).map(p => {
      const style = getComputedStyle(p);
      return { font: parseFloat(style.fontSize), line: parseFloat(style.lineHeight) };
    });
    const logo = el.querySelector('img')!.closest('a')!.getBoundingClientRect();
    const identity = el.querySelector('h3')!.parentElement!.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewport: window.innerWidth, pageWidth: document.documentElement.scrollWidth, paragraphs,
      brandOffset: Math.abs(logo.top + logo.height / 2 - identity.top - identity.height / 2) };
  });
  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(layout.viewport);
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewport);
  expect(layout.paragraphs).toHaveLength(2);
  expect(layout.brandOffset).toBeLessThan(4);
  for (const paragraph of layout.paragraphs) {
    expect(paragraph.font).toBeGreaterThanOrEqual(12);
    expect(paragraph.line).toBeGreaterThanOrEqual(paragraph.font * 1.4);
  }
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
      const move = (now: number) => { window.scrollTo({ top: (now - start) * .1, behavior: 'instant' });
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
  // Only the changing quiet-ink blend uploads colours; settled departure does no work.
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
  await page.waitForTimeout(1400);
  const departurePhase = await page.evaluate(() => ({ ...window.particleProbe }));
  expect(departurePhase.colorUploads).toBeGreaterThan(0);
  expect(departurePhase.colorUploads).toBeLessThanOrEqual(departurePhase.draws);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.particleProbe.colorUploads)).toBe(departurePhase.colorUploads);
  expect(await page.evaluate(() => window.particleProbe.draws)).toBe(departurePhase.draws);
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
  await page.locator('#crowd').evaluate(el => {
    window.particleProbe.draws = 0; window.particleProbe.colorUploads = 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + .7 * (el.getBoundingClientRect().height - innerHeight * .3), behavior: 'instant' });
  });
  await page.waitForTimeout(1400);
  const mapDeparture = await page.evaluate(() => ({ ...window.particleProbe }));
  // The map already uses quiet ink, so departure needs no redundant colour upload.
  expect(mapDeparture.colorUploads).toBe(0);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.particleProbe.draws)).toBe(mapDeparture.draws);
  expect(await page.evaluate(() => window.particleProbe.colorUploads)).toBe(mapDeparture.colorUploads);
});

test('number keeps muted flag colors while Palestine restores its original palette', async ({ page }) => {
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
      // The parchment-white band is a muted warm neutral, not pure luminous white.
      if (r > .35 && g > .35 && b > .3 && r / b < 1.5) found.white++;
      if (r < .03 && g < .03 && b < .03) found.black++;
    }
    return found;
  });
  expect(colors.red).toBeGreaterThan(0);
  expect(colors.green).toBeGreaterThan(0);
  expect(colors.white).toBeGreaterThan(0);
  expect(colors.black).toBeGreaterThan(0);
  expect(await page.evaluate(() => Math.max(...window.meshPalette))).toBeLessThan(.6);
  await expect(page.locator('#human-particle-canvas canvas')).toHaveCSS('filter', 'none');
  await page.locator('#finale').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'finale');
  await expect.poll(() => page.evaluate(() => Math.max(...window.meshPalette))).toBeCloseTo(1, 5);
  const originalColors = await page.evaluate(() => {
    const linear = (value: number) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    return ['e4312b', '149954', 'ffffff', '1e221e'].map(hex => {
      const expected = [0, 2, 4].map(index => linear(parseInt(hex.slice(index, index + 2), 16) / 255));
      for (let i = 0; i < window.meshPalette.length; i += 3) {
        if (expected.every((value, index) => Math.abs(value - window.meshPalette[i + index]) < .00001)) return true;
      }
      return false;
    });
  });
  expect(originalColors).toEqual([true, true, true, true]);
});

test('records are interactive only in settled formations, not scrolls, morphs or the quiet field', async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2 });
    Object.defineProperty(navigator, 'deviceMemory', { value: 2 });
    window.meshMatrices = [];
    window.meshFrames = [];
    for (const method of ['bufferData', 'bufferSubData'] as const) {
      const original = WebGL2RenderingContext.prototype[method];
      Object.defineProperty(WebGL2RenderingContext.prototype, method, { value: function(this: WebGL2RenderingContext, ...args: unknown[]) {
        const data = args[method === 'bufferData' ? 1 : 2];
        if (data instanceof Float32Array && data.length === 128 * 16) {
          window.meshMatrices = Array.from(data);
          window.meshFrames.push({ at: performance.now(), positions: window.meshMatrices });
          if (window.meshFrames.length > 2) window.meshFrames.shift();
        }
        return Reflect.apply(original, this, args);
      } });
    }
  });
  await page.route('**/api/memorial', route => route.fulfill({ json: { statistics,
    records: Array.from({ length: 128 }, (_, i) => ({ ...record, id: String(i), ar_name: `${record.ar_name} ${i}` })), dataset: { status: 'fallback', record_count: 128 } } }));
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => window.meshMatrices.length)).toBe(128 * 16);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#stats').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'stats');
  await page.waitForTimeout(1600);
  const pickParticle = () => page.evaluate(() => {
    const previous = window.meshFrames.at(-2)?.positions ?? window.meshMatrices;
    const candidates = [];
    for (let i = 0; i < window.meshMatrices.length; i += 16) {
      const x = window.innerWidth / 2 + window.meshMatrices[i + 12] * 100;
      const y = window.innerHeight / 2 - window.meshMatrices[i + 13] * 100;
      if (x < 20 || x > window.innerWidth - 20 || y < 120 || y > window.innerHeight - 30) continue;
      const target = document.elementFromPoint(x, y);
      if (!target || target.closest('button, a, input, select, textarea, .stat-trio-card, .generations-spectrum-container, .stats-bottom-ribbon, .one-record, .card, .chat-interface, .archivist-input-wrap, [role="button"]')) continue;
      const movement = Math.hypot(window.meshMatrices[i + 12] - previous[i + 12], window.meshMatrices[i + 13] - previous[i + 13]);
      candidates.push({ index: i, x, y, movement });
    }
    return candidates.sort((a, b) => a.movement - b.movement)[0] ?? null;
  });
  const settled = await pickParticle();
  expect(settled, 'a visible figure in the settled tree').not.toBeNull();
  if (isMobile) await page.touchscreen.tap(settled!.x, settled!.y);
  else {
    await page.mouse.move(settled!.x, settled!.y);
    await expect(page.locator('.particle-memorial-pill')).toContainText('أمل النجار');
    await page.mouse.click(settled!.x, settled!.y);
  }
  await expect(page.getByRole('dialog')).toContainText('أمل النجار');
  if (isMobile) await page.touchscreen.tap(4, 4);
  else await page.mouse.click(4, 4);
  await expect(page.getByRole('dialog')).not.toBeVisible();

  const scrolling = page.evaluate(async () => {
    const base = window.scrollY;
    const started = performance.now();
    await new Promise<void>(resolve => {
      const move = (now: number) => {
        window.scrollTo({ top: base + (now - started) * .12, behavior: 'instant' });
        if (now - started < 1000) requestAnimationFrame(move); else resolve();
      };
      requestAnimationFrame(move);
    });
  });
  await page.waitForTimeout(120);
  const moving = await pickParticle();
  expect(moving, 'a visible figure while the reader scrolls').not.toBeNull();
  if (isMobile) await page.touchscreen.tap(moving!.x, moving!.y);
  else {
    await page.mouse.move(moving!.x, moving!.y);
    await page.mouse.click(moving!.x, moving!.y);
  }
  await page.waitForTimeout(100);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.particle-memorial-pill')).toHaveCount(0);
  await scrolling;

  const transitionStart = await page.locator('#crowd').evaluate(el => {
    const started = performance.now();
    // An incoming formed mode is still assembling after the scroll-input guard expires.
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * .35, behavior: 'instant' });
    return started;
  });
  await expect(page.locator('#human-particle-canvas')).toHaveAttribute('data-scene', 'scatter');
  await expect.poll(() => page.evaluate(() => window.meshFrames.at(-1)!.at)).toBeGreaterThan(transitionStart);
  await page.waitForTimeout(180);
  const floating = await pickParticle();
  expect(floating, 'a visible soul between the two chapters').not.toBeNull();
  if (isMobile) {
    await page.touchscreen.tap(floating!.x, floating!.y);
  } else {
    await page.mouse.move(floating!.x, floating!.y);
    await page.mouse.click(floating!.x, floating!.y);
  }
  await page.waitForTimeout(100);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.particle-memorial-pill')).toHaveCount(0);
  expect(await page.evaluate(() => performance.now()) - transitionStart).toBeLessThan(800);

  await page.locator('#archivist').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
  await page.waitForTimeout(1600);
  const quiet = await pickParticle();
  expect(quiet, 'the quiet field remains visibly populated').not.toBeNull();
  if (isMobile) await page.touchscreen.tap(quiet!.x, quiet!.y);
  else {
    await page.mouse.move(quiet!.x, quiet!.y);
    await page.mouse.click(quiet!.x, quiet!.y);
  }
  await page.waitForTimeout(150);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.particle-memorial-pill')).toHaveCount(0);
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
