(function (root, factory) {
  const core = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  root.GanjiIChingCore = core;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const STEM_KO = { 甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무", 己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계" };
  const BRANCH_KO = { 子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사", 午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해" };

  const GANJI = Array.from({ length: 60 }, (_, i) => STEMS[i % 10] + BRANCHES[i % 12]);

  // 참조 이미지의 60갑자 배괘표를 위 효부터 아래 효 순서로 전사한 값입니다.
  // 1 = 양효, 0 = 음효. 앞의 세 효가 상괘, 뒤의 세 효가 하괘입니다.
  const GANJI_BITS = [
    "010011", "000101", "000111", "001111", "101111", "011110", "110111", "101110", "101010", "010100",
    "000100", "001001", "000001", "000011", "001011", "010111", "001101", "011011", "011010", "110101",
    "110001", "100010", "100000", "000000", "000010", "010101", "100011", "000110", "010110", "101101",
    "101100", "011000", "111000", "110000", "010000", "100001", "001000", "010001", "010101", "101011",
    "111011", "110110", "111110", "111100", "110100", "101000", "110010", "100100", "100101", "001010",
    "001110", "011101", "011111", "111111", "111101", "111010", "011100", "111001", "101001", "010010"
  ];

  const TRIGRAM_ORDER = ["111", "011", "101", "001", "110", "010", "100", "000"];
  const TRIGRAMS = {
    "111": { key: "111", ko: "건", han: "乾", nature: "천" },
    "011": { key: "011", ko: "태", han: "兌", nature: "택" },
    "101": { key: "101", ko: "리", han: "離", nature: "화" },
    "001": { key: "001", ko: "진", han: "震", nature: "뢰" },
    "110": { key: "110", ko: "손", han: "巽", nature: "풍" },
    "010": { key: "010", ko: "감", han: "坎", nature: "수" },
    "100": { key: "100", ko: "간", han: "艮", nature: "산" },
    "000": { key: "000", ko: "곤", han: "坤", nature: "지" }
  };

  const HEX_NUMBERS = [
    [1, 10, 13, 25, 44, 6, 33, 12],
    [43, 58, 49, 17, 28, 47, 31, 45],
    [14, 38, 30, 21, 50, 64, 56, 35],
    [34, 54, 55, 51, 32, 40, 62, 16],
    [9, 61, 37, 42, 57, 59, 53, 20],
    [5, 60, 63, 3, 48, 29, 39, 8],
    [26, 41, 22, 27, 18, 4, 52, 23],
    [11, 19, 36, 24, 46, 7, 15, 2]
  ];

  const HEX_NAMES = [
    ["중천건", "천택리", "천화동인", "천뢰무망", "천풍구", "천수송", "천산둔", "천지비"],
    ["택천쾌", "중택태", "택화혁", "택뢰수", "택풍대과", "택수곤", "택산함", "택지췌"],
    ["화천대유", "화택규", "중화리", "화뢰서합", "화풍정", "화수미제", "화산려", "화지진"],
    ["뇌천대장", "뇌택귀매", "뇌화풍", "중뢰진", "뇌풍항", "뇌수해", "뇌산소과", "뇌지예"],
    ["풍천소축", "풍택중부", "풍화가인", "풍뢰익", "중풍손", "풍수환", "풍산점", "풍지관"],
    ["수천수", "수택절", "수화기제", "수뢰둔", "수풍정", "중수감", "수산건", "수지비"],
    ["산천대축", "산택손", "산화비", "산뢰이", "산풍고", "산수몽", "중산간", "산지박"],
    ["지천태", "지택림", "지화명이", "지뢰복", "지풍승", "지수사", "지산겸", "중지곤"]
  ];

  const HEX_HAN = [
    "乾", "坤", "屯", "蒙", "需", "訟", "師", "比", "小畜", "履", "泰", "否", "同人", "大有", "謙", "豫",
    "隨", "蠱", "臨", "觀", "噬嗑", "賁", "剝", "復", "無妄", "大畜", "頤", "大過", "坎", "離", "咸", "恒",
    "遯", "大壯", "晉", "明夷", "家人", "睽", "蹇", "解", "損", "益", "夬", "姤", "萃", "升", "困", "井",
    "革", "鼎", "震", "艮", "漸", "歸妹", "豐", "旅", "巽", "兌", "渙", "節", "中孚", "小過", "既濟", "未濟"
  ];

  const GANJI_TO_BITS = Object.fromEntries(GANJI.map((g, i) => [g, GANJI_BITS[i]]));

  function toKoreanGanji(g) {
    if (!g || g.length < 2) return "";
    return (STEM_KO[g[0]] || g[0]) + (BRANCH_KO[g[1]] || g[1]);
  }

  function hexFromBits(bits) {
    if (!/^[01]{6}$/.test(bits)) throw new Error("올바르지 않은 육효 값입니다: " + bits);
    const upperKey = bits.slice(0, 3);
    const lowerKey = bits.slice(3);
    const u = TRIGRAM_ORDER.indexOf(upperKey);
    const l = TRIGRAM_ORDER.indexOf(lowerKey);
    if (u < 0 || l < 0) throw new Error("팔괘 조합을 찾을 수 없습니다.");
    const number = HEX_NUMBERS[u][l];
    return {
      bits,
      upper: TRIGRAMS[upperKey],
      lower: TRIGRAMS[lowerKey],
      number,
      name: HEX_NAMES[u][l],
      han: HEX_HAN[number - 1],
      unicode: String.fromCodePoint(0x4dc0 + number - 1)
    };
  }

  function hexForGanji(g) {
    const bits = GANJI_TO_BITS[g];
    if (!bits) throw new Error("60갑자 배괘표에 없는 간지입니다: " + g);
    return hexFromBits(bits);
  }

  function fourPillars(SolarCtor, year, month, day, hour, minute) {
    const solar = SolarCtor.fromYmdHms(Number(year), Number(month), Number(day), Number(hour), Number(minute), 0);
    const eight = solar.getLunar().getEightChar();
    return {
      year: eight.getYear(),
      month: eight.getMonth(),
      day: eight.getDay(),
      time: eight.getTime()
    };
  }

  function makeBirthPillars(pillars, includeTime = true) {
    const result = [
      { key: "year", label: "연주", ganji: pillars.year, hex: hexForGanji(pillars.year) },
      { key: "month", label: "월주", ganji: pillars.month, hex: hexForGanji(pillars.month) },
      { key: "day", label: "일주", ganji: pillars.day, hex: hexForGanji(pillars.day) }
    ];
    if (includeTime && pillars.time) {
      result.push({ key: "time", label: "시주", ganji: pillars.time, hex: hexForGanji(pillars.time) });
    }
    return result;
  }

  function mixFortunes(periodHex, birthPillars) {
    const upperFromBirth = birthPillars.map((pillar) => ({
      ...pillar,
      hex: hexFromBits(pillar.hex.upper.key + periodHex.lower.key)
    }));
    const upperFromPeriod = birthPillars.map((pillar) => ({
      ...pillar,
      hex: hexFromBits(periodHex.upper.key + pillar.hex.lower.key)
    }));
    return { upperFromBirth, upperFromPeriod };
  }

  // 참조 이미지의 A-B' 방식입니다. 각 주의 상괘를 다른 모든 주의
  // 하괘와 결합합니다. 4주면 12개, 시주가 없으면 3주로 6개가 됩니다.
  function lifetimeFortunes(birthPillars) {
    const results = [];
    const count = birthPillars.length;
    for (let i = 0; i < count; i += 1) {
      for (let offset = 1; offset < count; offset += 1) {
        const j = (i + offset) % count;
        const upperSource = birthPillars[i];
        const lowerSource = birthPillars[j];
        results.push({
          key: `${upperSource.key}-${lowerSource.key}`,
          label: `${upperSource.label} 상괘 + ${lowerSource.label} 하괘`,
          ganji: `${upperSource.ganji} · ${lowerSource.ganji}`,
          upperSource,
          lowerSource,
          hex: hexFromBits(upperSource.hex.upper.key + lowerSource.hex.lower.key)
        });
      }
    }
    return results;
  }

  function countHexagrams(groups) {
    const counts = new Map();
    groups.flat().forEach((item) => {
      const found = counts.get(item.hex.name) || { hex: item.hex, count: 0 };
      found.count += 1;
      counts.set(item.hex.name, found);
    });
    return Array.from(counts.values()).sort((a, b) => b.count - a.count || a.hex.number - b.hex.number);
  }

  return {
    GANJI,
    GANJI_BITS,
    GANJI_TO_BITS,
    TRIGRAMS,
    toKoreanGanji,
    hexFromBits,
    hexForGanji,
    fourPillars,
    makeBirthPillars,
    mixFortunes,
    lifetimeFortunes,
    countHexagrams
  };
});
