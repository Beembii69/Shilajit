export const PRODUCT_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];

export function quantities(order) {
  const items = order.items || { [order.product]: order.qty ?? 1 };
  if (!Object.keys(items).length || Object.entries(items).some(([key, quantity]) => !PRODUCT_KEYS.includes(key) || !Number.isInteger(quantity) || quantity < 1)) {
    throw new Error('Бүтээгдэхүүн, тоо ширхгийг шалгана уу.');
  }
  return items;
}

export function stockChange(stock, quantity, action, reserved) {
  const next = { onHand: stock.onHand || 0, reserved: stock.reserved || 0 };
  if (action === 'approved') next.reserved += quantity;
  if (action === 'cancelled' && reserved) next.reserved -= quantity;
  if (action === 'done') {
    next.onHand -= quantity;
    if (reserved) next.reserved -= quantity;
  }
  if (![next.onHand, next.reserved].every(Number.isSafeInteger) || next.onHand < 0 || next.reserved < 0 || next.reserved > next.onHand) {
    throw new Error('Барааны үлдэгдэл хүрэлцэхгүй эсвэл нөөцийн бүртгэл зөрсөн байна.');
  }
  return next;
}

export function countDifference(stock, actual) {
  if (!Number.isSafeInteger(actual) || actual < 0 || actual < (stock.reserved || 0)) {
    throw new Error('Бодит үлдэгдэл нь сөрөг эсвэл нөөцөлсөн хэмжээнээс бага байж болохгүй. Зөрсөн захиалгыг эхлээд шалгана уу.');
  }
  return actual - (stock.onHand || 0);
}

export function weekday(date) { return new Date(date + 'T12:00:00Z').getUTCDay(); }
export function isWorkday(date, saturdayEnabled = false) {
  const day = weekday(date);
  return (day >= 1 && day <= 5) || (day === 6 && saturdayEnabled);
}
