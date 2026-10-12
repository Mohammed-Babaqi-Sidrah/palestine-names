import { test, expect } from '@playwright/test';

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

test('reduced motion, pause persistence and WebGL fallback', async ({ page }) => {
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
  await page.getByRole('button', { name: 'تشغيل الحركة' }).click();
  await page.getByRole('button', { name: 'إيقاف الحركة' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'تشغيل الحركة' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: 'البحث في السجلات' })).toBeAttached();
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
  const question = page.getByRole('textbox', { name: /ماذا تريد أن تستحضر/ });
  await question.fill('ابحث عن أمل');
  await page.getByRole('button', { name: /استنطاق السجل الأرشيفي/ }).click();
  await expect(page.locator('.dialogue-user-query')).toContainText('ابحث عن أمل');
  await expect(page.getByRole('button', { name: /إعادة المحاولة/ })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: /المحاولة/ }).click();
  await expect(page.getByText('نتائج من الأرشيف', { exact: true })).toBeVisible();
});
