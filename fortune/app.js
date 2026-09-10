(function () {
  "use strict";

  const C = window.GanjiIChingCore;
  const LEGACY_STORAGE_KEY = "ganji-iching-profile-v1";
  const STORAGE_KEY = "ganji-iching-profiles-v2";
  const ACTIVE_KEY = "ganji-iching-active-profile-v2";
  const TABS = {
    lifetime: { symbol: "命", label: "평생 운", small: "사주 각 주의 교차 조합" },
    year: { symbol: "年", label: "연 운세", small: "선택한 해", unit: "년", ganjiKey: "year" },
    month: { symbol: "月", label: "월 운세", small: "선택한 날짜의 음력월", unit: "월", ganjiKey: "month" },
    day: { symbol: "日", label: "일 운세", small: "선택한 날짜", unit: "일", ganjiKey: "day" },
    time: { symbol: "時", label: "시 운세", small: "선택한 시각", unit: "시", ganjiKey: "time" }
  };

  // 사용자가 제공한 『주역 64괘』 참조 이미지의 설명을 괘 번호순으로 전사했습니다.
  const HEXAGRAM_MEANINGS = Object.freeze({
    1: "하늘의 섭리, 우주의 원동력, 만물의 시작, 원초적 동기, 힘의 원천, 무한한 생명력, 생명 그 자체, 정신적인 것, 대통합, 강건함, 활동성, 불멸, 공公, 정의, 신, 노인, 아버지, 남자, 정부, 대통령, 왕, 사령관, 경건함, 깨끗함, 시작, 격돌.",
    2: "땅의 도리, 우주의 결실, 우주의 모든 별, 물질적인 것, 감정적인 것, 실질적인 것, 땅, 국가, 넓은 것, 사私, 유순함, 몸, 정지, 고요함, 죽음, 실익, 백성, 여자, 어머니, 고향, 장소, 공간, 끝, 평화, 어울림, 수면, 한가함, 무사태평, 휴일.",
    3: "도전, 혼돈, 사업의 시작, 미지의 세계, 쉬지 않음, 공격, 혼란, 어지러움, 콘텐츠, 의욕, 전투, 창업, 태아, 격론, 용감함, 승리에 대한 예감, 희망, 생기발랄함.",
    4: "어린아이, 낯선 느낌, 머뭇거림, 잠시 휴식함, 작은 결실, 전망, 지도자의 노고, 교육자, 방종, 마이웨이, 고독, 두려움, 졸업.",
    5: "기다림, 교통 체증, 약한 저항에 부딪힘, 수면, 공급, 강을 건넘, 안개가 몰려옴.",
    6: "사필귀정, 재판에서 승리함, 오해가 풀림, 만물의 종착역, 확실함, 상황이 개선됨, 걱정이 사라짐, 메달 획득, 월등한 실력, 완벽한 승리, 결론이 남, 자유로워짐.",
    7: "우글거림, 풍부한 재원, 몰려드는 것, 기도함, 공개, 전쟁, 잠복, 보통 사람, 지하수가 넘침, 감정이 쌓여감, 서민의 삶, 사적인 감정, 제자리로 돌아옴, 약간의 전진.",
    8: "촉촉한 땅, 비옥한 땅, 지극히 사적인 것, 평화, 친함, 사귐, 드러누움, 퇴근, 어린 마음, 촉촉함, 목표에 도달함, 안도의 한숨, 농사의 시작, 나누어줌.",
    9: "빠져나감, 낭비, 막지 못함, 소비, 도덕적 해이, 빈틈, 사치, 남아서 넘침, 웃음이 터짐, 걱정 없음, 여유만만, 계약 해지, 자유분방함.",
    10: "하늘에 기도함, 공개, 거리낌 없음, 노출, 만물의 계층, 명상, 개방, 크게 열어놓음, 백일하에 드러남, 희망이 다가옴, 순탄함, 하느님이 보우하심, 분수를 헤아림.",
    11: "은행, 댐, 원목, 자본, 남녀의 화합, 결혼, 충분함, 꽉 짜임, 비행, 조약의 체결, 약속, 튼튼함, 가능성의 극대화, 태풍의 눈, 만족스러움, 거대한 자본, 자신만만, 아직 나서지 않음, 치료가 됨, 완벽한 대비, 악수, 교환, 방문.",
    12: "이혼, 이별, 행방불명, 자본이 없음, 절망, 비켜감, 허허벌판, 안절부절못함, 오해, 겉도는 상태, 왕따, 비협조적인 태도, 독단적인 태도, 우주의 종말, 방전, 자녀의 가출, 부부가 각 방을 씀, 통신이 두절됨, 극단적인 대치, 무관심, 폐쇄, 영업 종료.",
    13: "동지, 대의명분, 의기투합, 수도생활, 부름에 응함, 공정함, 철학을 추구함, 정신을 지향함, 개국공신, 가담, 선거운동, 측근, 진리를 추구함, 공익에 충실함, 출근, 정의, 도덕, 성인을 따름, 위대함을 추구함, 밝아오는 세상, 현금, 응원.",
    14: "위대함, 성인, 영웅, 영광, 밝은 대낮, 금메달 획득, 대통령, 옥황상제, 교리, 최상, 최선, 지도자, 재벌, 도인, 대학자, 스타 연예인, 복권 당첨, 수석(1등), 다이아몬드, 최고.",
    15: "휴화산, 복지부동, 굳게 닫힘, 겸손함, 비밀, 감춰진 것, 내색하지 않음, 침묵.",
    16: "박차고 일어남, 본색이 드러남, 평화가 깨짐, 부추김, 흥분, 행진, 당당함, 두드림, 악기, 발동, 예비 신호.",
    17: "깊은 휴식, 테두리 안에 있음, 밑실작업, 사전준비, 단단히 포장함, 출근 준비, 자기 통제, 장미의 가시, 여자의 자존심.",
    18: "붕괴, 파탄, 배신, 거짓말, 불만, 바람피움, 사기, 훼방, 변화, 개종, 입장의 변화, 이중인격, 상처가 곪음, 과일이 썩음, 연대가 무너짐, 단체에서 이탈함, 미끄러짐, 피부병, 견고하지 못함, 오래가지 못함, 파계.",
    19: "깊은 연못, 정착, 심오함, 터줏대감, 뿌리 깊은 나무, 가문의 상속, 깊이 있는 사람, 국가의 정책, 안도감, 평정심, 고향에 돌아옴, 두툼한 이불, 편안함, 안락의자, 안정된 위치, 대표이사, 전통, 오래된 가문, 의젓함, 후방 도시.",
    20: "살펴봄, 방랑, 방황, 여행, 의사결정을 아직 못함, 지쳐 있음, 여자의 소견, 이사, 정착하지 못함, 가벼운 사람, 변덕스러움, 할 일 없음, 장사가 안 됨, 타향에서 고생함, 여자의 이혼, 보호받지 못함, 신입사원, 초보 운전자.",
    21: "재래시장, 대낮에 사람이 모여듦, 연구개발, 애로사항, 핵심, 발견, 파헤침, 적중, 집중공격, 출현.",
    22: "풍만함, 완제품, 무덤, 아름다움, 건강함, 안전하게 보관함, 예술품, 적당히 쌓임, 찐빵, 꼬막, 속이 찬 꽃게, 가려짐, 실속 있음, 안정적인 구조, 대책이 있음, 완벽한 실력.",
    23: "국가 정부, 외로운 지도자, 무거운 임무, 마지막 희망, 수문장, 작은 산, 세금, 버티고 있음, 무조건 반대, 늦가을.",
    24: "이른 봄, 회복, 새로운 희망, 작은 희망, 다시 시작, 동짓날, 봄을 기다림, 반전, 고진감래, 싹수가 보임, 미약한 출발.",
    25: "뜻밖의 횡재, 국가의 명령, 좋은 징조, 영웅의 씨앗, 권력 실세, 우수함, 날카로움, 갑작스런 움직임, 충격, 군대의 파견, 계엄령, 신성한 임무.",
    26: "크게 쌓임, 두터운 이불, 큰 댐, 누적 효과, 안전한 관리, 금고, 염려가 없음, 백과사전, 관운장 같은 기상, 극도의 절약, 넉넉함.",
    27: "어린아이를 보호함, 몸을 튼튼하게 함, 튼튼한 가정, 안정된 급여, 군사 진지, 튼튼한 장비, 체력 단련, 대저택, 업적이 계속 쌓임, 수비형 축구, 가택연금, 튼튼한 치아, 만반의 준비, 내수산업, 국민연금, 흡수 통합.",
    28: "욕심이 지나침, 위태로운 구조, 포화상태, 비밀이 탄로 나기 직전, 의견 상충, 여자가 애인이 많음, 횡령, 과장됨, 유지하기 어려움, 지나친 사재기, 빚의 증가, 진퇴양난, 배가 전복됨, 비만, 사고뭉치, 허풍쟁이, 함량 초과.",
    29: "물, 감정, 어두움, 혼란, 다양함, 음식, 술, 영양분, 재물, 여성, 냉정함, 어린아이, 슬픔, 개인, 무리.",
    30: "질서, 아름다움, 조화, 밝음, 약, 이성(감성의 반대), 신사도, 남자, 다정함, 꽃, 기쁨, 단체행동, 특별함, 장식품, 불, 위엄, 그늘, 여름.",
    31: "사랑, 친절, 격려, 자기성찰, 예쁜 벽지, 느낌, 버섯, 바위틈의 풀, 나무, 화해, 거래가 성사됨, 인정을 받음, 가벼운 농담, 은근함, 언덕 위의 집.",
    32: "비행기의 이륙, 용의 승천, 대박이 터짐, 탄탄대로, 유행의 확산, 흥행의 성공, 오래 지속됨, 순환함, 순풍에 돛을 단 격, 거대한 것이 잘 움직여감, 궤도에 오름, 잘 굴러감, 도로가 시원하게 뚫림, 국민의 지지를 받음, 상승세를 탐, 먼 곳까지 진출함, 인기가 절정에 오름, 큰 계약을 성사시킴.",
    33: "멀리 도망감, 외면, 은거, 은퇴, 무관심, 뻔뻔함, 고립, 주저앉음, 기력을 상실함, 부적응, 갈 곳이 없음, 사악함, 사회를 부정함, 강자를 부정함, 상식을 부정함, 인색함, 비협조, 단교, 단절.",
    34: "관우, 조자룡, 대장군, 에너지가 충만함, 정비, 권력, 권세, 당선, 당첨, 정복, 돌진, 승승장구, 막강한 군대, 로마제국, 거대한 건물, 높이 나는 독수리, 전투기, 천하를 제압함, 혁명을 성공시킴, 젊음을 유지함.",
    35: "여명, 떠오르기 시작함, 현상을 탈피함, 밝은 세상, 순탄한 출발, 올림픽에 출전함, 거리낌 없는 전진, 천재의 출현, 꽃다운 나이, 영웅본색, 분위기가 고조됨, 희망이 싹틈.",
    36: "암흑 세상, 인재를 박대함, 중태에 빠짐, 정의를 상실함, 양심 없음, 미성숙아, 상품이 빛을 발휘 못함, 폐기처분, 기회를 상실함, 희망 없음.",
    37: "조직, 단체, 결혼, 가입, 협동, 행복, 매력을 발산함, 합격, 입사, 튼튼한 기반, 계통, 체계적, 쉬운 해결, DNA, 확대, 확산, 동료, 단일 민족.",
    38: "활짝 핀 꽃, 떠오르는 태양, 여자의 결혼, 로켓의 발사, 축하, 축복, 원정, 다 큰 아이, 정다운 이별, 환호, 상전이相轉移.",
    39: "망설이는 상황, 물에 빠진 쥐, 그물에 걸린 짐승, 극단적인 고집, 침몰됨, 전진하지 못함, 어둠 속에서 움직이지 못함, 엎친 데 덮친 격, 일이 꼬이고 또 꼬임, 자포자기, 처짐, 무거워서 떨어뜨림, 지탱하지 못함, 밀림 속에서 다리를 다침, 죄를 짓고 체포됨, 지나치게 사적인 성격, 험난한 상황에 포위됨, 엄두가 나지 않음, 침울함, 일어나지 못함, 험난하고 미끄러움, 도움을 요청할 곳이 없음, 사업이 지속되지 않음, 친구와의 단절, 의사불통, 통신이 두절됨.",
    40: "사건이 해결됨, 험난한 상황에서 벗어남, 갈증이 해소됨, 가뭄에 비가 옴, 홀로 움직임, 상처가 나음, 난관을 돌파함, 출산, 신분의 상승, 앓던 이가 빠짐, 미련 없음, 쑥쑥 자람, 지하수를 발견함.",
    41: "모금, 추대, 꿩 먹고 알 먹는 상황, 안정과 평화, 급속한 팽창, 체력의 소모, 겨우 지탱함, 희생, 대표자, 대변인, 교환, 상부상조.",
    42: "파헤침, 강하게 찌름, 농사, 장악함, 텃밭을 일굼, 쐐기를 박음, 낚시, 이윤을 남김, 잡아당김, 단서를 포착함, 침, 주사.",
    43: "아주 위대함, 처단, 폭발, 지나치게 무리함, 독재자, 다 된 밥, 식구가 너무 많음, 사공이 너무 많음, 무적의 군대, 과잉 진압.",
    44: "여장부, 황소고집, 과잉 지배욕, 남성학대, 뜻밖의 재난, 흉한 조짐, 헛된 수고, 공연한 시비, 역행, 불온한 기운, 추태, 호응하는 사람이 없음, 심한 독단.",
    45: "벼락출세, 일거리가 생김, 오랜 고난에서 탈피함, 언 땅이 녹음, 동지가 모여듦, 아직은 미약함, 전진 기지, 피부가 부어오름, 근사한 대문, 통솔이 잘됨, 수입이 도래함, 권토중래, 행운을 끌어옴.",
    46: "부드러움, 씨앗이 자람, 계속해서 전진함, 공식무대에 등장함, 병이 완치됨, 체질을 개선함, 주가가 폭등함, 사업이 순탄하게 진행됨, 잘 지탱하는 상황, 매사가 원만함, 애인과 관계를 회복함.",
    47: "감옥에 갇힘, 몸이 비쩍 마름, 심한 고독, 몸매가 나쁜 여자, 상사병, 연애가 깨짐, 사업이 계속 적자를 기록함, 유명무실, 위산과다, 김새는 상황, 실속이 없음, 자본이 고갈됨, 집안에 우환이 생김.",
    48: "수입이 증대됨, 갈증이 해소됨, 득남, 애정이 유지됨, 원기를 회복함, 사업을 지속시킴, 흑자행진, 공급이 원만함, 외교가 확대됨, 아이디어가 속출함, 정세가 안정됨, 재물이 증가함, 식구가 늘어남.",
    49: "격변, 파탄, 부도 사태, 혁명, 가정에 내분이 생김, 회사의 사장이 바뀜, 부하들의 반란, 애인이 도망감, 비밀이 탄로 남, 잃어버린 물건을 찾음, 유명해짐, 소화기에 병이 남.",
    50: "유종의 미, 목표달성, 명예와 영광, 행복의 절정, 평화가 계속됨, 화려함, 최고의 미, 행운이 도래함, 복권에 당첨됨.",
    51: "난리 법석, 이사, 전출, 새로운 일이 많이 발생, 아주 바쁨, 사건이 연속해서 발생함, 사고의 위험, 불면, 일은 많고 수입이 없음, 개조, 개선, 수술, 활동력이 증가함, 분쟁이 발발함, 상황이 변화함, 비용을 허비함, 신체의 위험.",
    52: "개점휴업, 만사부동, 계획이 취소됨, 고집으로 망함, 동지가 없음, 부동산이 안 팔림, 오랫동안 제자리임, 진급하지 못함, 할 일이 없어짐, 병이 생김, 원수가 나타남, 오도 가도 못 함, 무능함, 무력함, 개선되지 않음.",
    53: "조금씩 개선됨, 화해 무드, 건실함, 선물을 포장함, 산의 나무, 가벼운 접촉, 사랑은 아직 안 됨, 사업이 늦어짐, 묵묵부답, 오래 버팀, 현상을 유지함, 감질나는 상황, 양보하지 않음, 작은 변화.",
    54: "기력이 떨어짐, 고향으로 돌아옴, 몸이 무거움, 활동무대가 협소함, 견문이 넓음, 멀리 가지 못함, 여행지에서의 사고, 득보다 실, 일보전진 이보후퇴, 의욕의 부족, 전선에서 후퇴함, 출세하지 못함, 마마보이.",
    55: "제사상, 눈덩이, 단결, 쌓임, 풍족함, 잘 영근 벼이삭, 잘 익은 과일, 압축, 한쪽으로 치우침, 암, 무거운 커튼, 적체, 과체중, 임금이 체불됨, 일거리가 누적됨, 탑, 과잉.",
    56: "궤도에서 이탈함, 해방, 여행, 정처 없음, 나그네, 예의 없음, 무절제, 무원칙, 잦은 이사, 세월을 낭비함, 피로함.",
    57: "지극히 부드러움, 방랑, 정착하지 못함, 바람, 심각한 소모, 방치, 무절제, 교양 없음, 말이 많음, 가버림, 가벼움, 절도가 없음, 흐리멍덩함, 주관이 뚜렷하지 못함, 변덕, 잡초, 나약함.",
    58: "행복, 평화, 보호, 양육, 생기가 넘침, 즐거움, 안락함, 여자의 손길, 고향, 환영받음, 안식처, 안정, 정착, 연못, 한가함.",
    59: "풍비박산, 술에 취함, 자유분방함, 재산이 바닥남, 사라짐, 무의미, 탕진, 이혼, 이별, 각자 해산, 청소, 무례함, 닳아 없어짐, 원칙 없음, 격식 없음.",
    60: "절제, 예의, 형식, 틀, 안정, 평화, 보호, 감싸줌, 그릇, 아늑함, 어머니의 품, 수용, 연못, 단정, 질서, 정조, 양육, 정돈, 약속을 지킴, 원리원칙, 침착, 교양, 분수를 지킴.",
    61: "포부, 포용, 여유, 닭이 알을 품음, 중용, 간직, 예쁜 단장, 낭만, 대범함, 사교적, 넉넉함, 회복.",
    62: "째째함, 멀리 가지 못함, 판에 박힘, 인색함, 포부가 없음, 희망이 절벽에 부딪침, 결렬, 지나친 절약, 긴장, 위축, 배척, 소심.",
    63: "완벽함, 최상의 조화, 정리정돈, 살림살이, 적재적소, 화음, 효율, 논리적, 모두 만족함, 빈틈없음.",
    64: "엉망진창, 부적당, 불협화음, 불안정, 빗나감, 모두 망가짐, 중구난방, 끝나지 않은 언쟁, 논리가 없음, 감당하지 못함, 모순투성이."
  });

  const now = new Date();
  const today = formatDate(now);
  const currentDateTime = formatDateTime(now);
  const loaded = loadProfiles();
  const state = {
    tab: "lifetime",
    profiles: loaded.profiles,
    activeProfileId: loaded.activeProfileId,
    editorProfileId: loaded.activeProfileId,
    formOpen: loaded.profiles.length === 0,
    lifetimePage: 0,
    periodGroup: "birth",
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

  function profileSelector() {
    if (!state.profiles.length) return `<p class="people-empty">아직 저장된 인물이 없습니다.</p>`;
    return `<label class="profile-select-label" for="profileSelect">운세를 볼 인물</label><select class="profile-select" id="profileSelect">${state.profiles.map((p) => `<option value="${esc(p.id)}" ${p.id === state.activeProfileId ? "selected" : ""}>${esc(p.name)} · ${esc(p.date)}${p.time ? ` ${esc(p.time)}` : " 시간 미상"}</option>`).join("")}</select>`;
  }

  function renderSidebar() {
    const profile = activeProfile();
    const pillars = birthPillars();
    return `
      <aside class="sidebar">
        <section class="panel profile-panel">
          <div class="people-heading"><div><div class="eyebrow">Saved people</div><h2>저장된 인물</h2></div><button class="mini-button" id="newProfile" type="button">+ 새 인물</button></div>
          ${profileSelector()}
          ${profile ? `<button class="profile-edit-button" id="editProfile" type="button">${esc(profile.name)}님 정보 수정</button>` : ""}
          <div class="birth-summary ${pillars ? "show" : ""}" id="birthSummary">${profileSummary(pillars, profile)}</div>
        </section>
        <section class="panel tabs-panel">
          <nav class="tabs" aria-label="운세 기간">
            ${Object.entries(TABS).map(([key, item]) => `<button class="tab ${state.tab === key ? "active" : ""}" type="button" data-tab="${key}" aria-current="${state.tab === key ? "page" : "false"}"><span class="tab-symbol">${item.symbol}</span><span><strong>${item.label}</strong><small>${item.small}</small></span></button>`).join("")}
          </nav>
        </section>
      </aside>`;
  }

  function renderProfileModal() {
    if (!state.formOpen) return "";
    const editing = editorProfile();
    return `<div class="modal-backdrop" id="profileModal">
      <section class="profile-modal panel" role="dialog" aria-modal="true" aria-labelledby="profileModalTitle">
        <div class="modal-heading">
          <div><div class="eyebrow">Birth profile</div><h2 id="profileModalTitle">${editing ? "인물 정보 수정" : "새 사주 저장"}</h2></div>
          <button class="modal-close" id="closeProfileModal" type="button" aria-label="닫기">×</button>
        </div>
        <p class="helper">이름과 양력 생일을 입력하세요. 출생 시각은 모르면 비워두셔도 됩니다.</p>
        <form id="profileForm">
          <div class="field"><label for="profileName">이름</label><input id="profileName" name="profileName" type="text" maxlength="30" autocomplete="off" required value="${esc(editing?.name || "")}" placeholder="예: 석용"></div>
          <div class="field"><label for="birthDate">양력 생일</label><input id="birthDate" name="birthDate" type="date" min="1900-01-01" max="2100-12-31" required value="${esc(editing?.date || "")}"></div>
          <div class="field"><label for="birthTime">출생 시각 <span class="optional">선택 사항</span></label><input id="birthTime" name="birthTime" type="time" value="${esc(editing?.time || "")}"></div>
          <div class="modal-actions"><button class="primary" type="submit">${editing ? "정보 수정" : "새 인물 저장"}</button><button class="secondary" id="cancelProfileEdit" type="button">취소</button></div>
          ${editing ? `<button class="danger-button" id="deleteProfile" type="button">이 인물 삭제</button>` : ""}
          <p class="form-error" id="formError" role="alert"></p>
        </form>
      </section>
    </div>`;
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
    return `<article class="hex-card">
      <div class="card-pillar"><span>${item.label}</span><span>${source}</span></div>
      <div class="card-body"><div class="hex-glyph">${glyph(h.bits)}</div><div class="card-name"><strong>${h.name}</strong><span>No.${String(h.number).padStart(2, "0")} · ${h.han}</span></div></div>
      <div class="trigram-pair"><span>상 ${h.upper.han} ${h.upper.ko}</span><span>하 ${h.lower.han} ${h.lower.ko}</span></div>
      <p class="hex-meaning">${esc(HEXAGRAM_MEANINGS[h.number])}</p>
    </article>`;
  }

  function countsPanel(counts, total, description) {
    return `<section class="panel counts-panel"><div class="section-head"><h2>괘 출현 횟수</h2><p>${description} 총 ${total}개 조합입니다.</p></div><div class="counts">${counts.map(({ hex, count }) => `<span class="count-chip">${hex.name}<strong>${count}</strong></span>`).join("")}</div></section>`;
  }

  function resultsGroup(title, formula, items, controls = "", total = items.length, note = "") {
    return `<section class="panel results-panel"><div class="section-head results-head"><div><div class="eyebrow">${total} combinations</div><h2>${title}</h2></div><div class="results-tools"><p class="formula">${formula}</p>${controls}</div></div><div class="hex-grid">${items.map(hexCard).join("")}</div>${note ? `<div class="footer-note">${note}</div>` : ""}</section>`;
  }

  function renderLifetime(profile, pillars) {
    const combinations = C.lifetimeFortunes(pillars);
    const counts = C.countHexagrams([combinations]);
    const pillarText = pillars.map((p) => p.label).join("·");
    const pageSize = 4;
    const pageCount = Math.ceil(combinations.length / pageSize);
    state.lifetimePage = Math.min(state.lifetimePage, pageCount - 1);
    const pageItems = combinations.slice(state.lifetimePage * pageSize, (state.lifetimePage + 1) * pageSize);
    const pager = `<div class="result-pager" aria-label="평생 운 괘 페이지"><button type="button" id="previousResults" ${state.lifetimePage === 0 ? "disabled" : ""} aria-label="이전 괘">‹</button><span>${state.lifetimePage + 1} / ${pageCount}</span><button type="button" id="nextResults" ${state.lifetimePage === pageCount - 1 ? "disabled" : ""} aria-label="다음 괘">›</button></div>`;
    return `<main class="main">
      <section class="panel lifetime-intro">
        <div><div class="eyebrow">Lifetime fortune</div><h2>${esc(profile.name)}님의 평생 운</h2><p>${pillarText}의 상괘와 서로 다른 주의 하괘를 교차해 계산합니다.</p></div>
        <div class="lifetime-formula"><strong>${pillars.length}주 × 나머지 ${pillars.length - 1}주</strong><span>${combinations.length}개 고유 조합</span></div>
      </section>
      ${countsPanel(counts, combinations.length, "평생 운에서 나온 괘를 합산했습니다.")}
      ${resultsGroup("평생 운 괘 조합", "각 주의 상괘 + 나머지 주의 하괘", pageItems, pager, combinations.length, "참조 이미지의 A-B′ 조합법을 적용했습니다. 출생 시각이 없으면 시주를 제외합니다.")}
    </main>`;
  }

  function renderPeriod(pillars) {
    const info = periodInfo();
    const mixed = C.mixFortunes(info.hex, pillars);
    const counts = C.countHexagrams([mixed.upperFromBirth, mixed.upperFromPeriod]);
    const total = pillars.length * 2;
    const birthGroup = state.periodGroup === "birth";
    const items = birthGroup ? mixed.upperFromBirth : mixed.upperFromPeriod;
    const title = birthGroup ? "내 상괘 + 운의 하괘" : "운의 상괘 + 내 하괘";
    const formula = birthGroup
      ? `사주 각 괘의 상괘 · ${C.toKoreanGanji(info.ganji)}${info.tab.unit} 괘의 하괘`
      : `${C.toKoreanGanji(info.ganji)}${info.tab.unit} 괘의 상괘 · 사주 각 괘의 하괘`;
    const switcher = `<div class="results-switch" role="group" aria-label="괘 조합식"><button type="button" data-result-group="birth" class="${birthGroup ? "active" : ""}">내 상괘</button><button type="button" data-result-group="period" class="${birthGroup ? "" : "active"}">운의 상괘</button></div>`;
    return `<main class="main">
      <section class="panel period-panel">
        <div class="period-control"><div class="eyebrow">Period selector</div><h2 class="period-title">${info.tab.label}</h2><div class="period-actions">${periodInput()}<button class="secondary" id="resetPeriod" type="button">오늘</button></div></div>
        ${basisCard(info)}
      </section>
      ${countsPanel(counts, total, "두 조합식에서 나온 괘를 합산했습니다.")}
      ${resultsGroup(title, formula, items, switcher, total, "간지는 한국천문연구원 음양력 기준으로 계산합니다. 연간지는 음력 설날에, 월간지는 음력 월이 바뀔 때 달라집니다.")}
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
    root.innerHTML = `<header class="topbar"><div class="brand"><div class="brand-mark">易</div><div><h1>간지괘운</h1><p>干支卦運 · GANJI HEXAGRAM FORTUNE</p></div></div><div class="privacy">음력 기준 사주 · 60갑자 배괘 · 브라우저 로컬 저장</div></header><div class="layout">${renderSidebar()}${renderMain()}</div>${renderProfileModal()}`;
    document.body.classList.toggle("modal-open", state.formOpen);
    bindEvents();
    if (state.formOpen) document.getElementById("profileName")?.focus();
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
      state.formOpen = false;
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
    state.formOpen = false;
    state.lifetimePage = 0;
    persistProfiles();
    render();
  }

  function startNewProfile() {
    state.editorProfileId = null;
    state.formOpen = true;
    render();
  }

  function editActiveProfile() {
    if (!state.activeProfileId) return;
    state.editorProfileId = state.activeProfileId;
    state.formOpen = true;
    render();
  }

  function closeProfileModal() {
    state.editorProfileId = state.activeProfileId;
    state.formOpen = false;
    render();
  }

  function deleteProfile() {
    const profile = editorProfile();
    if (!profile || !window.confirm(`${profile.name}님의 저장 정보를 삭제할까요?`)) return;
    state.profiles = state.profiles.filter((p) => p.id !== profile.id);
    state.activeProfileId = state.profiles[0]?.id || null;
    state.editorProfileId = state.activeProfileId;
    state.formOpen = false;
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

  function changeLifetimePage(delta) {
    state.lifetimePage = Math.max(0, state.lifetimePage + delta);
    render();
  }

  function bindEvents() {
    document.getElementById("profileForm")?.addEventListener("submit", saveProfile);
    document.getElementById("newProfile")?.addEventListener("click", startNewProfile);
    document.getElementById("editProfile")?.addEventListener("click", editActiveProfile);
    document.getElementById("profileSelect")?.addEventListener("change", (event) => selectProfile(event.target.value));
    document.getElementById("closeProfileModal")?.addEventListener("click", closeProfileModal);
    document.getElementById("cancelProfileEdit")?.addEventListener("click", closeProfileModal);
    document.getElementById("profileModal")?.addEventListener("click", (event) => { if (event.target === event.currentTarget) closeProfileModal(); });
    document.getElementById("deleteProfile")?.addEventListener("click", deleteProfile);
    document.querySelectorAll("[data-tab]").forEach((button) => button.addEventListener("click", () => { state.tab = button.dataset.tab; state.lifetimePage = 0; render(); }));
    document.querySelectorAll("[data-result-group]").forEach((button) => button.addEventListener("click", () => { state.periodGroup = button.dataset.resultGroup; render(); }));
    document.getElementById("previousResults")?.addEventListener("click", () => changeLifetimePage(-1));
    document.getElementById("nextResults")?.addEventListener("click", () => changeLifetimePage(1));
    document.getElementById("periodValue")?.addEventListener("change", (e) => updatePeriod(e.target.value));
    document.getElementById("resetPeriod")?.addEventListener("click", resetPeriod);
    document.onkeydown = (event) => { if (event.key === "Escape" && state.formOpen) closeProfileModal(); };
  }

  try {
    render();
  } catch (error) {
    document.getElementById("app").innerHTML = `<section class="panel empty-state"><h2>앱을 불러오지 못했습니다</h2><p>${esc(error.message)}</p></section>`;
  }
})();
