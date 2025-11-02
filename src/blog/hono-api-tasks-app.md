---
title: Hono API Tasks App
date: 2025-10-19
description: Hono로 API 서버 백앤드 만들기
tags: ["hono","api", "drizzle","zod","openapi"]
author: iceship
image: hono-api.png
alt: hono api tasks app
targetKeyword: hono
draft: false
---
## 프로젝트 기본 설정

이 프로젝트는 syntax의 CJ 영상을 참고로 만들었습니다.

> [!note] Build a documented / type-safe API with hono, drizzle, zod, OpenAPI and scalar

[CJ 영상보기](https://youtu.be/sNh9PoM9sUE?si=vbcVCFihTuHHpJsi)

### pnpm으로 project 생성

```bash title="create hono"
pnpm create hono@latest
```

> [!tip]- 여기서 template는 nodejs로 사용
> 추후 cloudflare workes로 변경

> [!info]- package manager는 pnpm 선택
> deno도 사용하고 싶은데 아직 용기가 부족

### Eslint

[antfu/eslint](https://github.com/antfu/eslint-config) 사용
```bash
pnpm dlx @antfu/eslint-config@latest
```

> [!tip] framework는 none 선택
> backend이라서 따로 framework는 선택 안 함 
```bash
┌  @antfu/eslint-config v6.0.0
fatal: not a git repository (or any of the parent directories): .git
│
◇  There are uncommitted changes in the current repository, are you sure to continue?
│  Yes
│
◇  Select a framework:
│  none
│
◇  Select a extra utils:
│  Formatter
│
◇  Update .vscode/settings.json for better VS Code experience?
│  Yes
│
◇  Bumping @antfu/eslint-config to v6.0.0
│
◇  Added packages ───────╮
│                        │
│  eslint-plugin-format  │
│                        │
├────────────────────────╯
│
◆  Changes wrote to package.json
│
◆  Created eslint.config.js
│
◆  Created .vscode/settings.json
│
◆  Setup completed
│
└  Now you can update the dependencies by run pnpm install and run eslint --fix
```

#### eslint.config.mjs 수정
```js
import antfu from "@antfu/eslint-config";

export default antfu(
  {
    type: "app",
    typescript: true,
    formatters: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: "double",
    },
    ignores: ["**/migrations/*"],
  },
  {
    rules: {
      "no-console": ["warn"],
      "antfu/no-top-level-await": ["off"],
      "node/prefer-global/process": ["off"],
      "node/no-process-env": ["error"],
      "perfectionist/sort-imports": [
        "error",
        {
          tsconfigRootDir: ".",
        },
      ],
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: ["README.md"],
        },
      ],
    },
  },
);

```
#### package.json에 lint 추가
```json
"lint": "eslint ."
```

```bash
pnpm install

pnpm approve-builds

pnpm run lint

pnpm run lint --fix
```

> [!info] pnpm run lint --fix 로 자동 수정

```typescript
serve({
  fetch: app.fetch,
  port: 3000,
}, (info) => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${info.port}`)
})
```
> [!tip] src/index.ts
> // eslint-disable-next-line no-console 를 넣어서 
> console.log 에러가 나는걸 우선 막아준다.

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "baseUrl": "./",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "paths": {
      "@/*": ["./src/*"]
    },
    "typeRoots": [
      "./node_modules/@types"
    ],
    "types": [
      "node"
    ],
    "strict": true,
    "outDir": "./dist",
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "tsc-alias": {
    "resolveFullPaths": true
  },
  "exclude": [
    "node_modules",
    "dist",
    "**/*.js"
  ]
}
```

> [!tip] import에서 @를 사용하기 위해서 paths 추가


### OpenAPI 추가

[Zod OpenAPI Hono](https://github.com/honojs/middleware/tree/main/packages/zod-openapi#zod-openapi-hono) 사용해서 OpenAPI 구현

```bash
pnpm add zod @hono/zod-openapi
```

### stocker 설치
[CJ stocker](https://github.com/w3cj/stoker) Hono library install
```bash
pnpm add stoker
```

> [!info] 404, error를 json으로 return 받기 위해서 사용
> 

사용법
```typescript
import { notFound } from "stoker/middlewares";
const app = new OpenAPIHono();
app.notFound(notFound);
app.onError(onError);
```

### logger

간단한 log 기록을 위해서 hono에서 제공하는 logger를 사용해도 되지만 
좀 더 자세한 정보를 위해 pino를 사용
#### pino 설치
[pino](https://github.com/pinojs/pino/blob/HEAD/docs/web.md#hono) hono에서 pino 사용 방법

```bash
pnpm add pino hono-pino pino-pretty
```

#### c.var.logger type error 처리하기

c.var.logger를 바로 사용하면 type error가 발생
> [!error] Property 'logger' does not exist on type 'Readonly<ContextVariableMap & object>'.ts(2339)

src/lib/types.ts 만들고 
> [!info] 프로젝트 전반의 타입 안정성과 개발 편의성을 높이기 위해, Hono의 기본 타입들을 우리 앱에 맞게 래핑(wrapping)한 유틸리티 타입을 정의한다.

```typescript
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Schema } from "hono";
import type { PinoLogger } from "hono-pino";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
};

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
```

src/lib/create-app.ts 만들고 OpenAPHono를 사용할 때 제네릭으로 AppBindings 타입 지정
```typescript
import type { Schema } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import { pinoLogger } from "@/middlewares/pino-logger";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();
  app.use(requestId())
    .use(serveEmojiFavicon("📝"))
    .use(pinoLogger());

  app.notFound(notFound);
  app.onError(onError);
  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
}
```


### .env 설정

```bash
NODE_ENV=development
PORT=9999
LOG_LEVEL=debug
DATABASE_URL=file:dev.db
```

#### dotenv package 설치
```
pnpm add dotenv dotenv-expand
```

src/env.ts를 만들고 zod를 사용한다.
```typescript
/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  ),
}));

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  DATABASE_URL: z.url(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
}).superRefine((input, ctx) => {
  if (input.NODE_ENV === "production" && !input.DATABASE_AUTH_TOKEN) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "string",
      received: "undefined",
      path: ["DATABASE_AUTH_TOKEN"],
      message: "Must be set when NODE_ENV is 'production'",
    });
  }
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
```


### Open API 추가

#### 필요 패키지 추가
```bash
pnpm add @scalar/hono-api-reference
```

#### Router 추가
src/routes/index.route.ts
> [!tip] stoker를 이용해서 HttpStatusCodes와 jsonContent를 사용한다

```typescript
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { createRouter } from "@/lib/create-app";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/",
      responses: {
        [HttpStatusCodes.OK]: jsonContent(
          createMessageObjectSchema("Tasks API"),
          "Tasks API Index",
        ),
      },
    }),
    (c) => {
      return c.json({
        message: "Tasks API",
      }, HttpStatusCodes.OK);
    },
  );

export default router;
```

#### config
src/lib/configure-open-api.ts 만들면 기본 준비 끝
```typescript
import { Scalar } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "./types";

import packageJSON from "../../package.json" with { type: "json" };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Tasks API",
    },
  });

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
      theme: "kepler",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    }),
  );
}
```

## Tasks API 시작

### Drizzle ORM 설치
```bash
pnpm add drizzle-orm @libsql/client drizzle-zod
pnpm add -D drizzle-kit
```

#### drizzle.config.ts
turso를 사용한다
```typescript
import { defineConfig } from "drizzle-kit";

import env from "@/env";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "turso",
  casing: "snake_case",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
});
```

#### src/db 폴더
src/db/index.ts
```typescript
import { drizzle } from "drizzle-orm/libsql";

import env from "@/env";

import * as schema from "./schema";

const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  casing: "snake_case",
  schema,
});

export default db;
```

src/db/schema.ts
> [!tip] 미리 selectTasksSchema와 insertTaskSchema를 만들어두자
```typescript
import { z } from "@hono/zod-openapi";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { toZodV4SchemaTyped } from "@/lib/zod-utils";

export const tasks = sqliteTable("tasks", {
  id: integer({ mode: "number" })
    .primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  done: integer({ mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const selectTasksSchema = toZodV4SchemaTyped(createSelectSchema(tasks));

export const insertTasksSchema = toZodV4SchemaTyped(createInsertSchema(
  tasks,
  {
    name: field => field.min(1).max(500),
  },
).required({
  done: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}));

// @ts-expect-error partial exists on zod v4 type
export const patchTasksSchema = insertTasksSchema.partial();
```

#### generate, migrate or push
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate 
pnpm drizzle-kit push
```

#### drizzle-kit studio
```bash
pnpm drizzle-kit studio
```

### Tasks
#### src/routes/tasks/tasks.index.ts
```typescript
import { createRouter } from "@/lib/create-app";

import * as handlers from "./tasks.handlers";
import * as routes from "./tasks.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list);
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
```

#### src/routes/tasks/tasks.routes.ts
```typescript
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertTasksSchema, patchTasksSchema, selectTasksSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["Tasks"];

export const list = createRoute({
  path: "/tasks",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(selectTasksSchema),
      "The list of tasks",
    ),
  },
});

export const create = createRoute({
  path: "/tasks",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertTasksSchema,
      "The task to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The created task",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertTasksSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/tasks/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The requested task",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/tasks/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchTasksSchema,
      "The task updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectTasksSchema,
      "The updated task",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchTasksSchema)
        .or(createErrorSchema(IdParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/tasks/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Task deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid id error",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
```

#### src/routes/tasks/tasks.handlers.ts
```typescript
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { tasks } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./tasks.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const tasks = await db.query.tasks.findMany();
  return c.json(tasks);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const task = c.req.valid("json");
  const [inserted] = await db.insert(tasks).values(task).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const task = await db.query.tasks.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!task) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [task] = await db.update(tasks)
    .set(updates)
    .where(eq(tasks.id, id))
    .returning();

  if (!task) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const result = await db.delete(tasks)
    .where(eq(tasks.id, id));

  if (result.rowsAffected === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
```

### Test
> [!tip] package.json
>     "test": "cross-env NODE_ENV=test vitest" 추가
> ```shell
> pnpm add -D cross-env vitest
> pnpm run test
> ```
>     

#### vitest.config.ts
```typescript
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```
#### src/routes/tasks/tasks.test.ts
```typescript
import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { ZodIssueCode } from "zod";

import env from "@/env";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createTestApp } from "@/lib/create-app";

import router from "./tasks.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createTestApp(router));

describe("tasks routes", () => {
  beforeAll(async () => {
    execSync("pnpm drizzle-kit push");
  });

  afterAll(async () => {
    fs.rmSync("test.db", { force: true });
  });

  it("post /tasks validates the body when creating", async () => {
    const response = await client.tasks.$post({
      json: {
        done: false,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_STRING);
    }
  });

  const id = 1;
  const name = "Learn vitest";

  it("post /tasks creates a task", async () => {
    const response = await client.tasks.$post({
      json: {
        name,
        done: false,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe(name);
      expect(json.done).toBe(false);
    }
  });

  it("get /tasks lists all tasks", async () => {
    const response = await client.tasks.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBe(1);
    }
  });

  it("get /tasks/{id} validates the id param", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        id: "wat",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

  it("get /tasks/{id} returns 404 when task not found", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        id: 999,
      },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    }
  });

  it("get /tasks/{id} gets a single task", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        id,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.name).toBe(name);
      expect(json.done).toBe(false);
    }
  });

  it("patch /tasks/{id} validates the body when updating", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        name: "",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].code).toBe(ZodIssueCode.too_small);
    }
  });

  it("patch /tasks/{id} validates the id param", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        id: "wat",
      },
      json: {},
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

  it("patch /tasks/{id} validates empty body", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {},
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].code).toBe(ZOD_ERROR_CODES.INVALID_UPDATES);
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.NO_UPDATES);
    }
  });

  it("patch /tasks/{id} updates a single property of a task", async () => {
    const response = await client.tasks[":id"].$patch({
      param: {
        id,
      },
      json: {
        done: true,
      },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.done).toBe(true);
    }
  });

  it("delete /tasks/{id} validates the id when deleting", async () => {
    const response = await client.tasks[":id"].$delete({
      param: {
        id: "wat",
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("id");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
    }
  });

  it("delete /tasks/{id} removes a task", async () => {
    const response = await client.tasks[":id"].$delete({
      param: {
        id,
      },
    });
    expect(response.status).toBe(204);
  });
});
```


끝

