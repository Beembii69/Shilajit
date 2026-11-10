export const UNIT_PRICES = Object.freeze({ p1: 50000, p2: 30000, p3: 70000, p4: 40000, p5: 25000, p6: 16000, p7: 20000 });

// Keep these Ulaanbaatar dates in sync with saleActive() in firestore.rules.
export const SALE_START = Date.parse('2026-11-11T00:00:00+08:00');
export const SALE_END = Date.parse('2026-11-18T00:00:00+08:00');

export function saleActive(now = Date.now()) {
  return now >= SALE_START && now < SALE_END;
}

export function saleRate(quantity, now = Date.now()) {
  return saleActive(now) ? Math.min(quantity, 3) * 10 : 0;
}

export function orderSubtotal(items) {
  return Object.entries(items).reduce((sum, [key, quantity]) => sum + UNIT_PRICES[key] * quantity, 0);
}

export function saleDiscount(subtotal, quantity, now = Date.now()) {
  return subtotal * saleRate(quantity, now) / 100;
}
