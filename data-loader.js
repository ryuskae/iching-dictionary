// data-loader.js
// iching.json을 불러와 app.jsx가 사용하는 window.IChingData 형식으로 변환합니다.

// ── 상괘/하괘 ID 조합 → 64괘 번호 대응표 ──────────────────────────────
// app.jsx의 TRIGRAMS ID: 1=건 2=태 3=리 4=진 5=손 6=감 7=간 8=곤
const LOOKUP = {
  "1-1":1,  "1-2":43, "1-3":14, "1-4":34, "1-5":9,  "1-6":5,  "1-7":26, "1-8":11,
  "2-1":10, "2-2":58, "2-3":38, "2-4":54, "2-5":61, "2-6":60, "2-7":41, "2-8":19,
  "3-1":13, "3-2":49, "3-3":30, "3-4":55, "3-5":37, "3-6":63, "3-7":22, "3-8":36,
  "4-1":25, "4-2":17, "4-3":21, "4-4":51, "4-5":42, "4-6":3,  "4-7":27, "4-8":24,
  "5-1":44, "5-2":28, "5-3":50, "5-4":32, "5-5":57, "5-6":48, "5-7":18, "5-8":46,
  "6-1":6,  "6-2":47, "6-3":64, "6-4":40, "6-5":59, "6-6":29, "6-7":4,  "6-8":7,
  "7-1":33, "7-2":31, "7-3":56, "7-4":62, "7-5":53, "7-6":39, "7-7":52, "7-8":15,
  "8-1":12, "8-2":45, "8-3":35, "8-4":16, "8-5":20, "8-6":8,  "8-7":23, "8-8":2,
};

// ── 64괘 영어 이름 ────────────────────────────────────────────────────────
const EN_NAMES = {
  1:"The Creative",           2:"The Receptive",
  3:"Difficulty at the Beginning", 4:"Youthful Folly",
  5:"Waiting",                6:"Conflict",
  7:"The Army",               8:"Holding Together",
  9:"The Taming Power of the Small", 10:"Treading",
  11:"Peace",                 12:"Standstill",
  13:"Fellowship with Men",   14:"Possession in Great Measure",
  15:"Modesty",               16:"Enthusiasm",
  17:"Following",             18:"Work on What Has Been Spoiled",
  19:"Approach",              20:"Contemplation",
  21:"Biting Through",        22:"Grace",
  23:"Splitting Apart",       24:"Return",
  25:"Innocence",             26:"The Taming Power of the Great",
  27:"The Corners of the Mouth", 28:"Preponderance of the Great",
  29:"The Abysmal",           30:"The Clinging",
  31:"Influence",             32:"Duration",
  33:"Retreat",               34:"The Power of the Great",
  35:"Progress",              36:"Darkening of the Light",
  37:"The Family",            38:"Opposition",
  39:"Obstruction",           40:"Deliverance",
  41:"Decrease",              42:"Increase",
  43:"Breakthrough",          44:"Coming to Meet",
  45:"Gathering Together",    46:"Pushing Upward",
  47:"Oppression",            48:"The Well",
  49:"Revolution",            50:"The Cauldron",
  51:"The Arousing",          52:"Keeping Still",
  53:"Development",           54:"The Marrying Maiden",
  55:"Abundance",             56:"The Wanderer",
  57:"The Gentle",            58:"The Joyous",
  59:"Dispersion",            60:"Limitation",
  61:"Inner Truth",           62:"Preponderance of the Small",
  63:"After Completion",      64:"Before Completion",
};

// ── 64괘 한국어 전통 괘명 ────────────────────────────────────────────────
const KO_NAMES = {
  1:"중천건",  2:"중지곤",  3:"수뢰준",  4:"산수몽",
  5:"수천수",  6:"천수송",  7:"지수사",  8:"수지비",
  9:"풍천소축", 10:"천택리", 11:"지천태", 12:"천지비",
  13:"천화동인", 14:"화천대유", 15:"지산겸", 16:"뇌지예",
  17:"택뢰수", 18:"산풍고", 19:"지택임", 20:"풍지관",
  21:"화뢰서합", 22:"산화비", 23:"산지박", 24:"지뢰복",
  25:"천뢰무망", 26:"산천대축", 27:"산뢰이", 28:"택풍대과",
  29:"중수감", 30:"중화리", 31:"택산함", 32:"뇌풍항",
  33:"천산둔", 34:"뇌천대장", 35:"화지진", 36:"지화명이",
  37:"풍화가인", 38:"화택규", 39:"수산건", 40:"뇌수해",
  41:"산택손", 42:"풍뢰익", 43:"택천쾌", 44:"천풍구",
  45:"택지췌", 46:"지풍승", 47:"택수곤", 48:"수풍정",
  49:"택화혁", 50:"화풍정", 51:"중뢰진", 52:"중산간",
  53:"풍산점", 54:"뇌택귀매", 55:"뇌화풍", 56:"화산려",
  57:"중풍손", 58:"중택태", 59:"풍수환", 60:"수택절",
  61:"풍택중부", 62:"뇌산소과", 63:"수화기제", 64:"화수미제",
};

// ── iching.json 로드 및 변환 ─────────────────────────────────────────────
fetch('iching.json')
  .then(res => {
    if (!res.ok) throw new Error('iching.json을 불러오지 못했습니다.');
    return res.json();
  })
  .then(json => {
    // id → 괘 데이터 인덱스 생성
    const byId = {};
    json.hexagrams.forEach(h => { byId[h.id] = h; });

    // window.IChingData 구성
    window.IChingData = {};

    for (const [key, hexId] of Object.entries(LOOKUP)) {
      const h = byId[hexId];
      if (!h) continue;

      window.IChingData[key] = {
        number: h.id,
        name: {
          han: h.name_zh,
          ko:  KO_NAMES[h.id] || h.name_kr,
          en:  EN_NAMES[h.id] || "",
        },
        judgment: {
          han: h.judgment.original,
          en:  h.judgment.wilhelm,
          ko:  h.judgment.korean,
        },
        image: {
          han: h.image.original,
          en:  h.image.wilhelm,
          ko:  h.image.korean,
        },
        // lines[0] = 1효(초효), lines[5] = 6효(상효)
        lines: h.lines.map(l => ({
          han: l.position + "：" + l.original,
          en:  l.wilhelm,
          ko:  l.korean,
        })),
      };
    }

    // 데이터 준비 완료 이벤트 발송 → app.jsx가 감지하여 리렌더링
    window.dispatchEvent(new Event('ichingready'));
    console.log(`✅ 주역 데이터 로드 완료: ${Object.keys(window.IChingData).length}괘`);
  })
  .catch(err => {
    console.error('❌ 데이터 로드 실패:', err);
  });
