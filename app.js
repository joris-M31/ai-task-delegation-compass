const CONFIG = {
  // Editable defaults and ranges used by reset and query param parsing.
  defaults: {
    human: 60,
    prob: 50,
    ai: 60,
  },
  ranges: {
    human: { min: 0, max: 120 },
    prob: { min: 0, max: 100 },
    ai: { min: 0, max: 120 },
  },
  // Shared time buckets for both human baseline and AI process time.
  timeBuckets: {
    fastMax: 14, // Fast < 15
    mediumMax: 45, // Medium 15-45
  },
  // Probability labels used in display and decision rules.
  probabilityBuckets: [
    { key: "unlikely", min: 0, max: 20, label: "Unlikely" },
    { key: "doubtful", min: 21, max: 40, label: "Doubtful" },
    { key: "neutral", min: 41, max: 60, label: "Neutral" },
    { key: "likely", min: 61, max: 80, label: "Likely" },
    { key: "very_likely", min: 81, max: 100, label: "Very likely" },
  ],
  presets: {
    autopilot: { human: 60, prob: 85, ai: 10 },
    collaboration: { human: 60, prob: 70, ai: 10 },
    manual: { human: 40, prob: 35, ai: 55 },
  },
};

const elements = {
  humanSlider: document.getElementById("humanTime"),
  humanValue: document.getElementById("humanTimeValue"),
  probSlider: document.getElementById("successProbability"),
  probValue: document.getElementById("successProbabilityValue"),
  aiSlider: document.getElementById("aiTime"),
  aiValue: document.getElementById("aiTimeValue"),
  resultCard: document.getElementById("resultCard"),
  resultMode: document.getElementById("resultMode"),
  resultWhy: document.getElementById("resultWhy"),
  resetButton: document.getElementById("resetButton"),
  presetAutopilot: document.getElementById("presetAutopilot"),
  presetCollaboration: document.getElementById("presetCollaboration"),
  presetManual: document.getElementById("presetManual"),
  openMeaning: document.getElementById("openMeaning"),
  closeMeaning: document.getElementById("closeMeaning"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  meaningModal: document.getElementById("meaningModal"),
  tooltipTriggers: Array.from(document.querySelectorAll("[data-tooltip-trigger]")),
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getTimeBucket(minutes) {
  if (minutes <= CONFIG.timeBuckets.fastMax) return "fast";
  if (minutes <= CONFIG.timeBuckets.mediumMax) return "medium";
  return "long";
}

function getProbabilityBucket(percent) {
  return (
    CONFIG.probabilityBuckets.find((bucket) => percent >= bucket.min && percent <= bucket.max) ||
    CONFIG.probabilityBuckets[0]
  );
}

// Decision rules are intentionally ordered to keep behavior identical to V1.
function getMode(probabilityKey, humanBucket, aiBucket) {
  // Rule 1:
  // If probability is Very likely and human baseline is Long:
  // - AI Fast => Autopilot
  // - AI Medium => Collaboration
  // - otherwise => Manual
  if (probabilityKey === "very_likely" && humanBucket === "long") {
    if (aiBucket === "fast") return "Autopilot";
    if (aiBucket === "medium") return "Collaboration";
    return "Manual";
  }

  // Rule 2:
  // If probability is Likely/Very likely and human baseline is Medium/Long:
  // - AI Fast => Collaboration
  // - otherwise => Manual
  const highProbability = probabilityKey === "likely" || probabilityKey === "very_likely";
  const mediumOrLongHuman = humanBucket === "medium" || humanBucket === "long";
  if (highProbability && mediumOrLongHuman) {
    if (aiBucket === "fast") return "Collaboration";
    return "Manual";
  }

  // Rule 3: Everything else => Manual
  return "Manual";
}

function getResultClass(mode) {
  if (mode === "Autopilot") return "result-autopilot";
  if (mode === "Collaboration") return "result-collaboration";
  return "result-manual";
}

function setResultStyle(mode) {
  elements.resultCard.classList.remove("result-autopilot", "result-collaboration", "result-manual");
  elements.resultCard.classList.add(getResultClass(mode));
}

function setValues({ human, prob, ai }) {
  elements.humanSlider.value = human;
  elements.probSlider.value = prob;
  elements.aiSlider.value = ai;
}

function getValues() {
  return {
    human: Number(elements.humanSlider.value),
    prob: Number(elements.probSlider.value),
    ai: Number(elements.aiSlider.value),
  };
}

function updateUrlQuery(values) {
  const params = new URLSearchParams(window.location.search);
  params.set("human", String(values.human));
  params.set("prob", String(values.prob));
  params.set("ai", String(values.ai));
  const query = params.toString();
  const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, "", nextUrl);
}

function parseParam(params, name, fallback, range) {
  const rawValue = params.get(name);
  if (rawValue === null || rawValue.trim() === "") return fallback;

  const value = Number(rawValue);
  if (!Number.isFinite(value)) return fallback;
  return clamp(Math.round(value), range.min, range.max);
}

function getInitialValues() {
  const params = new URLSearchParams(window.location.search);
  return {
    human: parseParam(params, "human", CONFIG.defaults.human, CONFIG.ranges.human),
    prob: parseParam(params, "prob", CONFIG.defaults.prob, CONFIG.ranges.prob),
    ai: parseParam(params, "ai", CONFIG.defaults.ai, CONFIG.ranges.ai),
  };
}

function buildExplanation(mode, probabilityLabel, humanBucket, aiBucket) {
  return `${mode} because human time is ${humanBucket}, success probability is ${probabilityLabel.toLowerCase()}, and AI process time is ${aiBucket}.`;
}

function formatTimeMinutes(value, max) {
  return value >= max ? `${max}+ min` : `${value} min`;
}

function render() {
  const values = getValues();
  const humanBucket = getTimeBucket(values.human);
  const aiBucket = getTimeBucket(values.ai);
  const probabilityBucket = getProbabilityBucket(values.prob);
  const mode = getMode(probabilityBucket.key, humanBucket, aiBucket);

  elements.humanValue.textContent = formatTimeMinutes(values.human, CONFIG.ranges.human.max);
  elements.probValue.textContent = `${probabilityBucket.label} (${values.prob}%)`;
  elements.aiValue.textContent = formatTimeMinutes(values.ai, CONFIG.ranges.ai.max);
  elements.resultMode.textContent = mode;
  elements.resultWhy.textContent = buildExplanation(
    mode,
    probabilityBucket.label,
    humanBucket,
    aiBucket
  );

  setResultStyle(mode);
  updateUrlQuery(values);
}

function applyDefaults() {
  setValues(CONFIG.defaults);
  render();
}

function applyPreset(presetValues) {
  setValues(presetValues);
  render();
}

function setTooltipVisibility(trigger, isOpen, pinned) {
  const tooltipId = trigger.getAttribute("aria-controls");
  const tooltip = tooltipId ? document.getElementById(tooltipId) : null;

  trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  trigger.dataset.pinned = isOpen && pinned ? "true" : "false";

  if (!tooltip) return;
  tooltip.classList.toggle("is-open", isOpen);
  tooltip.setAttribute("aria-hidden", isOpen ? "false" : "true");
}

function closeAllTooltips(exceptTrigger = null) {
  elements.tooltipTriggers.forEach((trigger) => {
    if (exceptTrigger && trigger === exceptTrigger) return;
    setTooltipVisibility(trigger, false, false);
  });
}

function openTooltip(trigger, pinned) {
  closeAllTooltips(trigger);
  setTooltipVisibility(trigger, true, pinned);
}

function closeTooltip(trigger) {
  setTooltipVisibility(trigger, false, false);
}

function initTooltips() {
  elements.tooltipTriggers.forEach((trigger) => {
    const wrapper = trigger.closest(".tooltip-wrap");

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      const isPinned = trigger.dataset.pinned === "true";

      if (isOpen && isPinned) {
        closeTooltip(trigger);
        return;
      }

      openTooltip(trigger, true);
    });

    if (!wrapper) return;

    wrapper.addEventListener("mouseenter", () => {
      openTooltip(trigger, false);
    });

    wrapper.addEventListener("mouseleave", () => {
      if (trigger.dataset.pinned !== "true" && !wrapper.contains(document.activeElement)) {
        closeTooltip(trigger);
      }
    });

    wrapper.addEventListener("focusin", () => {
      openTooltip(trigger, false);
    });

    wrapper.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!wrapper.contains(document.activeElement) && trigger.dataset.pinned !== "true") {
          closeTooltip(trigger);
        }
      }, 0);
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest(".tooltip-wrap")) {
      closeAllTooltips();
    }
  });
}

function openMeanings() {
  elements.meaningModal.classList.remove("hidden");
  elements.meaningModal.classList.add("flex");
  elements.meaningModal.setAttribute("aria-hidden", "false");
  elements.openMeaning.setAttribute("aria-expanded", "true");
  elements.closeMeaning.focus();
}

function closeMeanings() {
  elements.meaningModal.classList.add("hidden");
  elements.meaningModal.classList.remove("flex");
  elements.meaningModal.setAttribute("aria-hidden", "true");
  elements.openMeaning.setAttribute("aria-expanded", "false");
  elements.openMeaning.focus();
}

function init() {
  initTooltips();

  ["input", "change"].forEach((eventName) => {
    elements.humanSlider.addEventListener(eventName, render);
    elements.probSlider.addEventListener(eventName, render);
    elements.aiSlider.addEventListener(eventName, render);
  });

  elements.resetButton.addEventListener("click", applyDefaults);
  elements.presetAutopilot.addEventListener("click", () => applyPreset(CONFIG.presets.autopilot));
  elements.presetCollaboration.addEventListener("click", () =>
    applyPreset(CONFIG.presets.collaboration)
  );
  elements.presetManual.addEventListener("click", () => applyPreset(CONFIG.presets.manual));

  elements.openMeaning.addEventListener("click", openMeanings);
  elements.closeMeaning.addEventListener("click", closeMeanings);
  elements.modalBackdrop.addEventListener("click", closeMeanings);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllTooltips();

      if (!elements.meaningModal.classList.contains("hidden")) {
        closeMeanings();
      }
    }
  });

  setValues(getInitialValues());
  render();
}

init();
