---
title: Hono Basic
date: 2025-10-21
description: Hono Basic
tags: ["hono"]
author: iceship
image: hono-basic.png
alt: Hono Basic
targetKeyword: Hono
draft: false
---
## Hono Basic

> [!info] [hono example basic](https://github.com/honojs/examples/tree/main/basic)을 참고로 작성되었습니다.

> [!tip] 관련 소스는 [github](https://github.com/iceship/hono-example-basic)에서 확인할 수 있습니다.
### 시작
```bash
pnpm create hono@latest
```

```shell
pnpm create hono@latest
create-hono version 0.19.2
✔ Target directory basic
✔ Which template do you want to use? cloudflare-workers
✔ Do you want to install project dependencies? Yes
✔ Which package manager do you want to use? pnpm
✔ Cloning the template
✔ Installing project dependencies
🎉 Copied project files
Get started with: cd basic
```
### biome
우선 biome 설정
```
pnpm add -D -E @biomejs/biome
pnpm exec biome init
```
vscode에 [biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) 설치
### vitest
```
pnpm add -D vitest
```
vitest.config.ts 생성
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true
  }
})
```
package.json에 추가
```typescript
"test": "vitest"
```
### types
```bash
pnpm run cf-typegen
```
tsconfig.json에 추가
```typescript
    "types": [
      "vitest/globals",
      "./worker-configuration.d.ts"
    ]
```
### src/index.ts
```typescript
import { Hono } from 'hono'
import { basicAuth } from 'hono/basic-auth'
import { etag } from 'hono/etag'
import { poweredBy } from 'hono/powered-by'
import { prettyJSON } from 'hono/pretty-json'

const app = new Hono()

// Mount Builtin Middleware
app.use('*', poweredBy())
// app.use('*', logger())
app.use(
  '/auth/*',
  basicAuth({
    username: 'hono',
    password: 'acoolproject'
  })
)
app.use('/etag/*', etag())

// Custom Middleware
// Add Custom Header
app.use('/hello/*', async (c, next) => {
  await next()
  c.header('X-message', 'This is addHeader middleware!')
})

// Add X-Response-Time header
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  c.header('X-Response-Time', `${ms}ms`)
})

// Custom Not Found Message
app.notFound((c) => {
  return c.text('Custom 404 Not Found', 404)
})

// Error handling
app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Custom Error Message', 500)
})

// Routing
app.get('/', (c) => c.text('Hono!!'))
// Use Response object directly
app.get('/hello', () => new Response('This is /hello'))

// Named parameter
app.get('/entry/:id', (c) => {
  const id = c.req.param('id')
  return c.text(`Your ID is ${id}`)
})

// Nested route
const book = new Hono()
book.get('/', (c) => c.text('List Books'))
book.get('/:id', (c) => {
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})
book.post('/', (c) => c.text('Create Book'))
app.route('/book', book)

// Redirect
app.get('/redirect', (c) => c.redirect('/'))
// Authentication required
app.get('/auth/*', (c) => c.text('You are authorized'))
// ETag
app.get('/etag/cached', (c) => c.text('Is this cached?'))

// Async
app.get('/fetch-url', async (c) => {
  const response = await fetch('https://example.com/')
  return c.text(`https://example.com/ is ${response.status}`)
})

// Request headers
app.get('/user-agent', (c) => {
  const userAgent = c.req.header('User-Agent')
  return c.text(`Your UserAgent is ${userAgent}`)
})

// JSON
app.get('/api/posts', prettyJSON(), (c) => {
  const posts = [
    { id: 1, title: 'Good Morning' },
    { id: 2, title: 'Good Afternoon' },
    { id: 3, title: 'Good Evening' },
    { id: 4, title: 'Good Night' }
  ]
  return c.json(posts)
})
// status code
app.post('/api/posts', (c) => c.json({ message: 'Created!' }, 201))
// default route
app.get('/api/*', (c) => c.text('API endpoint is not found', 404))

// Throw Error
app.get('/error', () => {
  throw Error('Error has occurred')
})

// @ts-ignore
app.get('/type-error', () => 'return not Response instance')

export default app
```
### src/index.test.ts
```typescript
import app from './index'

describe('Example', () => {
  test('GET /', async () => {
    const res = await app.request('http://localhost:8787/')
    expect(res.status).toBe(200)
    expect(res.headers.get('x-powered-by')).toBe('Hono')
  })
})
```

### final test
```bash
pnpm run test
```