(() => {
  if (window.__saltPumperBridgeInstalled) return;
  window.__saltPumperBridgeInstalled = true;

  const state = {
    locked: false,
    bootQueued: false,
    themeSyncTimer: 0,
    pumperSyncTimer: 0,
  };

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const isPositiveNumber = (value) => Number.isFinite(value) && value > 0;

  const getProductAside = () => document.querySelector("aside.salt-panel-shell");

  const getPumperWidget = () => document.getElementById("svelte-bundle-widget");

  const getBuyNowButton = () => {
    const aside = getProductAside();
    if (!aside) return null;
    return (
      Array.from(aside.querySelectorAll("a")).find(
        (el) => normalizeText(el.textContent) === "Buy now",
      ) || null
    );
  };

  const getQuantityControls = () => {
    const aside = getProductAside();
    if (!aside) return null;

    const decrease = aside.querySelector('button[aria-label="Decrease quantity"]');
    const increase = aside.querySelector('button[aria-label="Increase quantity"]');

    if (!decrease || !increase) return null;

    const value = decrease.parentElement?.querySelector("span");
    return value ? { decrease, increase, value } : null;
  };

  const getThemeQuantity = () => {
    const controls = getQuantityControls();
    const value = Number(controls?.value?.textContent?.trim() || "1");
    return isPositiveNumber(value) ? value : 1;
  };

  const setHiddenPumperQuantity = (quantity) => {
    const hidden = document.getElementById("pumper_custom_qty");
    if (!hidden) return;

    const nextValue = String(Math.max(1, Math.floor(quantity || 1)));
    if (hidden.value === nextValue) return;

    hidden.value = nextValue;
    hidden.dispatchEvent(new Event("input", { bubbles: true }));
    hidden.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const getPumperQuantity = () => {
    const checked = document.querySelector(
      '#pumper_bundle_svelte input[type="radio"][name="cb"]:checked',
    );
    const quantity = Number(checked?.value || "0");
    return isPositiveNumber(quantity) ? quantity : 0;
  };

  const getSelectedPumperIndex = () => {
    const quantity = getPumperQuantity();
    return quantity > 0 ? quantity - 1 : -1;
  };

  const getSelectedPumperTotal = () => {
    const index = getSelectedPumperIndex();
    if (index < 0) return null;

    const totalNode = document.getElementById(`pumper_totalAmount_${index}`);
    const total = normalizeText(totalNode?.textContent);
    return total || null;
  };

  const clickThemeQuantityButton = async (direction) => {
    const controls = getQuantityControls();
    if (!controls) return false;

    controls[direction].click();
    await wait(120);
    return true;
  };

  const setThemeQuantity = async (quantity) => {
    const target = Math.max(1, Math.floor(quantity || 1));
    const controls = getQuantityControls();
    if (!controls) return;

    if (getThemeQuantity() === target) {
      setHiddenPumperQuantity(target);
      return;
    }

    state.locked = true;
    try {
      for (let step = 0; step < 10; step += 1) {
        const current = getThemeQuantity();
        if (current === target) break;

        await clickThemeQuantityButton(current < target ? "increase" : "decrease");
      }
    } finally {
      setHiddenPumperQuantity(target);
      await wait(120);
      state.locked = false;
    }
  };

  const setPumperQuantity = (quantity) => {
    const target = Math.max(1, Math.floor(quantity || 1));
    if (target !== 1 && target !== 2) {
      setHiddenPumperQuantity(target);
      return;
    }

    const radio = document.querySelector(
      `#pumper_bundle_svelte input[type="radio"][name="cb"][value="${target}"]`,
    );
    if (!radio || radio.checked) {
      setHiddenPumperQuantity(target);
      return;
    }

    state.locked = true;
    const label = document.querySelector(`#pumper__label_${target}`) || radio.closest("label") || radio;
    label.click();
    setHiddenPumperQuantity(target);

    window.setTimeout(() => {
      state.locked = false;
    }, 250);
  };

  const getAddToCartButtons = () =>
    Array.from(document.querySelectorAll("button.salt-primary-cta")).filter((button) =>
      /add to cart/i.test(normalizeText(button.textContent)),
    );

  const setButtonLabel = (button, label) => {
    const textNode = Array.from(button.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE,
    );

    if (textNode) {
      if (textNode.nodeValue !== label) textNode.nodeValue = label;
    } else {
      button.appendChild(document.createTextNode(label));
    }

    button.dataset.saltBundleLabel = label;
    button.setAttribute("aria-label", label);
  };

  const syncAddToCartLabels = () => {
    const total = getSelectedPumperTotal();
    if (!total) return;

    const label = `Add to cart - ${total}`;
    getAddToCartButtons().forEach((button) => setButtonLabel(button, label));
  };

  const syncThemeFromPumper = async () => {
    if (state.locked) return;

    const quantity = getPumperQuantity();
    if (quantity > 0) {
      await setThemeQuantity(quantity);
    }

    syncAddToCartLabels();
  };

  const syncPumperFromTheme = () => {
    if (state.locked) return;

    const quantity = getThemeQuantity();
    if (quantity === 1 || quantity === 2) {
      window.clearTimeout(state.pumperSyncTimer);
      state.pumperSyncTimer = window.setTimeout(() => setPumperQuantity(quantity), 0);
      syncAddToCartLabels();
      return;
    }

    setHiddenPumperQuantity(quantity);
    syncAddToCartLabels();
  };

  const placeWidgetAboveCheckout = () => {
    const widget = getPumperWidget();
    const buyNow = getBuyNowButton();
    const aside = getProductAside();
    if (!widget || !buyNow || !aside) return;

    if (widget.nextElementSibling === buyNow) return;
    aside.insertBefore(widget, buyNow);
  };

  const boot = async () => {
    placeWidgetAboveCheckout();
    await syncThemeFromPumper();
    syncAddToCartLabels();
  };

  const queueBoot = () => {
    if (state.bootQueued) return;

    state.bootQueued = true;
    window.requestAnimationFrame(() => {
      state.bootQueued = false;
      boot();
    });
  };

  document.addEventListener(
    "change",
    (event) => {
      if (state.locked) return;

      const target = event.target;
      if (target instanceof HTMLInputElement && target.name === "cb") {
        window.clearTimeout(state.themeSyncTimer);
        state.themeSyncTimer = window.setTimeout(() => syncThemeFromPumper(), 0);
      }
    },
    true,
  );

  document.addEventListener(
    "click",
    (event) => {
      if (state.locked) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      if (
        target.closest('button[aria-label="Increase quantity"]') ||
        target.closest('button[aria-label="Decrease quantity"]')
      ) {
        window.clearTimeout(state.themeSyncTimer);
        state.themeSyncTimer = window.setTimeout(syncPumperFromTheme, 80);
      }
    },
    true,
  );

  document.addEventListener(
    "input",
    (event) => {
      if (state.locked) return;

      const target = event.target;
      if (target instanceof HTMLInputElement && target.name === "cb") {
        window.clearTimeout(state.themeSyncTimer);
        state.themeSyncTimer = window.setTimeout(() => syncThemeFromPumper(), 0);
      }
    },
    true,
  );

  if (document.body) {
    new MutationObserver(queueBoot).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener("DOMContentLoaded", queueBoot, { once: true });
  queueBoot();
})();
