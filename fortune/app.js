(function () {
  "use strict";

  const C = window.GanjiIChingCore;
  const STORAGE_KEY = "ganji-iching-profile-v1";
  const TABS = {
    year: { symbol: "年", label: "연 운세", small: "선택한 해", unit: "년", ganjiKey: "year" },
    month: { symbol: "月", label: "월 운세", small: "선택한 날짜의 절기월", unit: "월", ganjiKey: "month" },
    day: { symbol: "日", label: "일 운세", small: "선택한 날짜", unit: "일", ganjiKey: "day" },
    time: { symbol: "時", label: "시 운세", small: "선택한 시각", unit: "시", ganjiKey: "time" }
  };

  const now = new Date();
  const today = formatDate(now);
  const currentDateTime = formatDateTime(now);
  const state = {
    tab: "year",
    profile: loadProfile(),
    period: {
      year: String(now.getFullYear()),
      month: today,
      day: today,
      time: currentDateTime
    }
  };

  function pad(n) { return String(n).padStart(2, "0"); }
  function formatDate(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
  function formatDateTime(date) { return `${formatDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
  function esc(s) { return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }

  function loadProfile() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) && /^\d{2}:\d{2}$/.test(parsed.time) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function parseDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return { year, month, day };
  }

  function parseDateTime(value) {
    const [date, time = "12:00"] = value.split("T");
    const parts = parseDate(date);
    const [hour, minute] = time.split(":").map(Number);
    return { ...parts, hour, minute };
  }

  function pillarsAt(parts) {
    return C.fourPillars(Solar, parts.year, parts.month, parts.day, parts.hour ?? 12, parts.minute ?? 0);
  }

  function birthPillars() {
    if (!state.profile) return null;
    const parts = parseDateTime(`${state.profile.date}T${state.profile.time}`);
    return C.makeBirthPillars(pillarsAt(parts));
  }

  function periodInfo() {
    const tab = TABS[state.tab];
    let parts;
    if (state.tab === "year") {
      parts = { year: Number(state.period.year), month: 7, day: 1, hour: 12, minute: 0 };
    } else if (state.tab === "time") {
      parts = parseDateTime(state.period.time);
    } else {
      parts = { ...parseDate(state.period[state.tab]), hour: 12, minute: 0 };
    }
    const pillars = pillarsAt(parts);
    const ganji = pillars[tab.ganjiKey];
    return { tab, parts, pillars, ganji, hex: C.hexForGanji(ganji) };
  }

  function glyph(bits, className) {
    const width = 74;
    const stroke = 5;
    const gap = 7;
    const split = 30;
    const rows = bits.split("").map((bit, i) => {
      const y = i * (stroke + gap);
      if (bit === "1") return `<rect x="0" y="${y}" width="${width}" height="${stroke}" rx="2" />`;
      return `<rect x="0" y="${y}" width="${split}" height="${stroke}" rx="2"/><rect x="${width - split}" y="${y}" width="${split}" height="${stroke}" rx="2"/>`;
    }).join("");
    return `<svg class="line-svg ${className || ""}" viewBox="0 0 ${width} ${6 * stroke + 5 * gap}" aria-hidden="true" fill="currentColor">${rows}</svg>`;
  }

  function profileSummary(pillars) {
    if (!pillars) return "";
    return pillars.map((p) => `<div class="pillar-mini"><span class="label">${p.label}</span><span class="ganji">${C.toKoreanGanji(p.ganji)} <small>${p.ganji}</small></span><span class="hex">${p.hex.name}</span></div>`).join("");
  }

  function renderSidebar() {
    const pillars = birthPillars();
    return `
      <aside class="sidebar">
        <section class="panel profile-panel">
          <div class="eyebrow">Birth profile</div>
          <h2>내 사주 저장</h2>
          <p class="helper">양력 생일과 출생 시각을 입력하세요. 정보는 이 브라우저에만 저장됩니다.</p>
          <form id="profileForm">
            <div class="field"><label for="birthDate">양력 생일</label><input id="birthDate" name="birthDate" type="date" min="1900-01-01" max="2100-12-31" required value="${esc(state.profile?.date || "")}"></div>
            <div class="field"><label for="birthTime">출생 시각</label><input id="birthTime" name="birthTime" type="time" required value="${esc(state.profile?.time || "")}"></div>
            <button class="primary" type="submit">사주 저장 및 계산</button>
            <p class="form-error" id="formError" role="alert"></p>
          </form>
          <div class="birth-summary ${pillars ? "show" : ""}" id="birthSummary">${profileSummary(pillars)}</div>
        </section>
        <section class="panel tabs-panel">
          <nav class="tabs" aria-label="운세 기간">
            ${Object.entries(TABS).map(([key, item]) => `<button class="tab ${state.tab === key ? "active" : ""}" type="button" data-tab="${key}" aria-current="${state.tab === key ? "page" : "false"}"><span class="tab-symbol">${item.symbol}</span><span><strong>${item.label}</strong><small>${item.small}</small></span></button>`).join("")}
          </nav>
        </section>
      </aside>`;
  }

  function periodInput(info) {
    if (state.tab === "year") {
      return `<div class="field"><label for="periodValue">살펴볼 연도</label><input class="period-input" id="periodValue" type="number" min="1900" max="2100" inputmode="numeric" value="${esc(state.period.year)}"></div>`;
    }
    if (state.tab === "time") {
      return `<div class="field"><label for="periodValue">살펴볼 날짜와 시각</label><input class="period-input" id="periodValue" type="datetime-local" min="1900-01-01T00:00" max="2100-12-31T23:59" value="${esc(state.period.time)}"></div>`;
    }
    const label = state.tab === "month" ? "월을 판정할 기준일" : "살펴볼 날짜";
    return `<div class="field"><label for="periodValue">${label}</label><input class="period-input" id="periodValue" type="date" min="1900-01-01" max="2100-12-31" value="${esc(state.period[state.tab])}"></div>`;
  }

  function dateLabel(info) {
    if (state.tab === "year") return `${info.parts.year}년`;
    if (state.tab === "time") return `${info.parts.year}년 ${info.parts.month}월 ${info.parts.day}일 ${pad(info.parts.hour)}:${pad(info.parts.minute)}`;
    return `${info.parts.year}년 ${info.parts.month}월 ${info.parts.day}일`;
  }

  function basisCard(info) {
    return `<article class="basis-card">
      <div class="basis-glyph">${glyph(info.hex.bits)}</div>
      <div class="basis-meta"><small>${esc(dateLabel(info))} · ${info.tab.unit}의 기준괘</small><div class="basis-ganji">${C.toKoreanGanji(info.ganji)}${info.tab.unit} <small>${info.ganji}</small></div><div class="basis-name">${info.hex.name}<span class="basis-han">${info.hex.han}</span></div></div>
      <div class="basis-unicode" aria-hidden="true">${info.hex.unicode}</div>
    </article>`;
  }

  function hexCard(item) {
    const h = item.hex;
    return `<article class="hex-card" data-unicode="${h.unicode}">
      <div class="card-pillar"><span>${item.label}</span><span>${C.toKoreanGanji(item.ganji)} · ${item.ganji}</span></div>
      <div class="card-body"><div class="hex-glyph">${glyph(h.bits)}</div><div class="card-name"><strong>${h.name}</strong><span>No.${String(h.number).padStart(2, "0")} · ${h.han}</span></div></div>
      <div class="trigram-pair"><span>상 ${h.upper.han} ${h.upper.ko}</span><span>하 ${h.lower.han} ${h.lower.ko}</span></div>
    </article>`;
  }

  function resultsGroup(title, formula, items) {
    return `<section class="panel results-panel"><div class="section-head"><div><div class="eyebrow">Four combinations</div><h2>${title}</h2></div><p class="formula">${formula}</p></div><div class="hex-grid">${items.map(hexCard).join("")}</div></section>`;
  }

  function renderMain() {
    const pillars = birthPillars();
    if (!pillars) {
      return `<main class="main"><section class="panel empty-state"><div class="symbol">☰ ☷</div><h2>먼저 생일을 저장해 주세요</h2><p>사주 네 기둥을 괘로 바꾼 뒤, 선택한 운의 괘와 교차해 여덟 괘를 계산합니다.</p></section></main>`;
    }

    const info = periodInfo();
    const mixed = C.mixFortunes(info.hex, pillars);
    const counts = C.countHexagrams([mixed.upperFromBirth, mixed.upperFromPeriod]);
    return `<main class="main">
      <section class="panel period-panel">
        <div class="period-control"><div class="eyebrow">Period selector</div><h2 class="period-title">${info.tab.label}</h2><div class="period-actions">${periodInput(info)}<button class="secondary" id="resetPeriod" type="button">오늘</button></div></div>
        ${basisCard(info)}
      </section>
      <section class="panel counts-panel"><div class="section-head"><h2>괘 출현 횟수</h2><p>두 조합식에서 나온 여덟 괘를 합산했습니다.</p></div><div class="counts">${counts.map(({ hex, count }) => `<span class="count-chip">${hex.name}<strong>${count}</strong></span>`).join("")}</div></section>
      ${resultsGroup("내 상괘 + 운의 하괘", `사주 각 괘의 상괘 · ${C.toKoreanGanji(info.ganji)}${info.tab.unit} 괘의 하괘`, mixed.upperFromBirth)}
      ${resultsGroup("운의 상괘 + 내 하괘", `${C.toKoreanGanji(info.ganji)}${info.tab.unit} 괘의 상괘 · 사주 각 괘의 하괘`, mixed.upperFromPeriod)}
      <div class="footer-note">간지는 절기 기준으로 계산합니다. 월 운세의 간지는 선택한 기준일의 절입 전후에 따라 달라질 수 있습니다.</div>
    </main>`;
  }

  function render() {
    const root = document.getElementById("app");
    root.innerHTML = `<header class="topbar"><div class="brand"><div class="brand-mark">易</div><div><h1>간지괘운</h1><p>干支卦運 · GANJI HEXAGRAM FORTUNE</p></div></div><div class="privacy">절기 기준 사주 · 60갑자 배괘 · 브라우저 로컬 저장</div></header><div class="layout">${renderSidebar()}${renderMain()}</div>`;
    bindEvents();
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function saveProfile(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const date = form.elements.namedItem("birthDate").value;
    const time = form.elements.namedItem("birthTime").value;
    const error = document.getElementById("formError");
    if (!date || !time) { error.textContent = "생일과 출생 시각을 모두 입력해 주세요."; return; }
    try {
      pillarsAt(parseDateTime(`${date}T${time}`));
      state.profile = { date, time };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile));
      render();
      showToast("사주를 이 브라우저에 저장했습니다.");
    } catch (e) {
      error.textContent = "날짜를 계산할 수 없습니다. 입력값을 확인해 주세요.";
    }
  }

  function resetPeriod() {
    if (state.tab === "year") state.period.year = String(now.getFullYear());
    else if (state.tab === "time") state.period.time = currentDateTime;
    else state.period[state.tab] = today;
    render();
  }

  function updatePeriod(value) {
    if (!value) return;
    state.period[state.tab] = value;
    try { render(); } catch (_) { showToast("선택한 날짜를 계산할 수 없습니다."); }
  }

  function bindEvents() {
    document.getElementById("profileForm")?.addEventListener("submit", saveProfile);
    document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => { state.tab = button.dataset.tab; render(); }));
    document.getElementById("periodValue")?.addEventListener("change", (e) => updatePeriod(e.target.value));
    document.getElementById("resetPeriod")?.addEventListener("click", resetPeriod);
  }

  try {
    render();
  } catch (error) {
    document.getElementById("app").innerHTML = `<section class="panel empty-state"><h2>앱을 불러오지 못했습니다</h2><p>${esc(error.message)}</p></section>`;
  }
})();
