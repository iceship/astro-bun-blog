---
title: Typescript, Node.js 초기화
date: 2025-12-03
description: 프로젝트 초기화 typescript사용하는 node.js
tags:
  - typescript
  - node
  - init
author: iceship
image: typescript-node.js-init-1764724377719.webp
alt: typescript node.js
targetKeyword: init
draft: false
---
### Typescript + Node.js Init

기억하기보다 적어두는 초기화

```shell
pnpm init
pnpm i -D @types/node typescript
pnpm tsc --init
```

#### tsconfig.json
```json 
// tsconfig.json
{
  "types": ["node"],
}
```

#### package.json
```json
// package.json
{
  "type": "module",
}
```

#### run
```
node index.ts
```

끝
