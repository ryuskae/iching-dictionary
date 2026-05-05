# 周易辭典 · 주역 사전 · I Ching Dictionary

주역 64괘의 괘사와 효사를 **원문(한문) · 영문(빌헬름 역) · 한글**로 제공하는 웹 사전 및 오픈 데이터셋입니다.

🔗 **[웹 사전 바로가기](https://ryuskae.github.io/iching-dictionary/)**

---

## 📖 웹 사전

상괘와 하괘를 선택하면 해당 괘의 괘사와 효사를 세 가지 언어로 확인할 수 있습니다.

**주요 기능**
- 팔괘 선택으로 64괘 탐색
- 괘사 · 효사 원문 / 빌헬름 영역 / 한글 번역 동시 표시
- 괘명 · 괘사 · 효사 전문 검색
- 한 · EN · 漢 UI 언어 전환
- 모바일 · 태블릿 · 데스크탑 반응형 레이아웃

---

## 📦 JSON 데이터

**한글 번역이 포함된 주역 JSON 데이터**  
영문(빌헬름 역)만 포함된 기존 오픈소스 데이터셋과 달리, 이 데이터는 원문 · 영문 · 한글을 모두 포함합니다.

### 무료 CDN으로 바로 사용하기

```js
fetch('https://cdn.jsdelivr.net/gh/ryuskae/iching-dictionary@main/iching.json')
  .then(r => r.json())
  .then(data => console.log(data.hexagrams));
```

### 데이터 구조

```json
{
  "hexagrams": [
    {
      "id": 1,
      "name_kr": "건",
      "name_zh": "乾",
      "unicode": "䷀",
      "trigram_upper": "건(乾)",
      "trigram_lower": "건(乾)",
      "judgment": {
        "original": "乾。元亨利貞。",
        "wilhelm": "THE CREATIVE works sublime success, furthering through perseverance.",
        "korean": "건은 크게 형통하니 바름을 굳게 지킴이 이롭다."
      },
      "image": {
        "original": "天行健，君子以自強不息。",
        "wilhelm": "The movement of heaven is full of power...",
        "korean": "하늘의 운행이 굳세니..."
      },
      "lines": [
        {
          "line": 1,
          "position": "초구(初九)",
          "original": "潛龍勿用。",
          "wilhelm": "Hidden dragon. Do not act.",
          "korean": "잠긴 용이니 쓰지 말라."
        }
      ]
    }
  ]
}
```

### 필드 설명

| 필드 | 설명 |
|------|------|
| `id` | 괘 번호 (1~64, 문왕 서괘 순서) |
| `name_kr` | 한국어 괘명 |
| `name_zh` | 한자 괘명 |
| `unicode` | 육효 유니코드 문자 |
| `trigram_upper` / `trigram_lower` | 상괘 / 하괘 이름 |
| `judgment.original` | 괘사 원문 (한문) |
| `judgment.wilhelm` | 괘사 영역 (Richard Wilhelm, 1950) |
| `judgment.korean` | 괘사 한글 번역 |
| `image` | 상전(象傳) — original / wilhelm / korean |
| `lines[].line` | 효 번호 (1~6) |
| `lines[].position` | 효 위치명 (초구, 구이 등) |
| `lines[].original` | 효사 원문 |
| `lines[].wilhelm` | 효사 영역 |
| `lines[].korean` | 효사 한글 번역 |

---

## 출처

- 원문: 주역(周易) 원전
- 영문: Richard Wilhelm · Cary F. Baynes 역, *The I Ching or Book of Changes* (1950)
- 한글: 본 프로젝트 번역

---

## English Summary

**I Ching Dictionary** — A web app and open dataset for the 64 hexagrams of the I Ching.

This is one of the few structured JSON datasets that includes **Korean translations** alongside the classical Chinese source text and the Wilhelm/Baynes English translation.

**CDN usage:**
```js
fetch('https://cdn.jsdelivr.net/gh/ryuskae/iching-dictionary@main/iching.json')
```

Each hexagram entry contains:
- `judgment` and `image` (Tuan/Xiang) with `original`, `wilhelm`, and `korean` fields
- All 6 lines (`lines[]`) with `original`, `wilhelm`, and `korean` fields

---

*A reading is a mirror, not a map.*
