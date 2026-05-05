// I Ching Dictionary
const { useState, useMemo, useEffect, useRef } = React;

// ─── 팔괘 (lines[0]=초효/하단, lines[2]=상효/상단) ────────────────────────
const TRIGRAMS = [
  { id:1, name:"건", han:"乾", en:"Heaven",   lines:[1,1,1] },
  { id:2, name:"태", han:"兌", en:"Lake",     lines:[1,1,0] },
  { id:3, name:"리", han:"離", en:"Fire",     lines:[1,0,1] },
  { id:4, name:"진", han:"震", en:"Thunder",  lines:[1,0,0] },
  { id:5, name:"손", han:"巽", en:"Wind",     lines:[0,1,1] },
  { id:6, name:"감", han:"坎", en:"Water",    lines:[0,1,0] },
  { id:7, name:"간", han:"艮", en:"Mountain", lines:[0,0,1] },
  { id:8, name:"곤", han:"坤", en:"Earth",    lines:[0,0,0] },
];

// ─── LOOKUP (상괘id-하괘id → 괘 번호) ────────────────────────────────────
const LOOKUP = {
  "1-1":1,  "1-2":10, "1-3":13, "1-4":25, "1-5":44, "1-6":6,  "1-7":33, "1-8":12,
  "2-1":43, "2-2":58, "2-3":49, "2-4":17, "2-5":28, "2-6":47, "2-7":31, "2-8":45,
  "3-1":14, "3-2":38, "3-3":30, "3-4":21, "3-5":50, "3-6":64, "3-7":56, "3-8":35,
  "4-1":34, "4-2":54, "4-3":55, "4-4":51, "4-5":32, "4-6":40, "4-7":62, "4-8":16,
  "5-1":9,  "5-2":61, "5-3":37, "5-4":42, "5-5":57, "5-6":59, "5-7":53, "5-8":20,
  "6-1":5,  "6-2":60, "6-3":63, "6-4":3,  "6-5":48, "6-6":29, "6-7":39, "6-8":8,
  "7-1":26, "7-2":41, "7-3":22, "7-4":27, "7-5":18, "7-6":4,  "7-7":52, "7-8":23,
  "8-1":11, "8-2":19, "8-3":36, "8-4":24, "8-5":46, "8-6":7,  "8-7":15, "8-8":2,
};

// 역방향: 괘 번호 → 상괘/하괘 ID
const HEX_TO_TRIGRAMS = {};
for (const [key, num] of Object.entries(LOOKUP)) {
  const [u, l] = key.split("-").map(Number);
  HEX_TO_TRIGRAMS[num] = { upperId:u, lowerId:l };
}

// ─── 플레이스홀더 ─────────────────────────────────────────────────────────
const PLACEHOLDER = {
  "1-1": {
    number:1,
    name:{ han:"乾", ko:"중천건", en:"The Creative" },
    judgment:{
      han:"乾。元亨利貞。",
      en:"THE CREATIVE works sublime success, furthering through perseverance.",
      ko:"건은 크게 형통하고, 바르게 함이 이로우니라.",
    },
    lines:[
      { han:"初九：潛龍勿用。",      en:"Hidden dragon. Do not act.",                  ko:"잠긴 용이니 쓰지 말지니라." },
      { han:"九二：見龍在田，利見大人。", en:"Dragon appearing in the field.",          ko:"나타난 용이 밭에 있으니, 대인을 봄이 이로우니라." },
      { han:"九三：君子終日乾乾，夕惕若，厲，無咎。", en:"All day long the superior man is creatively active.", ko:"종일토록 굳세고 굳세어, 위태로우나 허물이 없으리라." },
      { han:"九四：或躍在淵，無咎。", en:"Wavering flight over the depths. No blame.", ko:"혹 뛰어 못에 있으면, 허물이 없으리라." },
      { han:"九五：飛龍在天，利見大人。", en:"Flying dragon in the heavens.",           ko:"나는 용이 하늘에 있으니, 대인을 봄이 이로우니라." },
      { han:"上九：亢龍有悔。",      en:"Arrogant dragon will have cause to repent.",  ko:"끝까지 올라간 용이니, 후회가 있으리라." },
    ],
  },
};

// ─── UI 다국어 문자열 (콘텐츠가 아닌 레이블만) ───────────────────────────
const T = {
  ko:{
    upperLabel:"상괘 · UPPER", upperSub:"위에 놓일 괘를 선택",
    lowerLabel:"하괘 · LOWER", lowerSub:"아래에 놓일 괘를 선택",
    swap:"↑↓ 위아래 바꾸기", reset:"초기화",
    judgment:"괘사 · THE JUDGMENT",
    linesLabel:"효 · LINES", lineHint:"효를 클릭하면 효사를 봅니다",
    search:"검색", searchPlaceholder:"괘명, 괘사, 효사 검색…",
    searchTitle:"검색 결과", noResults:"검색 결과가 없습니다",
    selectTitle:"상괘와 하괘를 선택하세요",
    selectSub:"Select an upper and lower trigram to reveal the hexagram.",
    pairUp:"상", pairDown:"하",
    lineNum:function(i){ return ["初","二","三","四","五","上"][i]+"효"; },
    lineEyebrow:function(i){ return "효사 · "+["初","二","三","四","五","上"][i]+"효"; },
    lineCount:function(i){ return (i+1)+"효"; },
    judgmentTag:"괘사", close:"닫기", backToLines:"← 효 목록으로",
  },
  en:{
    upperLabel:"UPPER TRIGRAM", upperSub:"Select the upper trigram",
    lowerLabel:"LOWER TRIGRAM", lowerSub:"Select the lower trigram",
    swap:"↑↓ Swap", reset:"Reset",
    judgment:"THE JUDGMENT",
    linesLabel:"LINES", lineHint:"Click a line to read its text",
    search:"Search", searchPlaceholder:"Search hexagrams, judgments, lines…",
    searchTitle:"Search Results", noResults:"No results found",
    selectTitle:"Select upper and lower trigrams",
    selectSub:"Choose a trigram pair to reveal the hexagram.",
    pairUp:"U", pairDown:"L",
    lineNum:function(i){ return "Line "+(i+1); },
    lineEyebrow:function(i){ return "LINE "+(i+1); },
    lineCount:function(i){ return "Line "+(i+1); },
    judgmentTag:"Judgment", close:"Close", backToLines:"← Back to lines",
  },
  zh:{
    upperLabel:"上卦", upperSub:"請選擇上卦",
    lowerLabel:"下卦", lowerSub:"請選擇下卦",
    swap:"↑↓ 互換", reset:"重置",
    judgment:"卦辭",
    linesLabel:"爻辭", lineHint:"點擊爻位查看爻辭",
    search:"搜索", searchPlaceholder:"搜索卦名、卦辭、爻辭…",
    searchTitle:"搜索結果", noResults:"無搜索結果",
    selectTitle:"請選擇上卦與下卦",
    selectSub:"選擇上下卦以顯示卦象。",
    pairUp:"上", pairDown:"下",
    lineNum:function(i){ return ["初","二","三","四","五","上"][i]+"爻"; },
    lineEyebrow:function(i){ return ["初","二","三","四","五","上"][i]+"爻"; },
    lineCount:function(i){ return (i+1)+"爻"; },
    judgmentTag:"卦辭", close:"關閉", backToLines:"← 返回爻列表",
  },
};

// ─── 데이터 로딩 훅 ───────────────────────────────────────────────────────
function useIChingData() {
  const [ready, setReady] = useState(!!window.IChingData);
  useEffect(function() {
    if (window.IChingData) { setReady(true); return; }
    function onReady() { setReady(true); }
    window.addEventListener("ichingready", onReady);
    return function() { window.removeEventListener("ichingready", onReady); };
  }, []);
  return ready ? window.IChingData : PLACEHOLDER;
}

// ─── 팔괘 그림 ───────────────────────────────────────────────────────────
function TrigramGlyph(props) {
  var lines = props.lines;
  var size = props.size || 32;
  var gap = props.gap || 4;
  var thick = props.thick || 4;
  var visual = lines.slice().reverse();
  return (
    <div className="trigram-glyph" style={{gap:gap}}>
      {visual.map(function(v, i) {
        return (
          <div key={i} className="trigram-row" style={{width:size, height:thick}}>
            {v === 1
              ? <div className="bar solid" />
              : <React.Fragment><div className="bar half" /><div className="bar half" /></React.Fragment>}
          </div>
        );
      })}
    </div>
  );
}

// ─── 육효 그림 ───────────────────────────────────────────────────────────
function HexagramGlyph(props) {
  var upper = props.upper;
  var lower = props.lower;
  var size = props.size || 56;
  var thick = props.thick || 5;
  var gap = props.gap || 5;
  var activeIndex = props.activeIndex !== undefined ? props.activeIndex : -1;
  var stack = lower.concat(upper); // 0=초효(하단) ~ 5=상효(상단)
  var visual = stack.map(function(v, idx) { return {v:v, idx:idx}; }).reverse();
  return (
    <div className="hex-glyph" style={{gap:gap}}>
      {visual.map(function(item) {
        return (
          <div key={item.idx}
            className={"hex-row" + (item.idx === activeIndex ? " active" : "")}
            style={{width:size, height:thick}}>
            {item.v === 1
              ? <div className="bar solid" />
              : <React.Fragment><div className="bar half" /><div className="bar half" /></React.Fragment>}
          </div>
        );
      })}
    </div>
  );
}

// ─── 팔괘 선택 카드 ──────────────────────────────────────────────────────
function TrigramPicker(props) {
  var label = props.label;
  var sublabel = props.sublabel;
  var value = props.value;
  var onChange = props.onChange;
  return (
    <div className="picker">
      <div className="picker-head">
        <div className="picker-eyebrow">{label}</div>
        <div className="picker-title">{sublabel}</div>
      </div>
      <div className="picker-grid">
        {TRIGRAMS.map(function(t) {
          return (
            <button key={t.id}
              className={"trigram-card" + (value && value.id === t.id ? " selected" : "")}
              onClick={function() { onChange(t); }}>
              <TrigramGlyph lines={t.lines} size={42} thick={4} gap={4} />
              <div className="trigram-meta">
                <div className="trigram-han">{t.han}</div>
                <div className="trigram-name">{t.name}</div>
                <div className="trigram-en">{t.en}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 본문 블록 (항상 한문+영문+한글 모두 표시) ───────────────────────────
function PassageBlock(props) {
  return (
    <div className="passage">
      <div className="passage-han">{props.han}</div>
      <div className="passage-en">{props.en}</div>
      <div className="passage-ko">{props.ko}</div>
    </div>
  );
}

// ─── 효 섹션 (목록 ↔ 효사 전환) ──────────────────────────────────────────
function LinesSection(props) {
  var hex = props.hex;
  var activeLine = props.activeLine;
  var setActiveLine = props.setActiveLine;
  var t = props.t;

  // 효사 상세 보기
  if (activeLine >= 0 && hex.lines[activeLine]) {
    var l = hex.lines[activeLine];
    return (
      <div className="line-rail">
        <div className="rail-head rail-head-detail">
          <button className="back-btn" onClick={function() { setActiveLine(-1); }}>
            {t.backToLines}
          </button>
          <span className="eyebrow">{t.lineEyebrow(activeLine)}</span>
        </div>
        <div className="line-detail-inner">
          <PassageBlock han={l.han} en={l.en} ko={l.ko} />
        </div>
      </div>
    );
  }

  // 6효 목록
  var items = hex.lines.map(function(l, i) { return {l:l, i:i}; }).reverse();
  return (
    <div className="line-rail">
      <div className="rail-head">
        <span className="eyebrow">
          {t.linesLabel}
          <span className="rail-hint"> — {t.lineHint}</span>
        </span>
      </div>
      <div className="rail-list">
        {items.map(function(item) {
          var isYang = /[九]/.test((item.l.han || "").split("：")[0]);
          return (
            <button key={item.i} className="line-item"
              onClick={function() { setActiveLine(item.i); }}>
              <span className="line-num">{["初","二","三","四","五","上"][item.i]}</span>
              <span className="line-stroke">
                {isYang
                  ? <span className="stroke solid" />
                  : <span className="stroke broken" />}
              </span>
              <span className="line-label">{t.lineCount(item.i)}</span>
              <span className="line-preview">
                {(item.l.han || "").split("：")[1] || item.l.han}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 검색 패널 ───────────────────────────────────────────────────────────
function SearchPanel(props) {
  var data = props.data;
  var onNavigate = props.onNavigate;
  var onClose = props.onClose;
  var lang = props.lang;
  var t = T[lang];

  var [query, setQuery] = useState("");
  var inputRef = useRef(null);

  useEffect(function() {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  var results = useMemo(function() {
    var q = query.trim().toLowerCase();
    if (!q || !data || data === PLACEHOLDER) return [];
    var found = [];
    var seen = {};
    var entries = Object.values(data);
    for (var ei = 0; ei < entries.length; ei++) {
      var hex = entries[ei];
      if (seen[hex.number]) continue;
      seen[hex.number] = true;
      var nameStr = (hex.name.han + " " + hex.name.ko + " " + hex.name.en).toLowerCase();
      if (nameStr.indexOf(q) >= 0) {
        found.push({ hex:hex, type:"name", snippet:"" });
        continue;
      }
      var judgeStr = (hex.judgment.han + " " + hex.judgment.en + " " + hex.judgment.ko).toLowerCase();
      if (judgeStr.indexOf(q) >= 0) {
        found.push({ hex:hex, type:"judgment", snippet:hex.judgment.ko });
        continue;
      }
      for (var li = 0; li < hex.lines.length; li++) {
        var line = hex.lines[li];
        var lineStr = (line.han + " " + line.en + " " + line.ko).toLowerCase();
        if (lineStr.indexOf(q) >= 0) {
          found.push({ hex:hex, type:"line", lineIndex:li, snippet:line.ko });
        }
      }
    }
    found.sort(function(a, b) { return a.hex.number - b.hex.number; });
    return found.slice(0, 40);
  }, [query, data]);

  function handleSelect(result) {
    var trig = HEX_TO_TRIGRAMS[result.hex.number];
    if (trig) onNavigate(trig.upperId, trig.lowerId);
    onClose();
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="search-overlay" onClick={handleOverlayClick}>
      <div className="search-panel">
        <div className="search-head">
          <div className="search-input-wrap">
            <span className="search-icon">⊕</span>
            <input ref={inputRef} className="search-input" type="text"
              placeholder={t.searchPlaceholder} value={query}
              onChange={function(e) { setQuery(e.target.value); }}
              onKeyDown={function(e) { if (e.key === "Escape") onClose(); }} />
            {query
              ? <button className="search-clear" onClick={function() { setQuery(""); }}>✕</button>
              : null}
          </div>
          <button className="search-close-btn" onClick={onClose}>{t.close}</button>
        </div>
        <div className="search-results">
          {query && results.length === 0
            ? <div className="search-empty">{t.noResults}</div>
            : null}
          {results.map(function(r, i) {
            return (
              <button key={i} className="search-result-item"
                onClick={function() { handleSelect(r); }}>
                <div className="result-meta">
                  <span className="result-num">No.{String(r.hex.number).padStart(2,"0")}</span>
                  <span className="result-name">{r.hex.name.han}</span>
                  <span className="result-ko">{r.hex.name.ko}</span>
                  {r.type !== "name"
                    ? <span className="result-tag">
                        {r.type === "judgment" ? t.judgmentTag : t.lineNum(r.lineIndex)}
                      </span>
                    : null}
                </div>
                {r.snippet
                  ? <div className="result-snippet">
                      {r.snippet.length > 72 ? r.snippet.slice(0,72)+"…" : r.snippet}
                    </div>
                  : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 상세 패널 ───────────────────────────────────────────────────────────
function DetailPanel(props) {
  var upper = props.upper;
  var lower = props.lower;
  var lang = props.lang;
  var t = T[lang];
  var data = useIChingData();
  var [activeLine, setActiveLine] = useState(-1);
  var key = upper && lower ? (upper.id + "-" + lower.id) : null;
  var hex = key ? data[key] : null;

  useEffect(function() { setActiveLine(-1); }, [key]);

  if (!upper || !lower) {
    return (
      <div className="detail empty">
        <div className="empty-inner">
          <div className="empty-mark">☰<br/>☷</div>
          <div className="empty-title">{t.selectTitle}</div>
          <div className="empty-sub">{t.selectSub}</div>
        </div>
      </div>
    );
  }

  if (!hex) {
    return (
      <div className="detail empty">
        <div className="empty-inner">
          <HexagramGlyph upper={upper.lines} lower={lower.lines} size={80} thick={6} gap={7} />
          <div className="empty-title" style={{marginTop:20}}>{upper.han} / {lower.han}</div>
          <div className="empty-sub" style={{fontSize:12}}>데이터 로딩 중…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail">
      <header className="detail-head">
        <div className="detail-head-left">
          <div className="hex-number">No. {String(hex.number).padStart(2,"0")}</div>
          <h1 className="hex-han">{hex.name.han}</h1>
          <div className="hex-names">
            <span className="hex-ko">{hex.name.ko}</span>
            <span className="dot">·</span>
            <span className="hex-en">{hex.name.en}</span>
          </div>
        </div>
        <div className="detail-head-right">
          <HexagramGlyph
            upper={upper.lines} lower={lower.lines}
            size={80} thick={6} gap={7}
            activeIndex={activeLine === -1 ? -1 : (5 - activeLine)} />
          <div className="trigram-pair">
            <div><span className="pair-label">{t.pairUp}</span>{upper.han}<span className="pair-en"> {upper.en}</span></div>
            <div><span className="pair-label">{t.pairDown}</span>{lower.han}<span className="pair-en"> {lower.en}</span></div>
          </div>
        </div>
      </header>

      <div className="detail-body">
        <section>
          <div className="section-eyebrow">{t.judgment}</div>
          <PassageBlock han={hex.judgment.han} en={hex.judgment.en} ko={hex.judgment.ko} />
        </section>
        <section>
          <LinesSection hex={hex} activeLine={activeLine} setActiveLine={setActiveLine} t={t} />
        </section>
      </div>
    </div>
  );
}

// ─── 앱 루트 ─────────────────────────────────────────────────────────────
function App() {
  var [upper, setUpper] = useState(TRIGRAMS[0]);
  var [lower, setLower] = useState(TRIGRAMS[0]);
  var [lang, setLang] = useState("ko");
  var [searchOpen, setSearchOpen] = useState(false);
  var t = T[lang];
  var data = useIChingData();

  function swap() {
    var u = upper, l = lower;
    setUpper(l);
    setLower(u);
  }
  function reset() { setUpper(null); setLower(null); }
  function handleNavigate(upperId, lowerId) {
    setUpper(TRIGRAMS.find(function(t) { return t.id === upperId; }));
    setLower(TRIGRAMS.find(function(t) { return t.id === lowerId; }));
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">
            <TrigramGlyph lines={[1,1,1]} size={18} thick={2} gap={2} />
            <TrigramGlyph lines={[0,0,0]} size={18} thick={2} gap={2} />
          </div>
          <div className="brand-text">
            <div className="brand-han">周易辭典</div>
            <div className="brand-ko">주역 사전</div>
          </div>
        </div>
        <nav className="app-nav">
          <button className="nav-btn" onClick={function() { setSearchOpen(true); }}>{t.search}</button>
          <div className="lang-switcher">
            {["ko","en","zh"].map(function(l) {
              return (
                <button key={l}
                  className={"lang-btn" + (lang === l ? " active" : "")}
                  onClick={function() { setLang(l); }}>
                  {l === "ko" ? "한" : l === "en" ? "EN" : "漢"}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <TrigramPicker label={t.upperLabel} sublabel={t.upperSub} value={upper} onChange={setUpper} />
          <div className="sidebar-divider">
            <button className="text-btn" onClick={swap}>{t.swap}</button>
            <button className="text-btn" onClick={reset}>{t.reset}</button>
          </div>
          <TrigramPicker label={t.lowerLabel} sublabel={t.lowerSub} value={lower} onChange={setLower} />
        </aside>
        <section className="main-panel">
          <DetailPanel upper={upper} lower={lower} lang={lang} />
        </section>
      </main>

      <footer className="app-footer">
        <span>Wilhelm / Baynes · 한글 번역 · 周易 原文</span>
        <span className="muted">A reading is a mirror, not a map.</span>
      </footer>

      {searchOpen
        ? <SearchPanel data={data} lang={lang} onNavigate={handleNavigate}
            onClose={function() { setSearchOpen(false); }} />
        : null}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
