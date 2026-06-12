const SALT_META_PIXEL_ID = "1147374030261395";
const SHOPIFY_PIXEL_INIT =
  typeof init !== "undefined" && init && typeof init === "object"
    ? init
    : null;

function loadMetaPixel() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  if (typeof window.fbq === "function") {
    return true;
  }

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", SALT_META_PIXEL_ID);
  return true;
}

function asNumber(value) {
  const parsed = Number(
    value && typeof value === "object" && "amount" in value
      ? value.amount
      : value,
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

function firstString(...values) {
  for (const value of values) {
    const normalized = String(value || "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeId(...values) {
  return firstString(...values);
}

function normalizeLineItem(lineItem) {
  const merchandise =
    lineItem?.merchandise ||
    lineItem?.variant ||
    lineItem?.productVariant ||
    null;

  const id = normalizeId(
    merchandise?.id,
    lineItem?.variant?.id,
    lineItem?.id,
    lineItem?.title,
  );

  if (!id) {
    return null;
  }

  const quantity = Math.max(
    1,
    Math.floor(
      asNumber(lineItem?.quantity) ||
        asNumber(lineItem?.quantityAdded) ||
        1,
    ),
  );

  const itemPrice =
    asNumber(lineItem?.cost?.totalAmount) / quantity ||
    asNumber(lineItem?.cost?.amountPerQuantity) ||
    asNumber(lineItem?.price) ||
    asNumber(merchandise?.price);

  return {
    id,
    quantity,
    item_price: itemPrice,
  };
}

function normalizeLineItems(lineItems) {
  return Array.isArray(lineItems)
    ? lineItems.map(normalizeLineItem).filter(Boolean)
    : [];
}

function getCurrency(checkout) {
  return (
    firstString(
      checkout?.currencyCode,
      checkout?.totalPrice?.currencyCode,
      checkout?.subtotalPrice?.currencyCode,
      SHOPIFY_PIXEL_INIT?.data?.shop?.currencyCode,
    ) || "USD"
  );
}

function getCheckoutValue(checkout, fallbackContents) {
  return (
    asNumber(checkout?.totalPrice) ||
    asNumber(checkout?.subtotalPrice) ||
    fallbackContents.reduce(
      (sum, lineItem) => sum + lineItem.item_price * lineItem.quantity,
      0,
    )
  );
}

analytics.subscribe("payment_info_submitted", (event) => {
  if (!loadMetaPixel()) {
    return;
  }

  const checkout = event?.data?.checkout || {};
  const contents = normalizeLineItems(checkout?.lineItems);

  if (!contents.length) {
    return;
  }

  window.fbq("track", "AddPaymentInfo", {
    content_ids: contents.map((lineItem) => lineItem.id),
    contents,
    content_type: "product",
    currency: getCurrency(checkout),
    num_items: contents.reduce((sum, lineItem) => sum + lineItem.quantity, 0),
    value: getCheckoutValue(checkout, contents),
  });
});

analytics.subscribe("checkout_completed", (event) => {
  if (!loadMetaPixel()) {
    return;
  }

  const checkout = event?.data?.checkout || {};
  const contents = normalizeLineItems(checkout?.lineItems);
  const orderId = firstString(
    checkout?.order?.id,
    checkout?.order?.name,
    checkout?.id,
  );

  window.fbq("track", "Purchase", {
    content_ids: contents.map((lineItem) => lineItem.id),
    contents,
    content_type: "product",
    currency: getCurrency(checkout),
    num_items: contents.reduce((sum, lineItem) => sum + lineItem.quantity, 0),
    value: getCheckoutValue(checkout, contents),
    order_id: orderId || undefined,
  });
});
