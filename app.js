const CONFIG = {
  defaults: {
    human: 50,
    prob: 85,
    ai: 10,
  },
  timeBuckets: {
    fastMax: 14, // Fast < 15
    mediumMax: 45, // Medium 15-45
  },
  probabilityBuckets: [
    { min: 0, max: 20, label: "Onwaarschijnlijk" },
    { min: 21, max: 40, label: "Twijfelachtig" },
    { min: 41, max: 60, label: "Neutraal" },
    { min: 61, max: 80, label: "Waarschijnlijk" },
    { min: 81, max: 100, label: "Zeer waarschijnlijk" },
  ],
};

const elements = {
  humanSlider: document.getElementById("humanTime"),
  humanValue: document.getElementById("humanTimeValue"),
  probSlider: document.getElementById("successProbability"),
  probValue: document.getElementById("successProbabilityValue"),
  aiSlider: document.getElementById("aiTime"),
  aiValue: document.getElementById("aiTimeValue"),
  resultMode: document.getElementById("resultMode"),
  resetButton: document.getElementById("resetButton"),
};

function getTimeBucket(minutes) {
  if (minutes <= CONFIG.timeBuckets.fastMax) return "Fast";
  if (minutes <= CONFIG.timeBuckets.mediumMax) return "Medium";
  return "Long";
}

function getProbabilityLabel(percent) {
  const match = CONFIG.probabilityBuckets.find((bucket) => {
    return percent >= bucket.min && percent <= bucket.max;
  });
  return match ? match.label : "Onwaarschijnlijk";
}

function getMode(probLabel, humanBucket, aiBucket) {
  // Rule 1
  if (probLabel === "Zeer waarschijnlijk" && humanBucket === "Long") {
    if (aiBucket === "Fast") return "Autopilot";
    if (aiBucket === "Medium") return "Collaboration";
    return "Manual";
  }

  // Rule 2
  const highProb = probLabel === "Waarschijnlijk" || probLabel === "Zeer waarschijnlijk";
  const mediumOrLongHuman = humanBucket === "Medium" || humanBucket === "Long";
  if (highProb && mediumOrLongHuman) {
    if (aiBucket === "Fast") return "Collaboration";
    return "Manual";
  }

  // Rule 3
  return "Manual";
}

function render() {
  const human = Number(elements.humanSlider.value);
  const prob = Number(elements.probSlider.value);
  const ai = Number(elements.aiSlider.value);

  const probLabel = getProbabilityLabel(prob);
  const humanBucket = getTimeBucket(human);
  const aiBucket = getTimeBucket(ai);
  const mode = getMode(probLabel, humanBucket, aiBucket);

  elements.humanValue.textContent = `${human} min`;
  elements.probValue.textContent = `${probLabel} (${prob}%)`;
  elements.aiValue.textContent = `${ai} min`;
  elements.resultMode.textContent = mode;
}

function setDefaults() {
  elements.humanSlider.value = CONFIG.defaults.human;
  elements.probSlider.value = CONFIG.defaults.prob;
  elements.aiSlider.value = CONFIG.defaults.ai;
  render();
}

function init() {
  elements.humanSlider.addEventListener("input", render);
  elements.probSlider.addEventListener("input", render);
  elements.aiSlider.addEventListener("input", render);
  elements.resetButton.addEventListener("click", setDefaults);
  setDefaults();
}

init();
