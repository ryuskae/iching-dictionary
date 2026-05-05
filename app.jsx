// I Ching Dictionary — UI only. Hexagram/line data is loaded from `data` global,
// which the user said they already have. We provide a tiny placeholder so the UI
// is functional in isolation; replace `window.IChingData` to plug in the real set.

const { useState, useMemo, useEffect, useRef } = React;

// ----- Trigrams -----
// Order: Heaven, Lake, Fire, Thunder, Wind, Water, Mountain, Earth (King Wen / Wilhelm)
const TRIGRAMS = [
  { id: 1, name: "건", han: "乾", en: "Heaven",   lines: [1,1,1] },
  { id: 2, name: "태", han: "兌", en: "Lake",     lines: [0,1,1] },
  { id: 3, name: "리", han: "離", en: "Fire",     lines: [1,0,1] },
  { id: 4, name: "진", han: "震", en: "Thunder",  lines: [0,0,1] },
  { id: 5, name: "손", han: "巽", en: "Wind",     lines: [1,1,0] },
  { id: 6, name: "감", han: "坎", en: "Water",    lines: [0,1,0] },
  { id: 7, name: "간", han: "艮", en: "Mountain", lines: [1,0,0] },
  { id: 8, name: "곤", han: "坤", en: "Earth",    lines: [0,0,0] },
];

// Sample data shape — replace with the user's real data.
// `key` is "upper-lower" (1..8 each). lines[0] is the BOTTOM line (line 1).
const PLACEHOLDER = {
  "1-1": {
    number: 1,
    name: { han: "乾", ko: "중천건", en: "The Creative" },
    judgment: {
      han: "乾、元亨利貞。",
      en: "THE CREATIVE works sublime success, furthering through perseverance.",
      ko: "건은 크게 형통하고, 바르게 함이 이로우니라.",
    },
    image: {
      han: "天行健，君子以自強不息。",
      en: "The movement of heaven is full of power. Thus the superior man makes himself strong and untiring.",
      ko: "하늘의 운행이 굳세니, 군자는 이로써 스스로 강건하여 쉬지 아니한다.",
    },
    lines: [
      { han: "初九：潛龍勿用。", en: "Nine at the beginning: Hidden dragon. Do not act.", ko: "초구. 잠긴 용이니 쓰지 말지니라." },
      { han: "九二：見龍在田，利見大人。", en: "Nine in the second place: Dragon appearing in the field. It furthers one to see the great man.", ko: "구이. 나타난 용이 밭에 있으니, 대인을 봄이 이로우니라." },
      { han: "九三：君子終日乾乾，夕惕若，厲，無咎。", en: "Nine in the third place: All day long the superior man is creatively active. At nightfall his mind is still beset with cares. Danger. No blame.", ko: "구삼. 군자가 종일토록 굳세고 굳세어, 저녁에도 두려워하면, 위태로우나 허물이 없으리라." },
      { han: "九四：或躍在淵，無咎。", en: "Nine in the fourth place: Wavering flight over the depths. No blame.", ko: "구사. 혹 뛰어 못에 있으면, 허물이 없으리라." },
      { han: "九五：飛龍在天，利見大人。", en: "Nine in the fifth place: Flying dragon in the heavens. It furthers one to see the great man.", ko: "구오. 나는 용이 하늘에 있으니, 대인을 봄이 이로우니라." },
      { han: "上九：亢龍有悔。", en: "Nine at the top: Arrogant dragon will have cause to repent.", ko: "상구. 끝까지 올라간 용이니, 후회가 있으리라." },
    ],
  },
  "8-8": {
    number: 2,
    name: { han: "坤", ko: "중지곤", en: "The Receptive" },
    judgment: {
      han: "坤、元亨，利牝馬之貞。君子有攸往，先迷後得主，利。西南得朋，東北喪朋。安貞吉。",
      en: "THE RECEPTIVE brings about sublime success, furthering through the perseverance of a mare. If the superior man undertakes something and tries to lead, he goes astray; but if he follows, he finds guidance.",
      ko: "곤은 크게 형통하고, 암말의 바름이 이로우니라. 군자가 갈 바를 둠에, 먼저 하면 아득하고 뒤에 하면 얻으리니, 주장됨이 이로우니라.",
    },
    image: {
      han: "地勢坤，君子以厚德載物。",
      en: "The earth's condition is receptive devotion. Thus the superior man who has breadth of character carries the outer world.",
      ko: "땅의 형세가 곤이니, 군자는 이로써 두터운 덕으로 만물을 싣는다.",
    },
    lines: [
      { han: "初六：履霜，堅冰至。", en: "Six at the beginning: When there is hoarfrost underfoot, solid ice is not far off.", ko: "초육. 서리를 밟으면, 단단한 얼음이 이르느니라." },
      { han: "六二：直方大，不習無不利。", en: "Six in the second place: Straight, square, great. Without purpose, yet nothing remains unfurthered.", ko: "육이. 곧고 모지고 큰지라, 익히지 아니하여도 이롭지 않음이 없느니라." },
      { han: "六三：含章可貞。", en: "Six in the third place: Hidden lines. One is able to remain persevering.", ko: "육삼. 빛남을 머금어 가히 바를 수 있으니." },
      { han: "六四：括囊，無咎無譽。", en: "Six in the fourth place: A tied-up sack. No blame, no praise.", ko: "육사. 주머니를 묶듯이 하면, 허물도 없고 명예도 없으리라." },
      { han: "六五：黃裳元吉。", en: "Six in the fifth place: A yellow lower garment brings supreme good fortune.", ko: "육오. 누런 치마면 크게 길하리라." },
      { han: "上六：龍戰於野，其血玄黃。", en: "Six at the top: Dragons fight in the meadow. Their blood is black and yellow.", ko: "상육. 용이 들에서 싸우니, 그 피가 검고 누르도다." },
    ],
  },
};

// data-loader.js가 iching.json을 불러오면 'ichingready' 이벤트를 발송합니다.
// 그 이벤트를 감지해 리렌더링을 트리거하는 훅입니다.
function useIChingData() {
  const [ready, setReady] = useState(!!window.IChingData);
  useEffect(() => {
    if (window.IChingData) { setReady(true); return; }
    const onReady = () => setReady(true);
    window.addEventListener('ichingready', onReady);
    return () => window.removeEventListener('ichingready', onReady);
  }, []);
  return ready ? window.IChingData : PLACEHOLDER;
}

// ----- Trigram glyph (drawn from CSS, not SVG) -----
function TrigramGlyph({ lines, size = 32, gap = 4, thick = 4 }) {
  // lines[0] is the BOTTOM line in our data; render top-to-bottom visually.
  const visual = [...lines].reverse();
  return (
    <div className="trigram-glyph" style={{ gap }}>
      {visual.map((v, i) => (
        <div key={i} className="trigram-row" style={{ width: size, height: thick }}>
          {v === 1 ? (
            <div className="bar solid" />
          ) : (
            <>
              <div className="bar half" />
              <div className="bar half" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ----- Hexagram glyph (6 lines) -----
function HexagramGlyph({ upper, lower, size = 56, thick = 5, gap = 5, activeIndex = -1 }) {
  // line 1 (bottom) = lower[0]; line 6 (top) = upper[2]
  const stack = [...lower, ...upper]; // index 0..5 bottom to top
  const visual = stack.map((v, idx) => ({ v, idx })).reverse(); // top first
  return (
    <div className="hex-glyph" style={{ gap }}>
      {visual.map(({ v, idx }) => (
        <div
          key={idx}
          className={"hex-row " + (idx === activeIndex ? "active" : "")}
          style={{ width: size, height: thick }}
        >
          {v === 1 ? (
            <div className="bar solid" />
          ) : (
            <>
              <div className="bar half" />
              <div className="bar half" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// ----- Trigram picker grid -----
function TrigramPicker({ label, sublabel, value, onChange }) {
  return (
    <div className="picker">
      <div className="picker-head">
        <div className="picker-eyebrow">{label}</div>
        <div className="picker-title">{sublabel}</div>
      </div>
      <div className="picker-grid">
        {TRIGRAMS.map((t) => {
          const selected = value && value.id === t.id;
          return (
            <button
              key={t.id}
              className={"trigram-card " + (selected ? "selected" : "")}
              onClick={() => onChange(t)}
            >
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

// ----- Detail panel -----
function PassageBlock({ han, en, ko, eyebrow }) {
  return (
    <div className="passage">
      {eyebrow && <div className="passage-eyebrow">{eyebrow}</div>}
      <div className="passage-han">{han}</div>
      <div className="passage-en">{en}</div>
      <div className="passage-ko">{ko}</div>
    </div>
  );
}

function LineRail({ hex, activeLine, onPick }) {
  // hex.lines[0] is line 1 (bottom). Render top-to-bottom for the rail.
  const items = hex.lines.map((l, i) => ({ l, i })).reverse();
  return (
    <div className="line-rail">
      <div className="rail-head">
        <span className="eyebrow">효 · LINES</span>
        <span className="rail-hint">효를 선택하면 효사를 볼 수 있습니다</span>
      </div>
      <div className="rail-list">
        {items.map(({ l, i }) => {
          const isActive = activeLine === i;
          return (
            <button
              key={i}
              className={"line-item " + (isActive ? "active" : "")}
              onClick={() => onPick(isActive ? -1 : i)}
            >
              <span className="line-num">{["初","二","三","四","五","上"][i]}</span>
              <span className="line-stroke">
                {/* Read the line from upper/lower combined stack */}
                {(() => {
                  const stack = [...hex.lines.map(x => /^(初九|九|上九)/.test(x.han) ? 1 : 0)];
                  // We don't have raw yin/yang flags, so infer from text prefix:
                  const isYang = /[九]/.test(l.han.split("：")[0] || l.han);
                  return isYang ? <span className="stroke solid" /> : <span className="stroke broken" />;
                })()}
              </span>
              <span className="line-label">{i+1}효</span>
              <span className="line-preview">{(l.han || "").split("：")[1] || l.han}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetailPanel({ upper, lower }) {
  const [activeLine, setActiveLine] = useState(-1);
  const data = useIChingData();
  const key = upper && lower ? `${upper.id}-${lower.id}` : null;
  const hex = key ? data[key] : null;

  useEffect(() => { setActiveLine(-1); }, [key]);

  if (!upper || !lower) {
    return (
      <div className="detail empty">
        <div className="empty-inner">
          <div className="empty-mark">☰<br/>☷</div>
          <div className="empty-title">상괘와 하괘를 선택하세요</div>
          <div className="empty-sub">Select an upper and lower trigram to reveal the hexagram.</div>
        </div>
      </div>
    );
  }

  if (!hex) {
    return (
      <div className="detail empty">
        <div className="empty-inner">
          <HexagramGlyph upper={upper.lines} lower={lower.lines} size={88} thick={6} gap={7} />
          <div className="empty-title" style={{ marginTop: 24 }}>
            {upper.han} 위 / {lower.han} 아래
          </div>
          <div className="empty-sub">데이터가 연결되지 않았습니다 — <code>window.IChingData["{upper.id}-{lower.id}"]</code></div>
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
            upper={upper.lines}
            lower={lower.lines}
            size={84}
            thick={6}
            gap={7}
            activeIndex={activeLine === -1 ? -1 : (5 - activeLine)}
          />
          <div className="trigram-pair">
            <div><span className="pair-label">상</span> {upper.han} <span className="pair-en">{upper.en}</span></div>
            <div><span className="pair-label">하</span> {lower.han} <span className="pair-en">{lower.en}</span></div>
          </div>
        </div>
      </header>

      <div className="detail-body">
        <section className="judgement-section">
          <div className="section-eyebrow">괘사 · THE JUDGMENT</div>
          <PassageBlock {...hex.judgment} />
        </section>

        <section className="lines-section">
          <LineRail hex={hex} activeLine={activeLine} onPick={setActiveLine} />
          {activeLine >= 0 && hex.lines[activeLine] && (
            <div className="line-detail">
              <div className="section-eyebrow">
                효사 · {["初","二","三","四","五","上"][activeLine]}효 · LINE {activeLine+1}
              </div>
              <PassageBlock {...hex.lines[activeLine]} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ----- App shell -----
function App() {
  const [upper, setUpper] = useState(TRIGRAMS[0]);
  const [lower, setLower] = useState(TRIGRAMS[0]);

  const swap = () => {
    const u = upper, l = lower;
    setUpper(l); setLower(u);
  };

  const reset = () => { setUpper(null); setLower(null); };

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
          <button className="nav-btn">색인</button>
          <button className="nav-btn">서문</button>
          <button className="nav-btn ghost">EN / 한 / 漢</button>
        </nav>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <TrigramPicker
            label="상괘 · UPPER"
            sublabel="위에 놓일 괘를 선택"
            value={upper}
            onChange={setUpper}
          />
          <div className="sidebar-divider">
            <button className="text-btn" onClick={swap}>↑↓ 위아래 바꾸기</button>
            <button className="text-btn" onClick={reset}>초기화</button>
          </div>
          <TrigramPicker
            label="하괘 · LOWER"
            sublabel="아래에 놓일 괘를 선택"
            value={lower}
            onChange={setLower}
          />
        </aside>

        <section className="main-panel">
          <DetailPanel upper={upper} lower={lower} />
        </section>
      </main>

      <footer className="app-footer">
        <span>Wilhelm / Baynes English translation · 한글 번역 · 周易 原文</span>
        <span className="muted">A reading is a mirror, not a map.</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
