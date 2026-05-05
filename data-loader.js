// data-loader.js
// iching.json을 불러와 app.jsx가 사용하는 window.IChingData 형식으로 변환합니다.

// 키 = "상괘id-하괘id"  (1=乾 2=兌 3=離 4=震 5=巽 6=坎 7=艮 8=坤)
// 수정: 이전 테이블은 행/열이 전치(transposed)되어 상하괘가 뒤바뀐 상태였음
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

const EN_NAMES = {
  1:"The Creative",2:"The Receptive",3:"Difficulty at the Beginning",4:"Youthful Folly",
  5:"Waiting",6:"Conflict",7:"The Army",8:"Holding Together",
  9:"The Taming Power of the Small",10:"Treading",11:"Peace",12:"Standstill",
  13:"Fellowship with Men",14:"Possession in Great Measure",15:"Modesty",16:"Enthusiasm",
  17:"Following",18:"Work on What Has Been Spoiled",19:"Approach",20:"Contemplation",
  21:"Biting Through",22:"Grace",23:"Splitting Apart",24:"Return",
  25:"Innocence",26:"The Taming Power of the Great",27:"The Corners of the Mouth",28:"Preponderance of the Great",
  29:"The Abysmal",30:"The Clinging",31:"Influence",32:"Duration",
  33:"Retreat",34:"The Power of the Great",35:"Progress",36:"Darkening of the Light",
  37:"The Family",38:"Opposition",39:"Obstruction",40:"Deliverance",
  41:"Decrease",42:"Increase",43:"Breakthrough",44:"Coming to Meet",
  45:"Gathering Together",46:"Pushing Upward",47:"Oppression",48:"The Well",
  49:"Revolution",50:"The Cauldron",51:"The Arousing",52:"Keeping Still",
  53:"Development",54:"The Marrying Maiden",55:"Abundance",56:"The Wanderer",
  57:"The Gentle",58:"The Joyous",59:"Dispersion",60:"Limitation",
  61:"Inner Truth",62:"Preponderance of the Small",63:"After Completion",64:"Before Completion",
};

const KO_NAMES = {
  1:"중천건",2:"중지곤",3:"수뢰준",4:"산수몽",5:"수천수",6:"천수송",7:"지수사",8:"수지비",
  9:"풍천소축",10:"천택리",11:"지천태",12:"천지비",13:"천화동인",14:"화천대유",15:"지산겸",16:"뇌지예",
  17:"택뢰수",18:"산풍고",19:"지택임",20:"풍지관",21:"화뢰서합",22:"산화비",23:"산지박",24:"지뢰복",
  25:"천뢰무망",26:"산천대축",27:"산뢰이",28:"택풍대과",29:"중수감",30:"중화리",31:"택산함",32:"뇌풍항",
  33:"천산둔",34:"뇌천대장",35:"화지진",36:"지화명이",37:"풍화가인",38:"화택규",39:"수산건",40:"뇌수해",
  41:"산택손",42:"풍뢰익",43:"택천쾌",44:"천풍구",45:"택지췌",46:"지풍승",47:"택수곤",48:"수풍정",
  49:"택화혁",50:"화풍정",51:"중뢰진",52:"중산간",53:"풍산점",54:"뇌택귀매",55:"뇌화풍",56:"화산려",
  57:"중풍손",58:"중택태",59:"풍수환",60:"수택절",61:"풍택중부",62:"뇌산소과",63:"수화기제",64:"화수미제",
};

fetch('iching.json')
  .then(res => { if (!res.ok) throw new Error('iching.json 로드 실패'); return res.json(); })
  .then(json => {
    const byId = {};
    json.hexagrams.forEach(h => { byId[h.id] = h; });
    window.IChingData = {};
    for (const [key, hexId] of Object.entries(LOOKUP)) {
      const h = byId[hexId];
      if (!h) continue;
      window.IChingData[key] = {
        number: h.id,
        name: { han: h.name_zh, ko: KO_NAMES[h.id] || h.name_kr, en: EN_NAMES[h.id] || "" },
        judgment: { han: h.judgment.original, en: h.judgment.wilhelm, ko: h.judgment.korean },
        lines: h.lines.map(l => ({ han: l.position + "：" + l.original, en: l.wilhelm, ko: l.korean })),
      };
    }
    window.dispatchEvent(new Event('ichingready'));
    console.log('✅ 주역 데이터 로드 완료:', Object.keys(window.IChingData).length, '괘');
  })
  .catch(err => console.error('❌ 데이터 로드 실패:', err));
