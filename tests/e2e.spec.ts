import { Page, test, expect } from '@playwright/test';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

const BASE_URL = 'http://localhost:9515';

test.describe('Grocery Store Runner', () => {
  const gotoGamePage = async (page: Page) => {
    const errors: string[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', (error: Error) => {
      errors.push(String(error));
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.goto(`${BASE_URL}/index.html?nocache=1`, {
      waitUntil: 'load',
    });

    return { errors, consoleErrors };
  };

  const getCharacterPosition = async (character: ReturnType<Page['locator']>) =>
    character.evaluate((node) => {
      const style = window.getComputedStyle(node);
      return {
        left: parseFloat(style.left),
        top: parseFloat(style.top),
      };
    });

  const expectNearlyEqual = (actual: number, expected: number, tolerance = 8) => {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
  };

  const moveCharacterToX = async (page: Page, character: ReturnType<Page['locator']>, targetLeft: number) => {
    const tolerance = 12;

    for (let step = 0; step < 100; step++) {
      if (await page.locator('.round-overlay[data-phase="won"]').count()) {
        return;
      }
      const position = await getCharacterPosition(character);
      const delta = targetLeft - position.left;
      if (Math.abs(delta) <= tolerance) {
        return;
      }

      const key = delta > 0 ? 'ArrowRight' : 'ArrowLeft';
      await page.dispatchEvent('body', 'keydown', { key, bubbles: true });
      await page.waitForTimeout(45);
      await page.dispatchEvent('body', 'keyup', { key, bubbles: true });
      await page.waitForTimeout(45);
    }

    throw new Error(`Unable to move character to x=${targetLeft.toFixed(2)} after movement attempts.`);
  };

  const moveCharacterToRow = async (
    page: Page,
    character: ReturnType<Page['locator']>,
    targetRow: number,
    stopWhenCollectedSelector?: string
  ) => {
    const getRow = async () => {
      const rowAttr = await character.getAttribute('data-shelf-index');
      return Number(rowAttr ?? '0');
    };

    const wasCollected = async () =>
      stopWhenCollectedSelector
        ? ((await page.locator(stopWhenCollectedSelector).getAttribute('class')) ?? '').includes('is-collected')
        : false;

    for (let attempt = 0; attempt < 20; attempt++) {
      if (await wasCollected()) {
        return;
      }
      const row = await getRow();
      if (row === targetRow) {
        return;
      }

      const key = targetRow > row ? 'ArrowDown' : 'ArrowUp';
      await doVerticalJump(page, key, character);
      await page.waitForTimeout(30);
    }

    const finalRow = await getRow();
    if (finalRow !== targetRow && !(await wasCollected())) {
      throw new Error(`Unable to move character to shelf row ${targetRow}, currently ${finalRow}`);
    }
  };

  const resolveShoppingListEntries = async (page: Page) =>
    page.evaluate(() => {
      const shoppingItems = Array.from(document.querySelectorAll('.shopping-list-item.shopping-list-product'));
      return shoppingItems.map((item) => {
        const productId = item.getAttribute('data-product-id') || '';
        const productKind = item.getAttribute('data-product-kind') || '';
        const shelfIndexAttr = item.getAttribute('data-shelf-index') || '0';
        return {
          productId,
          productKind,
          shelfIndex: Number(shelfIndexAttr),
          isCollected: item.classList.contains('is-collected'),
        };
      });
    });

  const getShoppingListCounterValue = async (page: Page): Promise<{ collected: number; total: number }> =>
    page.evaluate(() => {
      const counter = document.querySelector('.shopping-list-counter');
      const text = (counter?.textContent ?? '').trim();
      const [collectedText, totalText] = text.split('/');
      return {
        collected: Number.isFinite(Number(collectedText)) ? Number(collectedText) : Number.NaN,
        total: Number.isFinite(Number(totalText)) ? Number(totalText) : Number.NaN,
      };
    });

  const moveCharacterToShoppingListProduct = async (
    page: Page,
    character: ReturnType<Page['locator']>,
    productKind: string,
    shelfIndex: number,
    productId?: string,
    allowOtherRow = false
  ) => {
    const productSelector = productId
      ? `.shelf-product[data-product-kind="${productKind}"][data-product-id="${productId}"]`
      : `.shelf-product[data-product-kind="${productKind}"]${allowOtherRow ? '' : `[data-shelf-index="${shelfIndex}"]`}`;

    const productLocator = page.locator(productSelector);
    const available = await productLocator.count();
    if (available === 0) {
      throw new Error(`Could not resolve product for kind ${productKind} on row ${shelfIndex}`);
    }

    const position = await productLocator.first().evaluate((node) => {
      const style = window.getComputedStyle(node);
      return {
        left: parseFloat(style.left) + parseFloat(style.width) / 2,
      };
    });

    const listSelector = productId
      ? `.shopping-list-item.shopping-list-product[data-product-id="${productId}"]`
      : undefined;
    await moveCharacterToRow(page, character, shelfIndex, listSelector);
    if (listSelector && ((await page.locator(listSelector).getAttribute('class')) ?? '').includes('is-collected')) {
      return;
    }

    const characterRect = await character.boundingBox();
    const characterWidth = characterRect?.width ?? 40;
    await moveCharacterToX(page, character, position.left - characterWidth / 2);
  };

  const doShoppingListCollection = async (page: Page, selector: string) => {
    await expect(page.locator(selector)).toHaveClass(/is-collected/, { timeout: 8000 });
  };

  const doVerticalJump = async (page: Page, key: 'ArrowUp' | 'ArrowDown', character: ReturnType<Page['locator']>) => {
    await page.dispatchEvent('body', 'keydown', { key, bubbles: true });
    await page.waitForTimeout(70);
    await page.dispatchEvent('body', 'keyup', { key, bubbles: true });
    await page.waitForTimeout(280);
    return await getCharacterPosition(character);
  };

  const dispatchSwipe = async (
    page: Page,
    direction: SwipeDirection,
    amount: number
  ) => {
    const container = page.locator('#game-container');
    const bounds = await container.boundingBox();
    if (!bounds) {
      throw new Error('Cannot run swipe test: game container not found');
    }

    const startX = bounds.x + bounds.width / 2;
    const startY = bounds.y + bounds.height / 2;
    const endX = startX + (direction === 'left' ? -amount : direction === 'right' ? amount : 0);
    const endY = startY + (direction === 'up' ? -amount : direction === 'down' ? amount : 0);

    await page.evaluate(
      ({ selector, startX, startY, endX, endY }) => {
        const container = document.querySelector(selector) as HTMLElement;
        if (!container) {
          return;
        }

        const startTouch = new Touch({
          identifier: 1,
          target: container,
          clientX: startX,
          clientY: startY,
          screenX: startX,
          screenY: startY,
          pageX: startX,
          pageY: startY,
          radiusX: 2,
          radiusY: 2,
          force: 1,
          rotationAngle: 0,
        });

        const moveTouch = new Touch({
          identifier: 1,
          target: container,
          clientX: endX,
          clientY: endY,
          screenX: endX,
          screenY: endY,
          pageX: endX,
          pageY: endY,
          radiusX: 2,
          radiusY: 2,
          force: 1,
          rotationAngle: 0,
        });

        const touchStartEvent = new TouchEvent('touchstart', {
          touches: [startTouch],
          targetTouches: [startTouch],
          changedTouches: [startTouch],
          bubbles: true,
          cancelable: true,
        });

        const touchMoveEvent = new TouchEvent('touchmove', {
          touches: [moveTouch],
          targetTouches: [moveTouch],
          changedTouches: [moveTouch],
          bubbles: true,
          cancelable: true,
        });

        const touchEndEvent = new TouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [moveTouch],
          bubbles: true,
          cancelable: true,
        });

        container.dispatchEvent(touchStartEvent);
        container.dispatchEvent(touchMoveEvent);
        container.dispatchEvent(touchEndEvent);
      },
      {
        selector: '#game-container',
        startX,
        startY,
        endX,
        endY,
      }
    );
  };

  test('loads page with module entry and game container', async ({ page }) => {
    const { errors } = await gotoGamePage(page);

    await expect(page).toHaveTitle('Grocery Rush');
    await expect(page.locator('#game-container')).toBeVisible();
    const scriptSources = await page.locator('script[type="module"]').evaluateAll((scripts) =>
      scripts.map((script) => script.getAttribute('src')).filter((src): src is string => Boolean(src))
    );
    expect(scriptSources.some((src) => /(\/assets\/main-[A-Za-z0-9_-]+\.js$|\/src\/main\.ts(?:\?.*)?$)/.test(src))).toBe(true);

    expect(errors).toEqual([]);
  });

  test('keeps the free Screen-Day Reset Map within reach during play', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    const mapLink = page.locator('.play-reset-map-link');

    await expect(mapLink).toBeVisible();
    await expect(mapLink.locator('.reset-map-prompt')).toHaveText('You left work. Now leave the screen.');
    await expect(mapLink).not.toContainText(/free reset map/i);
    await expect(mapLink.locator('strong')).toHaveCount(0);
    await expect(mapLink).toHaveAttribute('href', 'https://www.prosperprivately.com/moveoncue?utm_source=grocery-rush');
    await page.locator('.start-game-button').click();
    await expect(mapLink).toBeVisible();

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('keeps the rotating reset-map line readable during phone play', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();

    const mapLink = page.locator('.play-reset-map-link');
    const mapPrompt = mapLink.locator('.reset-map-prompt');
    await expect(mapLink).toBeVisible();
    await expect(mapPrompt).toBeVisible();
    await expect(mapPrompt).toHaveText('You left work. Now leave the screen.');
    const linkBox = await mapLink.boundingBox();
    expect(linkBox).not.toBeNull();
    if (linkBox) {
      expect(linkBox.x).toBeGreaterThanOrEqual(0);
      expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(360);
    }

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });


  test('renders shelf products as separate scene layers', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);

    const staticShelfProducts = page.locator('.shelf-products .shelf-product:not(.collecting-product)');
    const products = page.locator('.shelf-product');
    const emptySlots = page.locator('.shelf-empty-slot');
    const shell = page.locator('.shelf-background');
    const productsLayer = page.locator('.shelf-products');
    const slotsLayer = page.locator('.shelf-empty-slots');
    const shoppingList = page.locator('.shopping-list');
    const shoppingItems = page.locator('.shopping-list-product');

    await expect(shell).toBeVisible();
    await expect(productsLayer).toBeVisible();
    await expect(slotsLayer).toBeVisible();
    await expect(shoppingList).toBeVisible();

    const productsCount = await staticShelfProducts.count();
    expect(productsCount).toBeGreaterThanOrEqual(19);
    await expect(productsCount).toBeLessThanOrEqual(20);
    await expect(emptySlots).toHaveCount(20);
    await expect(shoppingItems).toHaveCount(5);

    const productClass = await products.first().getAttribute('class');
    expect(productClass).toContain('shelf-product-');

    const productLayout = await staticShelfProducts.evaluateAll((nodes: Element[]) =>
      nodes
        .map((node) => {
          const style = getComputedStyle(node);
          return {
            position: style.position,
            left: parseFloat(style.left),
            top: parseFloat(style.top),
          };
        })
    );

    expect(productLayout).toHaveLength(productsCount);
    expect(productLayout.every((item: { position: string }) => item.position === 'absolute')).toBe(true);

    const leftValues = productLayout.map((item: { left: number }) => item.left);
    const topValues = productLayout.map((item: { top: number }) => item.top);
    expect(leftValues.every((value: number) => Number.isFinite(value))).toBe(true);
    expect(topValues.every((value: number) => Number.isFinite(value))).toBe(true);

    const leftSpread = Math.max(...leftValues) - Math.min(...leftValues);
    const topSpread = Math.max(...topValues) - Math.min(...topValues);
    expect(leftSpread).toBeGreaterThan(120);
    expect(topSpread).toBeGreaterThan(150);

    const distinctLeft = new Set(leftValues.map((value: number) => Math.round(value)));
    expect(distinctLeft.size).toBeGreaterThan(5);

    const childOrder = await page.evaluate(() =>
      Array.from(document.getElementById('game-container')?.children ?? []).map((el) => el.className)
    );
    expect(childOrder).toEqual([
      'shelf-background',
      'shelf-empty-slots',
      'shelf-products',
      'bonus-coupon',
      'character',
    ]);
    await expect(page.locator('.timer-card > .shopping-list')).toHaveCount(1);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('seats every product on its shelf surface', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    const productSeats = await page.locator('.shelf-product').evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        const containerRect = document.querySelector('#game-container')?.getBoundingClientRect();
        const scale = (containerRect?.width ?? 600) / 600;
        return {
          bottom: (rect.bottom - (containerRect?.top ?? 0)) / scale,
          shelfY: Number(node.getAttribute('data-shelf-y')),
        };
      })
    );

    expect(productSeats).toHaveLength(20);
    for (const seat of productSeats) {
      expect(Number.isFinite(seat.shelfY)).toBe(true);
      expectNearlyEqual(seat.bottom, seat.shelfY, 2);
    }
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('spreads shelf products across the full playable aisle', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    const container = page.locator('#game-container');
    const products = page.locator('.shelf-products .shelf-product');

    const containerBox = await container.boundingBox();
    const productBoxes = await products.evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { left: box.left, right: box.right };
      })
    );

    expect(containerBox).not.toBeNull();
    expect(productBoxes).toHaveLength(20);
    if (containerBox) {
      const relativeLefts = productBoxes.map((box) => box.left - containerBox.x);
      const relativeRights = productBoxes.map((box) => box.right - containerBox.x);
      expect(Math.min(...relativeLefts)).toBeLessThan(90);
      expect(Math.max(...relativeRights)).toBeGreaterThan(500);
    }

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('presents a clear round briefing and starts the clock on command', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    const briefing = page.locator('.round-overlay[data-phase="ready"]');
    const timer = page.locator('.round-timer');

    await expect(briefing).toBeVisible();
    await expect(briefing.locator('.game-title')).toContainText('Grocery');
    await expect(briefing).toContainText(/order 1/i);
    await expect(briefing.locator('.customer-card')).toBeVisible();
    await expect(briefing.locator('.customer-name')).not.toBeEmpty();
    await expect(briefing).toContainText(/arrow|WASD/i);
    await expect(briefing.locator('.round-story')).toContainText(/return.*checkout/i);
    await expect(briefing.locator('.start-game-button')).toBeVisible();

    const before = (await timer.textContent())?.trim();
    await page.waitForTimeout(250);
    await expect(timer).toHaveText(before || '');

    await page.keyboard.press('Space');
    await expect(briefing).toBeHidden();
    await expect(page.locator('#game-container')).toHaveAttribute('data-music-pulse', /active/);
    await page.waitForTimeout(1100);
    const after = (await timer.textContent())?.trim();
    expect(after).not.toBe(before);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('escalates later orders and preserves a best score', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('grocery-rush-order', '2');
      window.localStorage.setItem('grocery-rush-best', '8400');
      window.localStorage.setItem('grocery-rush-best-order-2', '9100');
      window.localStorage.setItem('grocery-rush-best-order-1', '12300');
      window.localStorage.setItem('grocery-rush-shift-score', '12300');
      window.localStorage.setItem('grocery-rush-best-shift', '54100');
    });
    const { errors, consoleErrors } = await gotoGamePage(page);

    const briefing = page.locator('.round-overlay[data-phase="ready"]');
    await expect(briefing).toContainText(/order 2/i);
    await expect(briefing).toContainText(/order 2 · best 9100/i);
    await expect(briefing.locator('.shift-total')).toContainText(/12,300/);
    await expect(briefing.locator('.shift-record')).toContainText(/54,100/);
    await expect(page.locator('.shopping-list-product')).toHaveCount(6);
    await expect(page.locator('.round-timer')).toHaveText('0:42');
    await expect(page.locator('.combo-value')).toHaveText('ROUTE READY');
    await expect(page.locator('#game-container')).toHaveAttribute('data-combo-window-ms', '3800');

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('caps the campaign at six customers and marks the final order', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('grocery-rush-order', '99');
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    const briefing = page.locator('.round-overlay[data-phase="ready"]');

    await expect(briefing).toContainText(/order 6/i);
    await expect(briefing.locator('.shift-progress')).toContainText(/final order/i);
    await expect(page.locator('.shopping-list-product')).toHaveCount(8);
    await expect(page.locator('.round-timer')).toHaveText('0:30');

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('shows a distinct portrait for each of the six customers', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    const expectedCustomers = [
      { name: 'Nana Bea', file: 'customer-01-nana-bea.png' },
      { name: 'Coach Rivera', file: 'customer-02-coach-rivera.png' },
      { name: 'Mina & Mochi', file: 'customer-03-mina-and-mochi.png' },
      { name: 'Night-Shift Niko', file: 'customer-04-night-shift-niko.png' },
      { name: 'Auntie June', file: 'customer-05-auntie-june.png' },
      { name: 'Sam the Baker', file: 'customer-06-sam-the-baker.png' },
    ];
    const avatarUrls = new Set<string>();

    for (let index = 0; index < expectedCustomers.length; index++) {
      const expectedCustomer = expectedCustomers[index];
      await page.evaluate((order) => localStorage.setItem('grocery-rush-order', String(order)), index + 1);
      await page.reload({ waitUntil: 'load' });

      const briefing = page.locator('.round-overlay[data-phase="ready"]');
      const avatar = briefing.locator('.customer-avatar');
      await expect(briefing.locator('.customer-name')).toHaveText(expectedCustomer.name);
      await expect(avatar).toBeVisible();
      await expect(avatar).toHaveAttribute('alt', `${expectedCustomer.name} avatar`);
      const avatarUrl = await avatar.evaluate((image: HTMLImageElement) => image.currentSrc);
      expect(avatarUrl).toContain(`/customer-avatars/${expectedCustomer.file}`);
      const avatarResponse = await page.request.get(avatarUrl);
      expect(avatarResponse.ok()).toBe(true);
      expect(avatarResponse.headers()['content-type']).toContain('image/png');
      avatarUrls.add(avatarUrl);
    }

    expect(avatarUrls.size).toBe(6);
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('celebrates all six delivered orders and explains the next shift', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0;
      if (window.sessionStorage.getItem('grocery-rush-finale-seeded')) {
        return;
      }
      window.sessionStorage.setItem('grocery-rush-finale-seeded', '1');
      window.localStorage.setItem('grocery-rush-order', '6');
      window.localStorage.setItem('grocery-rush-shift-score', '50000');
      window.localStorage.setItem('grocery-rush-credited-order', '5');
      window.localStorage.setItem('grocery-rush-best-shift', '48000');
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    const character = page.locator('.character').first();
    await page.locator('.start-game-button').click();

    for (const entry of await resolveShoppingListEntries(page)) {
      const listSelector = `.shopping-list-item.shopping-list-product[data-product-id="${entry.productId}"]`;
      if (((await page.locator(listSelector).getAttribute('class')) ?? '').includes('is-collected')) {
        continue;
      }
      await moveCharacterToShoppingListProduct(
        page,
        character,
        entry.productKind,
        entry.shelfIndex,
        entry.productId
      );
      await doShoppingListCollection(page, listSelector);
    }

    await moveCharacterToRow(page, character, 5);
    await moveCharacterToX(page, character, 20);

    const finale = page.locator('.round-overlay[data-phase="won"]');
    await expect(finale).toBeVisible();
    await expect(finale.locator('.eyebrow')).toHaveText('SHIFT COMPLETE');
    await expect(finale.locator('.round-title')).toContainText(/all six orders delivered/i);
    await expect(finale.locator('.campaign-finale')).toContainText(/6\/6 orders delivered/i);
    await expect(finale.locator('.campaign-final-score')).toContainText(/final shift/i);
    await expect(finale.locator('.campaign-best-score')).toContainText(/best shift/i);
    await expect(finale.locator('.campaign-restart-note')).toContainText(/order 1.*best scores/i);
    await expect(finale.locator('.restart-game-button')).toContainText(/start another 6-order shift/i);
    const completedBestShift = Number(await page.evaluate(() => localStorage.getItem('grocery-rush-best-shift')));
    expect(completedBestShift).toBeGreaterThan(50000);

    await finale.locator('.restart-game-button').click();
    const nextBriefing = page.locator('.round-overlay[data-phase="ready"]');
    await expect(nextBriefing).toContainText(/order 1/i);
    await expect(nextBriefing.locator('.shift-total')).toContainText(/0/);
    await expect(nextBriefing.locator('.shift-record')).toContainText(completedBestShift.toLocaleString('en-US'));
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('builds orders from balanced stock and distinct product types', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0;
      window.localStorage.setItem('grocery-rush-order', '4');
    });
    const { errors, consoleErrors } = await gotoGamePage(page);

    const stockKinds = await page.locator('.shelf-products .shelf-product').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-product-kind'))
    );
    const orderKinds = await page.locator('.shopping-list-product').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-product-kind'))
    );

    expect(stockKinds).toHaveLength(20);
    expect(new Set(stockKinds).size).toBe(10);
    expect(orderKinds).toHaveLength(8);
    expect(new Set(orderKinds).size).toBe(8);
    expect(orderKinds.every((kind) => stockKinds.includes(kind))).toBe(true);

    const wantedKinds = await page.locator('.shelf-product.is-wanted').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-product-kind'))
    );
    expect(new Set(wantedKinds)).toEqual(new Set(orderKinds));
    expect(wantedKinds).toHaveLength(orderKinds.length * 2);
    await expect(page.locator('.shelf-product.is-route-target')).toHaveCount(1);
    const routeTargetKind = await page.locator('.shelf-product.is-route-target').getAttribute('data-product-kind');
    expect(orderKinds).toContain(routeTargetKind);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('keeps the full briefing and start button accessible on a portrait phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const { errors, consoleErrors } = await gotoGamePage(page);
    const overlay = page.locator('.round-overlay[data-phase="ready"]');
    const panel = overlay.locator('.round-panel');
    const startButton = overlay.locator('.start-game-button');

    await expect(startButton).toBeVisible();
    const panelRect = await panel.boundingBox();
    const buttonRect = await startButton.boundingBox();
    expect(panelRect).not.toBeNull();
    expect(buttonRect).not.toBeNull();
    if (panelRect && buttonRect) {
      expect(panelRect.y).toBeGreaterThanOrEqual(0);
      expect(panelRect.y + panelRect.height).toBeLessThanOrEqual(640);
      expect(buttonRect.y + buttonRect.height).toBeLessThanOrEqual(640);
    }

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('keeps wanted shelf products clear of the HUD on a portrait phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();

    const phoneLayout = await page.evaluate(() => {
      const hudRects = Array.from(document.querySelectorAll('.hud-card')).map((node) => node.getBoundingClientRect());
      const stageRect = document.querySelector('.game-stage')?.getBoundingClientRect();
      const gameRect = document.querySelector('#game-container')?.getBoundingClientRect();
      const coveredWantedProducts = Array.from(document.querySelectorAll('.shelf-product.is-wanted'))
        .filter((node) => {
          const productRect = node.getBoundingClientRect();
          return hudRects.some((hudRect) =>
            productRect.left < hudRect.right &&
            productRect.right > hudRect.left &&
            productRect.top < hudRect.bottom &&
            productRect.bottom > hudRect.top
          );
        })
        .map((node) => node.getAttribute('data-product-id'));
      return {
        coveredWantedProducts,
        gameBottom: gameRect?.bottom ?? Number.POSITIVE_INFINITY,
        stageBottom: stageRect?.bottom ?? Number.NEGATIVE_INFINITY,
      };
    });

    expect(phoneLayout.coveredWantedProducts).toEqual([]);
    expect(phoneLayout.gameBottom).toBeLessThanOrEqual(phoneLayout.stageBottom);
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('pauses the closing clock and persists the sound setting', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();
    const timer = page.locator('.round-timer');
    const pauseButton = page.locator('#pause-game-button');
    const soundButton = page.locator('#sound-game-button');

    await pauseButton.click();
    await expect(page.locator('.round-overlay[data-phase="paused"]')).toBeVisible();
    const pausedAt = await timer.textContent();
    await page.waitForTimeout(1100);
    await expect(timer).toHaveText(pausedAt || '');
    await page.keyboard.press('Space');
    await expect(page.locator('.round-overlay[data-phase="paused"]')).toBeHidden();
    await page.waitForTimeout(1100);
    await expect(timer).not.toHaveText(pausedAt || '');

    await soundButton.click();
    await expect(soundButton).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => localStorage.getItem('grocery-rush-muted'))).toBe('1');
    await expect(page.locator('#game-container')).toHaveAttribute('data-music-pulse', 'stopped');

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('provides a rechargeable shelf boost on keyboard and touch', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();
    const boostButton = page.locator('.boost-button');
    const character = page.locator('.character');

    await expect(boostButton).toBeVisible();
    await expect(boostButton).toBeEnabled();
    await boostButton.click();
    await expect(character).toHaveClass(/is-boosting/);
    await expect(boostButton).toBeDisabled();
    await expect(boostButton).toContainText(/recharging/i);
    await page.waitForTimeout(700);
    await expect(character).not.toHaveClass(/is-boosting/);
    await expect(boostButton).toBeEnabled({ timeout: 4000 });

    await page.keyboard.press('Space');
    await expect(character).toHaveClass(/is-boosting/);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('awards an optional closing-time coupon bonus', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();
    const character = page.locator('.character');
    const coupon = page.locator('.bonus-coupon');

    await expect(coupon).toBeVisible();
    const couponPlacement = await coupon.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        shelfIndex: Number(node.getAttribute('data-shelf-index')),
        left: parseFloat(style.left),
        width: parseFloat(style.width),
      };
    });
    expect(couponPlacement.shelfIndex).toBeGreaterThanOrEqual(1);
    expect(couponPlacement.shelfIndex).toBeLessThanOrEqual(4);
    expect(couponPlacement.left).toBeGreaterThanOrEqual(515);
    expect(couponPlacement.width).toBeGreaterThanOrEqual(52);
    const target = await coupon.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        shelfIndex: Number(node.getAttribute('data-shelf-index')),
        left: parseFloat(style.left) + parseFloat(style.width) / 2,
      };
    });
    await moveCharacterToRow(page, character, target.shelfIndex);
    const characterWidth = await character.evaluate((node) => parseFloat(getComputedStyle(node).width));
    await moveCharacterToX(page, character, couponPlacement.left - characterWidth - 15);
    await expect(coupon).not.toHaveClass(/is-collected/);
    const timerBeforeCoupon = await page.locator('.round-timer').textContent();
    const secondsBeforeCoupon = Number(timerBeforeCoupon?.split(':')[1]);
    await moveCharacterToX(page, character, target.left - characterWidth / 2);

    await expect(coupon).toHaveClass(/is-collected/);
    const score = Number(await page.locator('.score-value').textContent());
    expect(score).toBeGreaterThanOrEqual(2_500);
    const timerAfterCoupon = await page.locator('.round-timer').textContent();
    const secondsAfterCoupon = Number(timerAfterCoupon?.split(':')[1]);
    expect(secondsAfterCoupon).toBeGreaterThanOrEqual(secondsBeforeCoupon + 2);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('adds avoidable shelf spills to later orders', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('grocery-rush-order', '5');
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();
    const hazards = page.locator('.aisle-hazard');
    const character = page.locator('.character');

    await expect(hazards).toHaveCount(2);
    const overlapsProduct = await hazards.evaluateAll((hazardNodes) => {
      const products = Array.from(document.querySelectorAll('.shelf-product'));
      return hazardNodes.some((hazard) => {
        const hazardStyle = getComputedStyle(hazard);
        const hazardLeft = parseFloat(hazardStyle.left);
        const hazardRight = hazardLeft + parseFloat(hazardStyle.width);
        const hazardRow = hazard.getAttribute('data-shelf-index');
        return products.some((product) => {
          if (product.getAttribute('data-shelf-index') !== hazardRow) return false;
          const productStyle = getComputedStyle(product);
          const productLeft = parseFloat(productStyle.left);
          const productRight = productLeft + parseFloat(productStyle.width);
          return hazardLeft < productRight && hazardRight > productLeft;
        });
      });
    });
    expect(overlapsProduct).toBe(false);
    await expect(page.locator('#game-container')).toHaveAttribute('data-hazard-hits', '0');
    const firstHazard = hazards.first();
    const target = await firstHazard.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        shelfIndex: Number(node.getAttribute('data-shelf-index')),
        left: parseFloat(style.left) + parseFloat(style.width) / 2,
      };
    });

    await moveCharacterToRow(page, character, 0);
    const characterWidth = await character.evaluate((node) => parseFloat(getComputedStyle(node).width));
    await moveCharacterToX(page, character, target.left - characterWidth / 2);
    await moveCharacterToRow(page, character, target.shelfIndex);

    await expect(firstHazard).toHaveClass(/is-cleared/);
    await expect(page.locator('#game-container')).toHaveAttribute('data-hazard-hits', '1');
    await expect(page.locator('.hazard-feedback')).toContainText(/spill|-2/i);
    await expect(page.locator('.combo-value')).toHaveText('ROUTE READY');

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('telegraphs moving stock-cart traffic on later orders', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('grocery-rush-order', '2');
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();
    const cart = page.locator('.stock-cart');

    await expect(cart).toBeVisible();
    await expect(cart).toHaveAttribute('data-state', /warning|crossing/);
    await expect(cart.locator('.stock-cart-warning')).toContainText(/cart/i);
    await expect.poll(async () => cart.getAttribute('data-state'), { timeout: 4000 }).toBe('crossing');
    const firstLeft = parseFloat(await cart.evaluate((node) => getComputedStyle(node).left));
    await page.waitForTimeout(350);
    const secondLeft = parseFloat(await cart.evaluate((node) => getComputedStyle(node).left));
    expect(secondLeft).not.toBe(firstLeft);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('applies only one stumble per stock-cart crossing', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('grocery-rush-order', '2');
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();
    const character = page.locator('.character');
    const cart = page.locator('.stock-cart');
    const cartRow = Number(await cart.getAttribute('data-shelf-index'));

    await moveCharacterToRow(page, character, cartRow);
    await moveCharacterToX(page, character, 70);
    await expect.poll(async () => page.locator('#game-container').getAttribute('data-cart-hits'), { timeout: 4000 }).toBe('1');
    await page.waitForTimeout(900);
    await expect(page.locator('#game-container')).toHaveAttribute('data-cart-hits', '1');

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('lets an active boost slip safely past stock-cart traffic', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('grocery-rush-order', '2');
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();
    const character = page.locator('.character');
    const cart = page.locator('.stock-cart');
    const cartRow = Number(await cart.getAttribute('data-shelf-index'));

    await moveCharacterToRow(page, character, cartRow);
    await moveCharacterToX(page, character, 100);
    await expect.poll(async () => cart.getAttribute('data-state'), { timeout: 4000 }).toBe('crossing');
    await page.waitForFunction(() => {
      const cartNode = document.querySelector<HTMLElement>('.stock-cart');
      return cartNode ? parseFloat(cartNode.style.left) >= 20 : false;
    });
    await expect(page.locator('#game-container')).toHaveAttribute('data-cart-hits', '0');
    await page.keyboard.press('Space');
    await expect(character).toHaveClass(/is-boosting/);
    await page.waitForFunction(() => {
      const cartNode = document.querySelector<HTMLElement>('.stock-cart');
      return cartNode?.dataset.state === 'cooldown';
    });
    await expect(page.locator('#game-container')).toHaveAttribute('data-cart-hits', '0');
    await expect(character).not.toHaveClass(/is-stumbling/);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('renders a five-product shopping list at the top of the page', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);

    const shoppingList = page.locator('.shopping-list').first();
    const shoppingItems = page.locator('.shopping-list-product');
    await expect(shoppingList).toBeVisible();
    await expect(shoppingItems).toHaveCount(5);

    const computedStyle = await shoppingList.evaluate((element) => ({
      top: window.getComputedStyle(element).top,
      transform: window.getComputedStyle(element).transform,
    }));
    expect(computedStyle.top).toBe('auto');
    expect(computedStyle.transform).toBe('none');
    const timerCardRect = await page.locator('.timer-card').boundingBox();
    const listRect = await shoppingList.boundingBox();
    if (timerCardRect && listRect) {
      expect(listRect.x).toBeGreaterThan(timerCardRect.x);
      expect(listRect.x + listRect.width).toBeLessThanOrEqual(timerCardRect.x + timerCardRect.width + 1);
    }

    const listProductClasses = await shoppingItems.evaluateAll((nodes) =>

      nodes
        .map((node) => [...node.classList].find((className) => className.startsWith('shelf-product-product-'))
        )
        .filter((name): name is string => name !== undefined)
    );
    const shelfProductClasses = await page.locator('.shelf-product').evaluateAll((nodes) => {
      const classNames = nodes.map((node) =>
        [...node.classList].find((className) => className.startsWith('shelf-product-product-'))
      );

      return classNames.filter((name): name is string => name !== undefined);
    });
    const shelfProductClassSet = new Set(shelfProductClasses);

    expect(listProductClasses.length).toBe(5);
    for (const productClass of listProductClasses) {
      expect(productClass).toMatch(/^shelf-product-product-/);
      expect(shelfProductClassSet.has(productClass)).toBe(true);
    }

    const itemProductIds = await shoppingItems.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-product-id'))
    );
    expect(itemProductIds.every((value) => typeof value === 'string' && value.length > 0)).toBe(true);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('starts from a consistent position each load', async ({ page }) => {
    const startPositions: number[] = [];
    const startRows: number[] = [];
    const seenWidths = new Set<number>();

    for (let attempt = 0; attempt < 4; attempt++) {
      const { errors, consoleErrors } = await gotoGamePage(page);
      await page.waitForTimeout(120);

      const state = await page.evaluate(() => {
        const character = document.querySelector('.character');
        const container = document.querySelector('#game-container');

        if (!character || !container) {
          return {
            characterLeft: Number.NaN,
            shelfIndex: Number.NaN,
            gameWidth: 0,
            collectedCount: -1,
          };
        }

        const collectedCount = document.querySelectorAll(
          '.shopping-list-item.shopping-list-product.is-collected'
        ).length;

        return {
          characterLeft: Math.round(character.getBoundingClientRect().left),
          shelfIndex: Number(character.getAttribute('data-shelf-index')),
          gameWidth: Math.round(container.getBoundingClientRect().width),
          collectedCount,
        };
      });

      expect(Number.isNaN(state.characterLeft)).toBe(false);
      expect(state.collectedCount).toBe(0);
      expect(state.gameWidth).toBeGreaterThan(0);

      startPositions.push(state.characterLeft);
      startRows.push(state.shelfIndex);
      seenWidths.add(state.gameWidth);
      expect(errors).toEqual([]);
      expect(consoleErrors).toEqual([]);

    }

    expect(new Set(startPositions).size).toBe(1);
    expect(new Set(startRows)).toEqual(new Set([5]));
    expect(seenWidths.size).toBe(1);
    expect(startPositions[0]).toBeLessThanOrEqual(Math.floor((Array.from(seenWidths)[0] * 0.65)));
  });

  test('blocks the floor edges but drops Pip from either upper shelf edge', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();
    const character = page.locator('.character');
    const container = page.locator('#game-container');

    await expect(character).toHaveAttribute('data-shelf-index', '5');
    const floorTop = (await getCharacterPosition(character)).top;
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(220);
    await page.keyboard.up('ArrowLeft');
    expect((await getCharacterPosition(character)).left).toBeGreaterThanOrEqual(0);
    await expect(container).toHaveAttribute('data-falls', '0');

    await moveCharacterToX(page, character, 70);
    await doVerticalJump(page, 'ArrowUp', character);
    await expect(character).toHaveAttribute('data-shelf-index', '4');
    const upperShelfTop = (await getCharacterPosition(character)).top;
    await page.keyboard.down('ArrowLeft');
    await expect(character).toHaveClass(/is-falling/, { timeout: 1000 });
    await page.keyboard.up('ArrowLeft');
    const fallingCharacterWidth = await character.evaluate((node) => parseFloat(getComputedStyle(node).width));
    const leftFallOrigin = Number(await character.getAttribute('data-fall-origin-x')) * 40;
    expect(leftFallOrigin + fallingCharacterWidth).toBeLessThanOrEqual(60);
    const firstFallFrame = await character.evaluate((node) => ({
      image: getComputedStyle(node).backgroundImage,
      position: getComputedStyle(node).backgroundPosition,
    }));
    expect(firstFallFrame.image).toContain('option-a-fall-sprite-sheet.png');
    const tumbleScaleSamples = await character.evaluate(async (node) => {
      const samples: number[] = [];
      for (let frame = 0; frame < 10; frame++) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform);
        samples.push(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c));
      }
      return samples;
    });
    expect(Math.min(...tumbleScaleSamples)).toBeGreaterThan(0.5);
    await page.waitForTimeout(20);
    const secondFallPosition = await character.evaluate((node) => getComputedStyle(node).backgroundPosition);
    expect(secondFallPosition).not.toBe(firstFallFrame.position);
    await page.waitForTimeout(100);
    const fallingPosition = await getCharacterPosition(character);
    const fallingTop = fallingPosition.top;
    expect(fallingPosition.left).toBeGreaterThan(leftFallOrigin);
    expect(fallingTop).toBeGreaterThan(upperShelfTop + 5);
    expect(fallingTop).toBeLessThan(floorTop - 5);
    await expect(character).not.toHaveClass(/is-falling/, { timeout: 1200 });
    await expect(character).toHaveAttribute('data-shelf-index', '5');
    await expect(container).toHaveAttribute('data-falls', '1');

    await doVerticalJump(page, 'ArrowUp', character);
    await moveCharacterToX(page, character, 540);
    await page.keyboard.down('ArrowRight');
    await expect(character).toHaveClass(/is-falling/, { timeout: 1000 });
    await page.keyboard.up('ArrowRight');
    const rightFallOrigin = Number(await character.getAttribute('data-fall-origin-x')) * 40;
    expect(rightFallOrigin).toBeGreaterThanOrEqual(550);
    await expect(character).not.toHaveClass(/is-falling/, { timeout: 1200 });
    await expect(character).toHaveAttribute('data-shelf-index', '5');
    await expect(container).toHaveAttribute('data-falls', '2');

    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(220);
    await page.keyboard.up('ArrowRight');
    expect((await getCharacterPosition(character)).left).toBeLessThanOrEqual(560);
    await expect(container).toHaveAttribute('data-falls', '2');
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });


  test('shows a dynamic collected-items counter in the top-right area', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);

    const counter = page.locator('.shopping-list-counter').first();
    await expect(counter).toBeVisible();
    await expect(counter).toHaveText('0/5');

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('increments the counter when shopping-list items are collected', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    const character = page.locator('.character').first();

    const firstValue = await getShoppingListCounterValue(page);
    expect(firstValue.total).toBe(5);
    expect(firstValue.collected).toBe(0);

    const entries = await resolveShoppingListEntries(page);
    const firstEntry = entries.find((entry) => !entry.isCollected);
    if (!firstEntry) {
      test.skip(true, 'No collectable shopping list entry available on this run');
      return;
    }

    const firstSelector = `.shopping-list-item.shopping-list-product[data-product-id="${firstEntry.productId}"]`;
    await moveCharacterToShoppingListProduct(
      page,
      character,
      firstEntry.productKind,
      firstEntry.shelfIndex,
      firstEntry.productId
    );
    await doShoppingListCollection(page, firstSelector);
    await expect(page.locator(`.shelf-product[data-product-kind="${firstEntry.productKind}"]`)).not.toHaveClass(/is-wanted/);
    await expect(page.locator('.shelf-product.is-route-target')).toHaveCount(1);
    await expect(page.locator('.shelf-product.is-route-target')).not.toHaveAttribute('data-product-kind', firstEntry.productKind);

    const comboMeter = page.locator('.combo-meter');
    await expect(comboMeter).toBeVisible();
    const freshComboScale = await page.locator('.combo-meter-fill').evaluate((node) => {
      const transform = getComputedStyle(node).transform;
      return transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a;
    });
    expect(freshComboScale).toBeGreaterThan(0.25);
    await page.waitForTimeout(650);
    const drainingComboScale = await page.locator('.combo-meter-fill').evaluate((node) => {
      const transform = getComputedStyle(node).transform;
      return transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a;
    });
    expect(drainingComboScale).toBeLessThan(freshComboScale);
    await page.waitForTimeout(3_600);
    await expect(page.locator('.combo-value')).toHaveText('ROUTE READY');

    const afterFirst = await getShoppingListCounterValue(page);
    expect(afterFirst.collected).toBeGreaterThan(firstValue.collected);

    const secondEntries = await resolveShoppingListEntries(page);
    const secondEntry = secondEntries.find((entry) => !entry.isCollected);
    if (secondEntry) {
      const secondSelector = `.shopping-list-item.shopping-list-product[data-product-id="${secondEntry.productId}"]`;
      await moveCharacterToShoppingListProduct(
        page,
        character,
        secondEntry.productKind,
        secondEntry.shelfIndex,
        secondEntry.productId
      );
      await doShoppingListCollection(page, secondSelector);

      const afterSecond = await getShoppingListCounterValue(page);
      expect(afterSecond.collected).toBeGreaterThan(afterFirst.collected);
    }

    expect(await getShoppingListCounterValue(page)).toEqual(
      expect.objectContaining({
        collected: expect.any(Number),
        total: firstValue.total,
      })
    );

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('collects shopping-list items when reached and shows check marks', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0;
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async (payload: ShareData) => {
          (window as Window & { __groceryRushShare?: ShareData }).__groceryRushShare = payload;
        },
      });
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    const character = page.locator('.character').first();
    const shoppingEntries = await resolveShoppingListEntries(page);

    expect(shoppingEntries.length).toBe(5);

    for (let i = 0; i < shoppingEntries.length; i++) {
      const { productId, productKind, shelfIndex } = shoppingEntries[i] as {
        productId: string;
        productKind: string;
        shelfIndex: number;
      };
      const listSelector = `.shopping-list-item.shopping-list-product[data-product-id="${productId}"]`;
      const kindSelector = `.shelf-products .shelf-product[data-product-kind="${productKind}"]`;
      const listItem = page.locator(listSelector);
      const initialClass = await listItem.getAttribute('class');
      if (initialClass?.includes('is-collected')) {
        continue;
      }

      const kindCountBefore = await page.locator(kindSelector).count();
      if (kindCountBefore === 0) {
        continue;
      }

      await expect(listItem).not.toHaveClass(/is-collected/);
      await moveCharacterToShoppingListProduct(page, character, productKind, shelfIndex, productId);
      await doShoppingListCollection(page, listSelector);
      await expect(listItem).toHaveClass(/is-collected/);
      await expect(listItem.locator('.shopping-list-check')).toHaveText('✓', { timeout: 1000 });

      const shelfItemCount = await page.locator(kindSelector).count();
      expect(shelfItemCount).toBeLessThanOrEqual(kindCountBefore - 1);

      if (i < shoppingEntries.length - 1) {
        await page.dispatchEvent('body', 'keydown', { key: 'ArrowLeft', bubbles: true });
        await page.waitForTimeout(100);
        await page.dispatchEvent('body', 'keyup', { key: 'ArrowLeft', bubbles: true });
        await page.waitForTimeout(100);
      }
    }

    const collectedCount = await page.locator('.shopping-list-item.shopping-list-product.is-collected').count();
    expect(collectedCount).toBeGreaterThan(0);
    expect(collectedCount).toBe(5);

    const victory = page.locator('.round-overlay[data-phase="won"]');
    const checkout = page.locator('.checkout-zone');
    await expect(victory).toHaveCount(0);
    await expect(checkout).toBeVisible();
    await expect(page.locator('#game-container')).toHaveAttribute('data-objective', 'checkout');
    await expect(page.locator('.shopping-list-counter')).toHaveText('CHECKOUT');
    const checkoutTimerBefore = await page.locator('.round-timer').textContent();
    await page.waitForTimeout(1_100);
    await expect(page.locator('.round-timer')).not.toHaveText(checkoutTimerBefore ?? '');

    await moveCharacterToX(page, character, 140);
    await moveCharacterToRow(page, character, 4);
    await moveCharacterToX(page, character, 70);
    await page.keyboard.down('ArrowLeft');
    await expect(character).toHaveClass(/is-falling/, { timeout: 1000 });
    await page.keyboard.up('ArrowLeft');
    await expect(victory).toBeVisible();
    await expect(victory).toContainText(/order|packed|complete/i);
    await expect(victory.locator('.rating-badge')).toHaveCount(0);
    await expect(victory.locator('.customer-payoff')).not.toBeEmpty();
    const checkoutBreakdown = victory.locator('.checkout-breakdown');
    await expect(checkoutBreakdown).toBeVisible();
    await expect(checkoutBreakdown.locator('.checkout-chain')).toContainText(/best chain · ×[1-5]/i);
    await expect(checkoutBreakdown.locator('.checkout-coupon')).toContainText(/coupon · (\+3s|missed)/i);
    await expect(checkoutBreakdown.locator('.checkout-mistakes')).toContainText(/mistakes · \d+/i);
    const roundScore = Number(await page.locator('.score-value').textContent());
    const storedShiftScore = Number(await page.evaluate(() => localStorage.getItem('grocery-rush-shift-score')));
    const storedOrderBest = Number(await page.evaluate(() => localStorage.getItem('grocery-rush-best-order-1')));
    expect(storedShiftScore).toBe(roundScore);
    expect(storedOrderBest).toBe(roundScore);
    await expect(victory.locator('.run-record')).toContainText(`ORDER 1 BEST ${roundScore}`);
    await expect(victory.locator('.result-reset-map-link')).toBeVisible();
    await expect(victory.locator('.result-reset-map-link')).not.toContainText(/free reset map/i);
    await expect(victory.locator('.result-reset-map-link')).toHaveAttribute('href', 'https://www.prosperprivately.com/moveoncue?utm_source=grocery-rush');
    const shareButton = victory.locator('.share-score-button');
    await expect(shareButton).toBeVisible();
    await shareButton.click();
    const sharePayload = await page.evaluate(() => (window as Window & { __groceryRushShare?: ShareData }).__groceryRushShare);
    expect(sharePayload?.title).toBe('Grocery Rush');
    expect(sharePayload?.text).toContain(`I scored ${roundScore.toLocaleString('en-US')}`);
    expect(sharePayload?.url).toBe(new URL('.', page.url()).href);
    await expect(shareButton).not.toBeFocused();

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            (window as Window & { __groceryRushCopied?: string }).__groceryRushCopied = text;
          },
        },
      });
    });
    await shareButton.click();
    const copiedShare = await page.evaluate(() => (window as Window & { __groceryRushCopied?: string }).__groceryRushCopied);
    expect(copiedShare).toContain(`I scored ${roundScore.toLocaleString('en-US')}`);
    expect(copiedShare).toContain(new URL('.', page.url()).href);
    await expect(shareButton).toHaveText('Score copied');
    await expect(shareButton).not.toBeFocused();
    await expect(victory.locator('.restart-game-button')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.locator('.round-overlay[data-phase="ready"]')).toBeVisible();
    await expect(page.locator('.round-overlay[data-phase="ready"]')).toContainText(/order 2/i);

    await page.evaluate(() => localStorage.setItem('grocery-rush-order', '1'));
    await page.reload({ waitUntil: 'load' });
    await page.locator('.start-game-button').click();
    const replayCharacter = page.locator('.character').first();
    const replayEntries = await resolveShoppingListEntries(page);
    for (const entry of replayEntries) {
      const listSelector = `.shopping-list-item.shopping-list-product[data-product-id="${entry.productId}"]`;
      if (((await page.locator(listSelector).getAttribute('class')) ?? '').includes('is-collected')) {
        continue;
      }
      await moveCharacterToShoppingListProduct(
        page,
        replayCharacter,
        entry.productKind,
        entry.shelfIndex,
        entry.productId
      );
      await doShoppingListCollection(page, listSelector);
    }
    await moveCharacterToRow(page, replayCharacter, 5);
    await moveCharacterToX(page, replayCharacter, 20);
    await expect(page.locator('.round-overlay[data-phase="won"]')).toBeVisible();
    await expect.poll(async () => Number(await page.evaluate(() => localStorage.getItem('grocery-rush-shift-score')))).toBe(storedShiftScore);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
  test('explains a checkout timeout and preserves the earned run score', async ({ page }) => {
    await page.clock.install();
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    const character = page.locator('.character').first();
    const shoppingEntries = await resolveShoppingListEntries(page);

    for (const entry of shoppingEntries) {
      const listSelector = `.shopping-list-item.shopping-list-product[data-product-id="${entry.productId}"]`;
      if (((await page.locator(listSelector).getAttribute('class')) ?? '').includes('is-collected')) {
        continue;
      }
      await moveCharacterToShoppingListProduct(
        page,
        character,
        entry.productKind,
        entry.shelfIndex,
        entry.productId
      );
      await doShoppingListCollection(page, listSelector);
    }

    await expect(page.locator('#game-container')).toHaveAttribute('data-objective', 'checkout');
    const earnedScore = Number(await page.locator('.score-value').textContent());
    expect(earnedScore).toBeGreaterThan(0);
    await page.clock.runFor(46_000);

    const loss = page.locator('.round-overlay[data-phase="lost"]');
    await expect(loss).toBeVisible();
    await expect(loss.locator('.round-story')).toContainText(/didn.t reach checkout|missed checkout/i);
    await expect(loss.locator('.loss-score')).toContainText(`RUN SCORE · ${earnedScore.toLocaleString('en-US')}`);
    await expect(loss.locator('.result-reset-map-link')).toBeVisible();
    await expect(loss.locator('.result-reset-map-link')).not.toContainText(/free reset map/i);
    await expect(loss.locator('.result-reset-map-link')).toHaveAttribute('href', 'https://www.prosperprivately.com/moveoncue?utm_source=grocery-rush');
    await expect(loss.locator('.share-score-button')).toHaveCount(0);
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });


  test('collects a shopping list item from another duplicate instance', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    const character = page.locator('.character').first();

    const findDuplicateInstanceScenario = async () => {
      const shoppingEntries = (await resolveShoppingListEntries(page)).filter((entry) => !entry.isCollected);
      const shelfProducts: Array<{ productId: string; productKind: string; shelfIndex: number }> =
        await page.evaluate(() =>
          Array.from(document.querySelectorAll('.shelf-product')).map((node) => ({
            productId: node.getAttribute('data-product-id') || '',
            productKind: node.getAttribute('data-product-kind') || '',
            shelfIndex: Number(node.getAttribute('data-shelf-index') || '0'),
          }))
        );

      const productsByKind = new Map<string, typeof shelfProducts>();
      for (const product of shelfProducts) {
        const bucket = productsByKind.get(product.productKind) ?? [];
        bucket.push(product);
        productsByKind.set(product.productKind, bucket);
      }

      for (const entry of shoppingEntries) {
        const duplicates = productsByKind.get(entry.productKind) ?? [];
        const alternate = duplicates.find((product) => product.productId !== entry.productId);
        if (!alternate) {
          continue;
        }

        return {
          listProductId: entry.productId,
          alternateProductId: alternate.productId,
        };
      }

      return null;
    };

    let scenario = await findDuplicateInstanceScenario();
    for (let attempt = 0; attempt < 8 && !scenario; attempt++) {
      await page.reload({ waitUntil: 'load' });
      scenario = await findDuplicateInstanceScenario();
    }

    if (!scenario) {
      test.skip(true, 'No same-kind duplicate product instance is available for the shopping list.');
      return;
    }

    const listSelector = `.shopping-list-item.shopping-list-product[data-product-id="${scenario.listProductId}"]`;
    const listItem = page.locator(listSelector);
    const initialClass = await listItem.getAttribute('class');
    if (initialClass?.includes('is-collected')) {
      test.skip(true, 'Selected shopping list item was already collected before movement.');
      return;
    }

    const altInfo = await page.locator(`.shelf-product[data-product-id="${scenario.alternateProductId}"]`).first().evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        shelfIndex: Number(node.getAttribute('data-shelf-index') || '0'),
        left: parseFloat(style.left) + parseFloat(style.width) / 2,
      };
    });

    await moveCharacterToRow(page, character, altInfo.shelfIndex);
    const characterRect = await character.boundingBox();
    const characterWidth = characterRect?.width ?? 40;
    await moveCharacterToX(page, character, altInfo.left - characterWidth / 2);

    await doShoppingListCollection(page, listSelector);
    await expect(listItem).toHaveClass(/is-collected/);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('does not collect from an adjacent shelf row during jump', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    const { errors, consoleErrors } = await gotoGamePage(page);
    const character = page.locator('.character').first();
    const entry = (await resolveShoppingListEntries(page)).find((item) => !item.isCollected && item.shelfIndex !== 2);
    expect(entry).toBeDefined();
    if (!entry) return;

    const listSelector = `.shopping-list-item.shopping-list-product[data-product-id="${entry.productId}"]`;
    const listItem = page.locator(listSelector);
    const currentRow = entry.shelfIndex < 2 ? entry.shelfIndex + 1 : entry.shelfIndex - 1;
    await page.locator(`.shelf-product[data-product-kind="${entry.productKind}"]`).evaluateAll((nodes, targetProductId) =>
      nodes.forEach((node) => {
        if (node.getAttribute('data-product-id') !== targetProductId) node.remove();
      }),
      entry.productId
    );
    const targetProduct = page.locator(`.shelf-product[data-product-id="${entry.productId}"]`);
    const targetLeft = await targetProduct.evaluate((node) => {
      const style = getComputedStyle(node);
      return parseFloat(style.left) + parseFloat(style.width) / 2;
    });

    await moveCharacterToRow(page, character, currentRow);
    const characterWidth = await character.evaluate((node) => parseFloat(getComputedStyle(node).width));
    await moveCharacterToX(page, character, targetLeft - characterWidth / 2);
    await expect(listItem).not.toHaveClass(/is-collected/);

    const jumpKey = entry.shelfIndex > currentRow ? 'ArrowDown' : 'ArrowUp';
    await page.dispatchEvent('body', 'keydown', { key: jumpKey, bubbles: true });
    await page.waitForTimeout(120);
    await expect(listItem).not.toHaveClass(/is-collected/);
    await page.dispatchEvent('body', 'keyup', { key: jumpKey, bubbles: true });
    await page.waitForTimeout(260);
    await expect(listItem).toHaveClass(/is-collected/);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('renders the character element', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);

    const character = page.locator('.character').first();
    await expect(character).toBeVisible();

    const box = await character.boundingBox();
    expect(box).not.toBeNull();

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('applies shelf background layer image', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);

    const backgroundImage = await page.locator('.shelf-background').evaluate((element) =>
      window.getComputedStyle(element).backgroundImage
    );

    expect(backgroundImage).toContain('game-background.png');
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('loads compiled main and css assets', async ({ page }) => {
    const requested: string[] = [];
    page.on('response', (response) => requested.push(response.url()));

    const { errors, consoleErrors } = await gotoGamePage(page);

    const hasMainAsset = requested.some(
      (url) => /\/assets\/[^/]+\.js$/.test(url) || /\/src\/main\.ts(?:\?.*)?$/.test(url)
    );
    const hasCssAsset = requested.some(
      (url) => /\/assets\/[^/]+\.css$/.test(url) || /\/src\/css\/game\.css(?:\?.*)?$/.test(url)
    );

    expect(hasMainAsset).toBe(true);
    expect(hasCssAsset).toBe(true);
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('moves the character using arrow keys', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);

    const character = page.locator('.character').first();
    const start = await getCharacterPosition(character);

    await page.dispatchEvent('body', 'keydown', { key: 'ArrowRight', bubbles: true });
    await page.waitForTimeout(320);
    const afterRight = await getCharacterPosition(character);
    expect(afterRight.left).toBeGreaterThan(start.left);
    expectNearlyEqual(afterRight.top, start.top);
    await page.dispatchEvent('body', 'keyup', { key: 'ArrowRight', bubbles: true });

    const afterUp = await doVerticalJump(page, 'ArrowUp', character);
    expect(afterUp.top).toBeLessThan(afterRight.top);
    expectNearlyEqual(afterUp.left, afterRight.left);

    await page.dispatchEvent('body', 'keydown', { key: 'ArrowLeft', bubbles: true });
    await page.waitForTimeout(80);
    const afterLeft = await getCharacterPosition(character);
    expect(afterLeft.left).toBeLessThan(afterUp.left);
    expectNearlyEqual(afterLeft.top, afterUp.top);
    await page.dispatchEvent('body', 'keyup', { key: 'ArrowLeft', bubbles: true });

    const afterDown = await doVerticalJump(page, 'ArrowDown', character);
    expect(afterDown.top).toBeGreaterThan(afterLeft.top);
    expectNearlyEqual(afterDown.left, afterLeft.left);
    expectNearlyEqual(afterDown.top, afterRight.top, 1.5);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('continues a held horizontal run through a shelf change', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);
    await page.locator('.start-game-button').click();
    const character = page.locator('.character');

    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(160);
    const beforeJump = await getCharacterPosition(character);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(340);
    const afterJump = await getCharacterPosition(character);
    await page.waitForTimeout(180);
    const whileStillHeld = await getCharacterPosition(character);
    await page.keyboard.up('ArrowRight');

    expect(afterJump.top).toBeLessThan(beforeJump.top);
    expect(whileStillHeld.left).toBeGreaterThan(afterJump.left + 10);
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('gives a released horizontal phone flick meaningful follow-through', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const { errors, consoleErrors } = await gotoGamePage(page);
    const character = page.locator('.character').first();
    const start = await getCharacterPosition(character);

    await dispatchSwipe(page, 'right', 80);
    await page.waitForTimeout(260);
    const afterFlick = await getCharacterPosition(character);

    expect(afterFlick.left - start.left).toBeGreaterThan(20);
    expectNearlyEqual(afterFlick.top, start.top);
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('moves the character using swipe gestures', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);

    const character = page.locator('.character').first();

    const start = await getCharacterPosition(character);
    const swipeDistance = 80;

    await dispatchSwipe(page, 'right', swipeDistance);
    await page.waitForTimeout(100);
    const afterRight = await getCharacterPosition(character);
    expect(afterRight.left).toBeGreaterThan(start.left);
    expectNearlyEqual(afterRight.top, start.top);

    await dispatchSwipe(page, 'up', swipeDistance);
    await page.waitForTimeout(320);
    const afterDown = await getCharacterPosition(character);
    expect(afterDown.top).toBeLessThan(afterRight.top);
    expect(afterDown.left).toBeGreaterThanOrEqual(afterRight.left);
    expect(afterDown.left).toBeLessThanOrEqual(70);

    await dispatchSwipe(page, 'right', swipeDistance);
    await page.waitForTimeout(100);
    const afterLeft = await getCharacterPosition(character);
    expect(afterLeft.left).toBeGreaterThan(afterDown.left);
    expectNearlyEqual(afterLeft.top, afterDown.top);

    await dispatchSwipe(page, 'down', swipeDistance);
    await page.waitForTimeout(320);
    const afterUp = await getCharacterPosition(character);
    expect(afterUp.top).toBeGreaterThan(afterLeft.top);
    expectNearlyEqual(afterUp.left, afterLeft.left);

    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('snaps vertical movement to fixed shelf heights', async ({ page }) => {
    const { errors, consoleErrors } = await gotoGamePage(page);

    const character = page.locator('.character').first();
    const rowHeights = new Map<string, number>();

    const record = async () => {
      const row = await character.getAttribute('data-shelf-index');
      const pos = await getCharacterPosition(character);
      expect(row).not.toBeNull();
      if (!row) {
        return;
      }
      const top = Number(pos.top.toFixed(2));
      const previousTop = rowHeights.get(row);
      if (previousTop !== undefined) {
        expectNearlyEqual(top, previousTop, 1);
      }
      rowHeights.set(row, top);
    };

    for (let i = 0; i < 6; i++) {
      await doVerticalJump(page, 'ArrowUp', character);
      await record();
    }

    for (let i = 0; i < 6; i++) {
      await doVerticalJump(page, 'ArrowDown', character);
      await record();
    }

    expect(rowHeights.size).toBe(6);
    expect([...rowHeights.values()].sort((a, b) => a - b)).toEqual([33, 86, 140, 195, 249, 304]);
    expect(errors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
