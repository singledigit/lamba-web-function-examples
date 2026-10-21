# sveltekit

Demonstrates a server-rendered [SvelteKit](https://svelte.dev/docs/kit) app running on Lambda
Web Functions with [`adapter-node`](https://svelte.dev/docs/kit/adapter-node). The page's
`load` function returns a promise that resolves after 2 seconds. SvelteKit sends the page
immediately and streams the resolved value to the client when it arrives.

`npm run build` writes a standalone Node server to `build/` that listens on `HOST` and `PORT`.
[`index.js`](index.js) sets both from `AWS_LAMBDA_HTTP_ENDPOINT`, then imports
`./build/index.js`. Every package is a dev dependency, so the build bundles everything the
server imports and `npm prune --omit=dev` removes all of them before deploying.

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Server-rendered page with streamed `load` data |
| GET | `/health` | Health check |
| GET | `/items/:id` | Path-param example |
| POST | `/items/:id` | Echoes the JSON body back |
| GET | `/stream` | NDJSON, one line per second |

## Test

```bash
npm install
npm run build
node index.js
curl http://localhost:3000/items/42
curl -X POST http://localhost:3000/items/42 -H 'Content-Type: application/json' -d '{"hello":"world"}'
curl -N http://localhost:3000/stream
curl -N http://localhost:3000/
```

The page arrives with a pending state, followed by a `<script>` carrying the resolved value
2 seconds later.

## Deploy

See the [root README](../../README.md#deploy):

```bash
npm install && npm run build && npm prune --omit=dev && aws lambda-web deploy --name sveltekit --code . --create
```
