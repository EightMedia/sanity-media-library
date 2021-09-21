import { test, expect } from '@playwright/test';

const path = require('path');

const INTERNET_SPEED_TIMEOUT: number = process.env.GITHUB ? 10000 : 2000; // time for sanity to reflect changes
const DOMAIN = 'http://localhost:3000';

require('dotenv').config();
test.use({ storageState: 'state.json' });

const IMAGES = [
  'alejandro-contreras-wTPp323zAEw-unsplash.jpg',
  'boris-smokrovic-lyvCvA8sKGc-unsplash.jpg',
  'gwen-weustink-I3C1sSXj1i8-unsplash.jpg',
  'ricky-kharawala-adK3Vu70DEQ-unsplash.jpg',
];

async function countSelector(page, selector) {
  const items = await page.$$(selector);
  return items.length;
}

async function dialogVisible(page) {
  const isVisible = await page.isVisible('#media-library-dialog');
  return isVisible;
}

async function dialogHidden(page) {
  const isVisible = await page.isHidden('#media-library-dialog');
  return isVisible;
}

test.describe('Media library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${DOMAIN}/media-library`, { timeout: INTERNET_SPEED_TIMEOUT * 12 });
  });

  test('empty state', async ({ page }) => {
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    expect(await page.isVisible('text=No assets found'));
  });

  test('upload', async ({ page }) => {
    expect(await page.isVisible('#noContent'));

    await page.setInputFiles(
      'input[type="file"]',
      IMAGES.map((img) => path.join(__dirname, 'fixtures', img)),
      {}
    );
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    const draggables = await page.$$('[draggable]');
    expect(draggables.length).toBe(IMAGES.length);
  });

  test('listview', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');
    expect(await page.textContent('thead')).toContain('Title');
    expect(await page.textContent('thead')).toContain('Alt');
    expect(await page.textContent('thead')).toContain('Tags');
    expect(await page.textContent('thead')).toContain('Dimensions');
    expect(await page.textContent('thead')).toContain('Type');
    expect(await page.textContent('thead')).toContain('Size');
    expect(await page.textContent('thead')).toContain('Created at');
  });

  test('imagedata', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');
    expect(await page.textContent('tbody tr')).toContain('-unsplash.jpg');
    expect(await page.textContent('tbody tr')).toContain(' x ');
    expect(await page.textContent('tbody tr')).toContain('JPG');
    expect(await page.textContent('tbody tr')).toContain(' kb');
  });

  test('search', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');
    await page.fill('[placeholder="Search by filename, title, alt or tag"]', 'ricky');
    expect(await countSelector(page, '[draggable]')).toBe(1);
    await page.fill('[placeholder="Search by filename, title, alt or tag"]', '');
    expect(await countSelector(page, '[draggable]')).toBe(IMAGES.length);
  });

  test('edit dialog double click', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');
    await page.dblclick(`text=${IMAGES[0]}`);
    expect(await dialogVisible(page)).toBeTruthy();
    expect(await page.textContent('#media-library-dialog')).toContain(IMAGES[0]);

    await page.keyboard.press('Escape');
    expect(await dialogHidden(page)).toBeTruthy();
  });

  test('edit dialog edit asset', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');
    await page.click(`text=${IMAGES[0]}`);
    await page.click('text=Edit asset');
    await dialogVisible(page);
    expect(await page.textContent('#media-library-dialog')).toContain(IMAGES[0]);

    await page.click('text=Cancel');
    expect(await dialogHidden(page)).toBeTruthy();
  });

  test('sort assets', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');

    await page.selectOption('#sortSelect', 'az');
    expect(await page.textContent('tbody tr td:nth-of-type(3)')).toContain(
      IMAGES.sort((a, b) => a.localeCompare(b))[0]
    );

    await page.selectOption('#sortSelect', 'za');
    expect(await page.textContent('tbody tr td:nth-of-type(3)')).toContain(
      IMAGES.sort((a, b) => b.localeCompare(a))[0]
    );
  });

  test('edit title', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');
    await page.dblclick(`text=${IMAGES[0]}`);
    await dialogVisible(page);
    expect(await page.textContent('#media-library-dialog')).toContain(IMAGES[0]);
    await page.fill('[placeholder="No title yet"]', 'TEST_TITLE');
    await page.click('text=Save changes');
    await dialogHidden(page);
    expect(await page.isVisible('text=TEST_TITLE'));
  });

  test('edit tags', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');
    await page.dblclick(`img`);
    await dialogVisible(page);
    await page.fill('[placeholder="No tags yet"]', 'TEST_TAG1');
    await page.click('text=Save changes');
    await dialogHidden(page);

    expect(await countSelector(page, '[draggable]')).toBe(4);
    await page.click('label[for="TEST_TAG1"]');
    expect(await countSelector(page, '[draggable]')).toBe(1);
    await page.click('text=Clear filters');
    expect(await countSelector(page, '[draggable]')).toBe(4);
  });

  test('show custom fields', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');
    await page.dblclick('[draggable]');
    expect(await page.textContent('#media-library-dialog')).toContain('Title');
    expect(await page.textContent('#media-library-dialog')).toContain('Alt text');
    expect(await page.textContent('#media-library-dialog')).toContain('Tags');
    expect(await page.textContent('#media-library-dialog')).toContain('Additional description');
    expect(await page.textContent('#media-library-dialog')).toContain('Decade when photo captured');
    expect(await page.textContent('#media-library-dialog')).toContain('Is a premium photo');
    expect(await page.textContent('#media-library-dialog')).toContain('Attribution');
    expect(await page.textContent('#media-library-dialog')).toContain('Location');
    expect(await page.textContent('#media-library-dialog')).toContain('Latitude');
    expect(await page.textContent('#media-library-dialog')).toContain('Altitude');
    expect(await page.textContent('#media-library-dialog')).toContain('Copyright');
  });

  test('change custom fields', async ({ page }) => {
    await page.click('label[for="detailsViewCheckbox"]');
    await page.dblclick('[draggable]');
    await page.fill('#media-library-dialog [placeholder="No alt text yet"]', 'TEST_ALT');
    await page.fill('#media-library-dialog [placeholder="No tags yet"]', 'TEST_TAG');
    await page.fill('#media-library-dialog [placeholder="No description yet"]', 'TEST_DESCRIPTION');
    await page.fill('#media-library-dialog [placeholder="Between 1800 and 2200"]', '1800');
    await page.check('#media-library-dialog [type="checkbox"]');
    await page.fill('#media-library-dialog [placeholder="No attribution yet"]', 'MY_ATTRIBUTION');
    await page.fill('#media-library-dialog [name="lat"]', '-34.397');
    await page.fill('#media-library-dialog [name="lng"]', '150.644');
    await page.fill('#media-library-dialog [name="alt"]', '10');
    await page.selectOption('#media-library-dialog select', 'public-domain');
    await page.click('text=Save changes');
    await dialogHidden(page);
  });

  test('check custom fields', async ({ page }) => {
    await page.dblclick('[draggable]');
    expect(await countSelector(page, '#media-library-dialog [value="TEST_ALT"]')).toBe(1);
    expect(await countSelector(page, '#media-library-dialog [value="TEST_TAG"]')).toBe(1);
    expect(await countSelector(page, '#media-library-dialog [value="TEST_DESCRIPTION"]')).toBe(1);
    expect(await countSelector(page, '#media-library-dialog [value="1800"]')).toBe(1);
    expect(await countSelector(page, '#media-library-dialog [type="checkbox"]:checked')).toBe(1);
    expect(await countSelector(page, '#media-library-dialog [value="MY_ATTRIBUTION"]')).toBe(1);
    expect(await countSelector(page, '#media-library-dialog [value="-34.397"]')).toBe(1);
    expect(await countSelector(page, '#media-library-dialog [value="150.644"]')).toBe(1);
    expect(await countSelector(page, '#media-library-dialog [value="10"]')).toBe(1);
    expect(await page.$eval('#media-library-dialog select', (e: HTMLSelectElement) => e.selectedIndex)).toBe(2);

    await page.click('text=Cancel');
    await dialogHidden(page);
  });

  test('asset source', async ({ page }) => {
    await page.click('text=Desk');
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    await page.click('text=Image Asset');
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    await page.click('[href="/intent/create/type=imageAsset;template=imageAsset/"]');
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    await page.click('text=Select');
    await dialogVisible(page);
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    expect(await countSelector(page, '[draggable]')).toBe(4);
    await page.click('text=Cancel');
    await dialogHidden(page);

    await page.click('text=Select');
    await page.click('[draggable]');
    await page.click('#media-library-dialog :text("Select")');
    await dialogHidden(page);
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    expect(await countSelector(page, 'img')).toBeTruthy();

    await page.click('text=Remove');
    await page.click('text=Select');
    await page.dblclick('[draggable]');
    await dialogHidden(page);
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    expect(await countSelector(page, 'img')).toBeTruthy();

    await page.click('[aria-label="Open document actions"]');
    await page.click('text=Delete');
    await page.click('text=Delete now');
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    await page.isVisible('text=No documents of this type found');
  });

  test('delete from modal', async ({ page }) => {
    await page.dblclick('[draggable]');
    await dialogVisible(page);
    await page.click('#media-library-dialog :text("Delete asset")');
    expect(await page.textContent('#media-library-dialog')).toContain('Are you sure you want to delete');
    await page.click('text=Cancel');
    await page.click('#media-library-dialog :text("Delete asset")');
    expect(await page.textContent('#media-library-dialog')).toContain('Are you sure you want to delete');
    await page.click('text=Delete now');
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    const draggables = await page.$$('[draggable]');
    expect(draggables.length).toBe(IMAGES.length - 1);
  });

  test('delete files', async ({ page }) => {
    await page.click(`[draggable]`, { modifiers: ['Shift'] });
    await page.click('text=Delete Asset');
    expect(await page.textContent('#media-library-dialog')).toContain('Are you sure you want to delete this asset?');
    await page.click('text=Delete now');
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    await dialogHidden(page);

    await page.click(`[draggable]`, { modifiers: ['Shift'] });
    await page.click(`[draggable]:nth-of-type(2)`, { modifiers: ['Shift'] });
    await page.click('text=Delete Assets');
    expect(await page.textContent('#media-library-dialog')).toContain('Are you sure you want to delete 2 assets?');
    await page.click('text=Delete now');
    await page.waitForTimeout(INTERNET_SPEED_TIMEOUT);
    await dialogHidden(page);
    expect(await countSelector(page, '[draggable]')).toBe(0);

    expect(await page.isVisible('#noContent'));
  });
});
