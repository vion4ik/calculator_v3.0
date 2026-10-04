// ========== НАСТРОЙКИ ==========
const USD_RATE = 85;

// ========== ТАБЛИЦЫ ЦЕН (за 25 ELO) ==========
const soloPrices = [
  { min: 900,  max: 1050, pricePerElo: 105 / 25 },
  { min: 1050, max: 1200, pricePerElo: 125 / 25 },
  { min: 1200, max: 1350, pricePerElo: 145 / 25 },
  { min: 1350, max: 1530, pricePerElo: 165 / 25 },
  { min: 1530, max: 1750, pricePerElo: 190 / 25 },
  { min: 1750, max: 2000, pricePerElo: 230 / 25 },
  { min: 2000, max: 2100, pricePerElo: 270 / 25 },
  { min: 2100, max: 2200, pricePerElo: 320 / 25 },
  { min: 2200, max: 2300, pricePerElo: 355 / 25 },
  { min: 2300, max: 2400, pricePerElo: 390 / 25 },
  { min: 2400, max: 2500, pricePerElo: 460 / 25 },
  { min: 2500, max: 2600, pricePerElo: 520 / 25 },
  { min: 2600, max: 2700, pricePerElo: 580 / 25 },
  { min: 2700, max: 2800, pricePerElo: 670 / 25 },
  { min: 2800, max: 2900, pricePerElo: 850 / 25 },
  { min: 2900, max: 3000, pricePerElo: 900 / 25 }
];

const partyPrices = [
  { min: 900,  max: 1050, pricePerElo: 158 / 25 },
  { min: 1050, max: 1200, pricePerElo: 188 / 25 },
  { min: 1200, max: 1350, pricePerElo: 218 / 25 },
  { min: 1350, max: 1530, pricePerElo: 248 / 25 },
  { min: 1530, max: 1750, pricePerElo: 285 / 25 },
  { min: 1750, max: 2000, pricePerElo: 345 / 25 },
  { min: 2000, max: 2100, pricePerElo: 405 / 25 },
  { min: 2100, max: 2200, pricePerElo: 480 / 25 },
  { min: 2200, max: 2300, pricePerElo: 533 / 25 },
  { min: 2300, max: 2400, pricePerElo: 683 / 25 },
  { min: 2400, max: 2500, pricePerElo: 805 / 25 },
  { min: 2500, max: 2600, pricePerElo: 910 / 25 },
  { min: 2600, max: 2700, pricePerElo: 1015 / 25 },
  { min: 2700, max: 2800, pricePerElo: 1240 / 25 },
  { min: 2800, max: 2900, pricePerElo: 1573 / 25 },
  { min: 2900, max: 3000, pricePerElo: 1800 / 25 }
];

// ========== СОСТОЯНИЕ ==========
let currentLang = 'ru';
let currentCurrency = 'RUB';

// ========== ПЕРЕВОДЫ ==========
const translations = {
  ru: {
    title: '💎 BOOST CS2',
    boostType: 'Тип буста',
    currentElo: 'Начальное ELO',
    targetElo: 'Конечное ELO',
    targetHint: '📌 Введите конечный ELO (макс. 3000)',
    markup: 'Наценка (%)',
    calcBtn: '💰 Рассчитать цену',
    placeholder: 'Введите данные и нажмите «Рассчитать»',
    info: 'ℹ️ Информация',
    errInvalid: '⚠️ Введите корректные числа',
    errTargetLess: '❌ Конечный ELO должен быть больше начального',
    errNegative: '❌ ELO не может быть отрицательным',
    errMaxElo: '❌ Максимальный ELO — 3000',
    errNoTier: '❌ Нет цен для ELO выше ',
    rub: 'руб'
  },
  en: {
    title: '💎 BOOST CS2',
    boostType: 'Boost type',
    currentElo: 'Current ELO',
    targetElo: 'Target ELO',
    targetHint: '📌 Enter target ELO (max 3000)',
    markup: 'Markup (%)',
    calcBtn: '💰 Calculate price',
    placeholder: 'Enter values and click "Calculate"',
    info: 'ℹ️ Info',
    errInvalid: '⚠️ Please enter valid numbers',
    errTargetLess: '❌ Target ELO must be higher than current',
    errNegative: '❌ ELO cannot be negative',
    errMaxElo: '❌ Maximum ELO is 3000',
    errNoTier: '❌ No prices for ELO above ',
    rub: 'RUB'
  }
};

function t(key) {
  return translations[currentLang][key];
}

// ========== РАСЧЁТ ==========
function calculateBoostByElo(currentElo, desiredElo, priceTable, markup) {
  if (currentElo >= desiredElo) return { error: t('errTargetLess') };
  if (currentElo < 0 || desiredElo < 0) return { error: t('errNegative') };
  if (desiredElo > 3000) return { error: t('errMaxElo') };

  let totalCost = 0;
  let remaining = desiredElo - currentElo;
  let pos = currentElo < 900 ? 900 : currentElo;

  if (currentElo < 900 && desiredElo < 900) {
    totalCost = (desiredElo - currentElo) * priceTable[0].pricePerElo;
    const multiplier = 1 + (markup / 100);
    return { totalCost: totalCost * multiplier, error: null };
  }

  for (const tier of priceTable) {
    if (pos >= tier.min && pos < tier.max) {
      const tierMax = tier.max === Infinity ? desiredElo : tier.max;
      const maxGain = tierMax - pos;
      const gain = Math.min(remaining, maxGain);
      if (gain > 0) {
        totalCost += gain * tier.pricePerElo;
        pos += gain;
        remaining -= gain;
      }
    }
    if (remaining <= 0) break;
  }

  if (remaining > 0) return { error: t('errNoTier') + pos };

  const multiplier = 1 + (markup / 100);
  return { totalCost: totalCost * multiplier, error: null };
}

// ========== ОБНОВЛЕНИЕ ПОЛЕЙ ==========
function updateFields() {
  document.getElementById('currentLabel').textContent = t('currentElo');
  document.getElementById('targetLabel').textContent = t('targetElo');
  document.getElementById('targetHint').textContent = t('targetHint');
}

// ========== ПЕРЕВОД ИНТЕРФЕЙСА ==========
function applyLanguage() {
  document.getElementById('titleText').textContent = t('title');
  document.getElementById('boostTypeLabel').textContent = t('boostType');
  document.getElementById('markupLabel').textContent = t('markup');
  document.getElementById('calcBtn').textContent = t('calcBtn');

  const infoBtn = document.getElementById('infoBtn');
  if (infoBtn) infoBtn.textContent = t('info');

  const options = document.querySelectorAll('#boostType option');
  options.forEach(opt => {
    opt.textContent = opt.getAttribute('data-' + currentLang);
  });

  document.documentElement.lang = currentLang;
  document.title = 'Boost CS2';

  const resultDiv = document.getElementById('result');
  if (resultDiv && !resultDiv.querySelector('.price')) {
    resultDiv.innerHTML = '<div class="placeholder">' + t('placeholder') + '</div>';
  }

  updateFields();
}

// ========== ФОРМАТ ЦЕНЫ ==========
function formatPrice(priceInRub) {
  if (currentCurrency === 'USD') {
    return '$' + (priceInRub / USD_RATE).toFixed(2);
  }
  return priceInRub.toFixed(2) + ' ' + t('rub');
}

// ========== ГЛАВНЫЙ РАСЧЁТ ==========
function calculate() {
  const boostType = document.getElementById('boostType').value;
  const currentElo = parseFloat(document.getElementById('currentElo').value);
  const targetValue = parseFloat(document.getElementById('targetInput').value);
  const markup = parseFloat(document.getElementById('markup').value) || 0;
  const resultDiv = document.getElementById('result');

  if (isNaN(currentElo) || isNaN(targetValue)) {
    resultDiv.innerHTML = '<div class="placeholder">' + t('errInvalid') + '</div>';
    return;
  }

  const priceTable = boostType === 'party' ? partyPrices : soloPrices;
  const result = calculateBoostByElo(currentElo, targetValue, priceTable, markup);

  if (result.error) {
    resultDiv.innerHTML = '<div class="placeholder">' + result.error + '</div>';
    return;
  }

  resultDiv.innerHTML = '<div class="price">' + formatPrice(result.totalCost) + '</div>';
}

// ========== ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА ==========
document.querySelectorAll('#langSwitch .switch-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#langSwitch .switch-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    currentLang = btn.getAttribute('data-lang');
    applyLanguage();
    const resultDiv = document.getElementById('result');
    if (resultDiv && resultDiv.querySelector('.price')) calculate();
  });
});

// ========== ПЕРЕКЛЮЧАТЕЛЬ ВАЛЮТЫ ==========
document.querySelectorAll('#currencySwitch .switch-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('#currencySwitch .switch-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    currentCurrency = btn.getAttribute('data-currency');
    const resultDiv = document.getElementById('result');
    if (resultDiv && resultDiv.querySelector('.price')) calculate();
  });
});

// ========== ENTER НА ПОЛЯХ ==========
document.querySelectorAll('input').forEach(function (input) {
  input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') calculate();
  });
});

// ========== ИНИЦИАЛИЗАЦИЯ ==========
window.onload = function () {
  if (document.getElementById('boostType')) {
    applyLanguage();
    updateFields();
  }
};