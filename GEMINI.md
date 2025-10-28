---
title: "GEMINI: 블로그 글 템플릿 & 가이드"
description: "Obsidian → Astro로 자연스럽게 이어지는 마크다운 템플릿과 작성 규칙"
date: 2025-10-28
tags: [guide, template, writing]
draft: false
heroImage: /assets/hero/gemini.png
canonicalUrl: 
---

> 이 문서는 **템플릿 겸 가이드**입니다. 복제해서 새 글을 시작하세요. 파일명과 슬러그는 영어/숫자/대시(`-`)만 추천합니다.

## 1) 메타데이터(Frontmatter) 규칙

필수:
- `title`: 포스트 제목
- `date`: 최초 작성일 (ISO 형식 권장: `YYYY-MM-DD`)
- `draft`: 초안 여부 (`true`/`false`)

선택:
- `description`: 목록/OG 설명
- `updated`: 업데이트 날짜
- `tags`: 검색/분류용 태그 배열
- `heroImage`: 대표 이미지 경로 (예: `/assets/hero/...`)
- `canonicalUrl`: 중복 게시 시 정규 URL

예시:

```yaml
---
title: "예시 포스트"
description: "간단한 요약"
date: 2025-10-28
updated: 2025-11-01
tags: [astro, bun, cloudflare]
draft: false
heroImage: /assets/hero/example.jpg
canonicalUrl: https://example.com/posts/example
---
```

## 2) 제목과 소제목

- H1(`#`)은 문서 내 **한 번만** 사용 (Astro 템플릿에서 제목 영역과 일치)
- 섹션 구분은 `##`부터 시작
- 60~70자 이내의 간결한 제목 추천

## 3) 글 구조 템플릿

아래 블록을 복사해서 새 글의 뼈대를 만드세요.

```md
## TL;DR
한 문단 요약 (3~4문장).

## 배경
왜 이 글을 쓰는가? 독자가 무엇을 얻는가?

## 본문
- 핵심 아이디어 1
- 핵심 아이디어 2
- 예시/코드/스크린샷

## 체크리스트
- [ ] 독자가 바로 실행할 수 있는 단계
- [ ] 관련 링크/자료

## 마무리
핵심 요점 재정리 + 다음 읽을거리 안내
```

## 4) 표/링크/주석

GFM 지원으로 다음이 가능:
- 표(Table)
- 체크박스(Task list)
- 각주(Footnote) — 예: `각주 예시[^1]`

예시 표:

| 항목 | 값 |
| --- | --- |
| Astro | 정적 사이트 생성기 |
| Bun | 런타임/패키지 매니저 |
| Biome | 포매터 & 린터 |

각주 정의:

[^1]: 각주는 문서 하단에 정의합니다.

## 5) 코드 블록 컨벤션

- 언어 하이라이트 지정: ```ts, ```bash 등
- 짧은 명령은 인라인 코드 `` like this `` 로

예시:

```bash
bun create astro@latest my-blog
bun dev
```

```ts
const hello = (name: string) => `Hello, ${name}!`;
```

## 6) 이미지 규칙

- `public/assets/...`에 저장하고 절대경로(`/assets/...`)로 링크
- 1200×630 이상 이미지는 OG 이미지로 재사용 가능
- 캡션은 이미지 아래에 *기울임*으로 작성

예:

![샘플 이미지](/assets/hero/gemini.png)
*대표 이미지는 16:9 비율 권장*

## 7) 태그 & 슬러그

- 태그는 3~6개 이내 추천
- 파일명은 `YYYY-MM-DD-title-kebab-case.md` 형태 권장
- 내부 링크는 상대경로 마크다운 링크를 우선 사용: `[링크 텍스트](../another-post/)`

## 8) 드래프트/리비전 워크플로

1. 새 글은 `draft: true`로 시작
2. 리뷰 완료 후 `draft: false`로 변경
3. 큰 수정 시 `updated:` 갱신
4. 커밋 메시지: `post: GEMINI 가이드 초안`, `post: GEMINI 가이드 업데이트`

## 9) QA 체크리스트

- [ ] 제목이 명확하고 검색 가능한가?
- [ ] TL;DR 요약이 있는가?
- [ ] 코드/명령이 그대로 실행되는가?
- [ ] 내부/외부 링크가 404 없이 열리는가?
- [ ] 표/이미지 대체텍스트가 있는가?
- [ ] frontmatter의 `date`, `draft`, `tags`가 알맞은가?

## 10) 퍼블리시 메모

- Astro 목록 페이지는 `draft: true`를 숨깁니다.
- Cloudflare Pages 배포 전 `bun run format && bun run lint` 실행을 습관화하세요.
- `site` 설정(도메인)은 `astro.config.mjs`에서 반드시 지정하세요.

행복한 글쓰기! 🚀
