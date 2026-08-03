(function () {
  "use strict";

  const C = window.GanjiIChingCore;
  const LEGACY_STORAGE_KEY = "ganji-iching-profile-v1";
  const STORAGE_KEY = "ganji-iching-profiles-v2";
  const ACTIVE_KEY = "ganji-iching-active-profile-v2";
  const TABS = {
    lifetime: { symbol: "命", label: "평생 운", small: "사주 각 주의 교차 조합" },
    year: { symbol: "年", label: "연 운세", small: "선택한 해", unit: "년", ganjiKey: "year" },
    month: { symbol: "月", label: "월 운세", small: "선택한 날짜의 절기월", unit: "월", ganjiKey: "month" },
    day: { symbol: "日", label: "일 운세", small: "선택한 날짜", unit: "일", ganjiKey: "day" },
    time: { symbol: "時", label: "시 운세", small: "선택한 시각", unit: "시", ganjiKey: "time" }
  };

  const now = new Date();
  const today = formatDate(now);
  const currentDateTime = formatDateTime(now);
  const loaded = loadProfiles();
  const state = {
    tab: "lifetime",
    profiles: loaded.profiles,
    activeProfileId: loaded.activeProfileId,
    editorProfileId: loaded.activeProfileId,
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
  function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
  function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value || ""); }
  function validTime(value) { return value === "" || /^\d{2}:\d{2}$/.test(value || ""); }
  function newId() { return globalThis.crypto?.randomUUID?.() || `profile-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

  function loadProfiles() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(parsed)) {
        const profiles = parsed.filter((p) => p && p.id && p.name && validDate(p.date) && validTime(p.time || ""));
        const savedActive = localStorage.getItem(ACTIVE_KEY);
        const activeProfileId = profiles.some((p) => p.id === savedActive) ? savedActive : (profiles[0]?.id || null);
        return { profiles, activeProfileId };
      }
    } catch (_) { /* 기존 형식 확인으로 계속 진행 */ }

    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
      if (legacy && validDate(legacy.date) && /^\d{2}:\d{2}$/.test(legacy.time || "")) {
        const migrated = { id: newId(), name: "이름 없음", date: legacy.date, time: legacy.time };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([migrated]));
        localStorage.setItem(ACTIVE_KEY, migrated.id);
        return { profiles: [migrated], activeProfileId: migrated.id };
      }
    } catch (_) { /* 저장값이 없거나 손상된 경우 빈 목록 사용 */ }
    return { profiles: [], activeProfileId: null };
  }

  function persistProfiles() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profiles));
    if (state.activeProfileId) localStorage.setItem(ACTIVE_KEY, state.activeProfileId);
    else localStorage.removeItem(ACTIVE_KEY);
  }

  function activeProfile() { return state.profiles.find((p) => p.id === state.activeProfileId) || null; }
  function editorProfile() { return state.profiles.find((p) => p.id === state.editorProfileId) || null; }

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
    const profile = activeProfile();
    if (!profile) return null;
    const parts = profile.time
      ? parseDateTime(`${profile.date}T${profile.time}`)
      : { ...parseDate(profile.date), hour: 12, minute: 0 };
    return C.makeBirthPillars(pillarsAt(parts), Boolean(profile.time));
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

  function profileSummary(pillars, profile) {
    if (!pillars || !profile) return "";
    const rows = pillars.map((p) => `<div class="pillar-mini"><span class="label">${p.label}</span><span class="ganji">${C.toKoreanGanji(p.ganji)} <small>${p.ganji}</small></span><span class="hex">${p.hex.name}</span></div>`).join("");
    return rows + (!profile.time ? `<div class="unknown-time">출생 시각 미입력 · 연주·월주·일주만 계산</div>` : "");
  }

  function peopleList() {
    if (!state.profiles.length) return `<p class="people-empty">아직 저장된 인물이 없습니다.</p>`;
    return `<div class="people-list">${state.profiles.map((p) => `<button class="person ${p.id === state.activeProfileId ? "active" : ""}" type="button" data-profile-id="${esc(p.id)}"><span><strong>${esc(p.name)}</strong><small>${esc(p.date)}${p.time ? ` · ${esc(p.time)}` : " · 시간 미상"}</small></span><span class="person-arrow">›</span></button>`).join("")}</div>`;
  }

  function renderSidebar() {
    const profile = activeProfile();
    const editing = editorProfile();
    const pillars = birthPillars();
    return `
      <aside class="sidebar">
        <section class="panel profile-panel">
          <div class="people-heading"><div><div class="eyebrow">Saved people</div><h2>저장된 인물</h2></div><button class="mini-button" id="newProfile" type="button">+ 새 인물</button></div>
          ${peopleList()}
          <div class="profile-divider"></div>
          <div class="eyebrow">Birth profile</div>
          <h2>${editing ? "인물 정보 수정" : "새 사주 저장"}</h2>
          <p class="helper">이름과 양력 생일을 입력하세요. 출생 시각은 모르면 비워두셔도 됩니다.</p>
          <form id="profileForm">
            <div class="field"><label for="profileName">이름</label><input id="profileName" name="profileName" type="text" maxlength="30" autocomplete="off" required value="${esc(editing?.name || "")}" placeholder="예: 석용"></div>
            <div class="field"><label for="birthDate">양력 생일</label><input id="birthDate" name="birthDate" type="date" min="1900-01-01" max="2100-12-31" required value="${esc(editing?.date || "")}"></div>
            <div class="field"><label for="birthTime">출생 시각 <span class="optional">선택 사항</span></label><input id="birthTime" name="birthTime" type="time" value="${esc(editing?.time || "")}"></div>
            <button class="primary" type="submit">${editing ? "이 인물 정보 수정" : "새 인물로 저장"}</button>
            ${editing ? `<button class="danger-button" id="deleteProfile" type="button">이 인물 삭제</button>` : ""}
            <p class="form-error" id="formError" role="alert"></p>
          </form>
          <div class="birth-summary ${pillars ? "show" : ""}" id="birthSummary">${profileSummary(pillars, profile)}</div>
        </section>
        <section class="panel tabs-panel">
          <nav class="tabs" aria-label="운세 기간">
            ${Object.entries(TABS).map(([key, item]) => `<button class="tab ${state.tab === key ? "active" : ""}" type="button" data-tab="${key}" aria-current="${state.tab === key ? "page" : "false"}"><span class="tab-symbol">${item.symbol}</span><span><strong>${item.label}</strong><small>${item.small}</small></span></button>`).join("")}
          </nav>
        </section>
      </aside>`;
  }

  function periodInput() {
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
    const source = item.upperSource
      ? `${C.toKoreanGanji(item.upperSource.ganji)} · ${C.toKoreanGanji(item.lowerSource.ganji)}`
      : `${C.toKoreanGanji(item.ganji)} · ${item.ganji}`;
    return `<article class="hex-card" data-unicode="${h.unicode}">
      <div class="card-pillar"><span>${item.label}</span><span>${source}</span></div>
      <div class="card-body"><div class="hex-glyph">${glyph(h.bits)}</div><div class="card-name"><strong>${h.name}</strong><span>No.${String(h.number).padStart(2, "0")} · ${h.han}</span></div></div>
      <div class="trigram-pair"><span>상 ${h.upper.han} ${h.upper.ko}</span><span>하 ${h.lower.han} ${h.lower.ko}</span></div>
    </article>`;
  }

  function countsPanel(counts, total, description) {
    return `<section class="panel counts-panel"><div class="section-head"><h2>괘 출현 횟수</h2><p>${description} 총 ${total}개 조합입니다.</p></div><div class="counts">${counts.map(({ hex, count }) => `<span class="count-chip">${hex.name}<strong>${count}</strong></span>`).join("")}</div></section>`;
  }

  function resultsGroup(title, formula, items) {
    return `<section class="panel results-panel"><div class="section-head"><div><div class="eyebrow">${items.length} combinations</div><h2>${title}</h2></div><p class="formula">${formula}</p></div><div class="hex-grid">${items.map(hexCard).join("")}</div></section>`;
  }

  function renderLifetime(profile, pillars) {
    const combinations = C.lifetimeFortunes(pillars);
    const counts = C.countHexagrams([combinations]);
    const pillarText = pillars.map((p) => p.label).join("·");
    return `<main class="main">
      <section class="panel lifetime-intro">
        <div><div class="eyebrow">Lifetime fortune</div><h2>${esc(profile.name)}님의 평생 운</h2><p>${pillarText}의 상괘와 서로 다른 주의 하괘를 교차해 계산합니다.</p></div>
        <div class="lifetime-formula"><strong>${pillars.length}주 × 나머지 ${pillars.length - 1}주</strong><span>${combinations.length}개 고유 조합</span></div>
      </section>
      ${countsPanel(counts, combinations.length, "평생 운에서 나온 괘를 합산했습니다.")}
      ${resultsGroup("평생 운 괘 조합", "각 주의 상괘 + 나머지 주의 하괘", combinations)}
      <div class="footer-note">참조 이미지의 A-B′ 조합법을 적용했습니다. 출생 시각이 없으면 시주를 제외합니다.</div>
    </main>`;
  }

  function renderPeriod(pillars) {
    const info = periodInfo();
    const mixed = C.mixFortunes(info.hex, pillars);
    const counts = C.countHexagrams([mixed.upperFromBirth, mixed.upperFromPeriod]);
    const total = pillars.length * 2;
    return `<main class="main">
      <section class="panel period-panel">
        <div class="period-control"><div class="eyebrow">Period selector</div><h2 class="period-title">${info.tab.label}</h2><div class="period-actions">${periodInput()}<button class="secondary" id="resetPeriod" type="button">오늘</button></div></div>
        ${basisCard(info)}
      </section>
      ${countsPanel(counts, total, "두 조합식에서 나온 괘를 합산했습니다.")}
      ${resultsGroup("내 상괘 + 운의 하괘", `사주 각 괘의 상괘 · ${C.toKoreanGanji(info.ganji)}${info.tab.unit} 괘의 하괘`, mixed.upperFromBirth)}
      ${resultsGroup("운의 상괘 + 내 하괘", `${C.toKoreanGanji(info.ganji)}${info.tab.unit} 괘의 상괘 · 사주 각 괘의 하괘`, mixed.upperFromPeriod)}
      <div class="footer-note">간지는 절기 기준으로 계산합니다. 월 운세의 간지는 선택한 기준일의 절입 전후에 따라 달라질 수 있습니다.</div>
    </main>`;
  }

  function renderMain() {
    const profile = activeProfile();
    const pillars = birthPillars();
    if (!profile || !pillars) {
      return `<main class="main"><section class="panel empty-state"><div class="symbol">☰ ☷</div><h2>인물을 선택하거나 새로 저장해 주세요</h2><p>이름과 생일을 저장하면 평생 운과 연·월·일·시 운세를 계산합니다.</p></section></main>`;
    }
    return state.tab === "lifetime" ? renderLifetime(profile, pillars) : renderPeriod(pillars);
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
    const name = form.elements.namedItem("profileName").value.trim();
    const date = form.elements.namedItem("birthDate").value;
    const time = form.elements.namedItem("birthTime").value;
    const error = document.getElementById("formError");
    if (!name || !date) { error.textContent = "이름과 생일을 입력해 주세요."; return; }
    try {
      const parts = time ? parseDateTime(`${date}T${time}`) : { ...parseDate(date), hour: 12, minute: 0 };
      pillarsAt(parts);
      const id = state.editorProfileId || newId();
      const saved = { id, name, date, time };
      const index = state.profiles.findIndex((p) => p.id === id);
      if (index >= 0) state.profiles[index] = saved;
      else state.profiles.push(saved);
      state.activeProfileId = id;
      state.editorProfileId = id;
      persistProfiles();
      render();
      showToast(`${name}님의 사주를 저장했습니다.`);
    } catch (_) {
      error.textContent = "날짜를 계산할 수 없습니다. 입력값을 확인해 주세요.";
    }
  }

  function selectProfile(id) {
    if (!state.profiles.some((p) => p.id === id)) return;
    state.activeProfileId = id;
    state.editorProfileId = id;
    persistProfiles();
    render();
  }

  function startNewProfile() {
    state.activeProfileId = null;
    state.editorProfileId = null;
    persistProfiles();
    render();
  }

  function deleteProfile() {
    const profile = editorProfile();
    if (!profile || !window.confirm(`${profile.name}님의 저장 정보를 삭제할까요?`)) return;
    state.profiles = state.profiles.filter((p) => p.id !== profile.id);
    state.activeProfileId = state.profiles[0]?.id || null;
    state.editorProfileId = state.activeProfileId;
    persistProfiles();
    render();
    showToast("저장된 인물을 삭제했습니다.");
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
    document.getElementById("newProfile")?.addEventListener("click", startNewProfile);
    document.getElementById("deleteProfile")?.addEventListener("click", deleteProfile);
    document.querySelectorAll("[data-profile-id]").forEach((button) => button.addEventListener("click", () => selectProfile(button.dataset.profileId)));
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
