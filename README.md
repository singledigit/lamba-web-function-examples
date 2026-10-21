# Lambda Web Functions — Protocol Demos

> Companion code for [Why I'm Excited About AWS Lambda Web Functions](https://edjgeek.com/blog/why-i-m-excited-about-lambda-web-functions/) — clone this repo and run the examples alongside that post.

[AWS Lambda Web Functions](https://aws.amazon.com/lambda/) let you run a real web server on
Lambda infrastructure. You write a standard Node.js HTTP server with `http.createServer()`
(or a framework like Hono), it listens on a port, and the platform hands it a public HTTPS
URL. No Lambda handler, no [Amazon API Gateway](https://aws.amazon.com/api-gateway/) in
front, no framework lock-in — the same code you'd run anywhere else.

This repo collects small, single-purpose functions. Each one demonstrates a single web
protocol or a popular framework running on Web Functions. This README is how to run and
deploy them.

Reference links: the [announcement blog post](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-web-functions-for-fast-consistent-web-app-performance-anywhere/)
and the [developer guide](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html).

## What each function demonstrates

| Folder | Protocol | Framework |
|--------|----------|-----------|
| [`functions/rest-hono`](functions/rest-hono) | HTTP/1.1 request/response (REST) | [Hono](https://hono.dev/) |
| [`functions/sse-hono`](functions/sse-hono) | Server-Sent Events (`text/event-stream`) | Hono |
| [`functions/streaming-ndjson`](functions/streaming-ndjson) | Chunked streaming (NDJSON + text) | Hono |
| [`functions/rpc-connect`](functions/rpc-connect) | Connect + gRPC-Web RPC (unary + server-streaming) | [Connect](https://connectrpc.com/) |
| [`functions/webhook`](functions/webhook) | Signature-verified webhook receiver (HMAC-SHA256) | built-in `http` |
| [`functions/iam-auth`](functions/iam-auth) | IAM (SigV4) authenticated endpoint | built-in `http` |
| [`functions/express`](functions/express) | REST | [Express](https://expressjs.com/) |
| [`functions/fastify`](functions/fastify) | REST | [Fastify](https://fastify.dev/) |
| [`functions/sveltekit`](functions/sveltekit) | SSR with streamed `load` data, REST, NDJSON | [SvelteKit](https://svelte.dev/docs/kit) |

Each folder has its own README with routes, test commands, and any protocol-specific notes.

## Protocol support

Web Functions serve over **HTTP/1.1**:

- HTTP/1.1 REST, SSE, and chunked streaming work fully — responses stream to the client
  incrementally instead of buffering.
- Connect and gRPC-Web (unary and server-streaming) run over HTTP/1.1 from a single
  [Connect](https://connectrpc.com/) server. Native gRPC and bidirectional streaming need
  HTTP/2, which isn't supported.

Requests have a maximum duration (the revision's `timeoutSeconds`, up to 900s), so streams
and connections are bounded.

## The runtime contract

Every function in this repo follows the same rules:

1. It's a standard HTTP server that **listens on the host and port given by
   `AWS_LAMBDA_HTTP_ENDPOINT`** (default `localhost:3000` when unset, for local runs). Your
   code must call `listen()`; the server has to begin listening within 10 seconds of startup.
2. The entry file is **`index.js`** by default. To use a different entry file, set
   `AWS_LAMBDA_NODEJS_ENTRYPOINT`, or pass `--entry-point` at deploy time.
3. **`GET /ping` is reserved** by the platform. It's answered directly (plain `200 healthy`)
   and never reaches your app. Use a namespaced path like `/health` for your own checks — all
   the demos do.
4. Each execution environment handles multiple concurrent requests, up to
   `maxConcurrencyPerEnvironment` (default **64**, configurable **1–128** via
   `--max-concurrency-per-environment`).

## Run locally

```bash
cd functions/rest-hono
npm install
node index.js        # listens on http://localhost:3000
```

`rpc-connect` also generates code from its `.proto` file — see its README for that step.

## Deploy

```bash
aws lambda-web deploy --name rest-hono --code ./functions/rest-hono --create
```

Re-run the same command to ship changes — it deploys a new revision and points the
endpoint at it.

To deploy all of them:

```bash
for fn in rest-hono sse-hono streaming-ndjson rpc-connect express fastify webhook; do
  aws lambda-web deploy --name "$fn" --code "./functions/$fn" --create
done
```

Two functions need extra flags:
- `webhook` reads a `WEBHOOK_SECRET` env var: add `--env WEBHOOK_SECRET=your-secret`.
- `iam-auth` should be deployed with `--auth-type IamAuth` — see its README.

Tear down a function when you're done:

```bash
aws lambda-web delete-web-function --function-name rest-hono
```

## Auth

Auth is set per endpoint (`--auth-type`):

- **`ApplicationManaged`** (default) — the platform enforces no auth; your app authenticates
  requests itself. All demos here use this. [`functions/webhook`](functions/webhook) is the
  clearest example (HMAC signature verification in the handler).
- **`IamAuth`** — the request must be SigV4-signed and the caller needs
  `lambda:InvokeWebFunctionEndpoint`. See [`functions/iam-auth`](functions/iam-auth) for the
  full signing recipe, including the three details that are easy to get wrong (signing
  service name `lambda`, mandatory `x-amz-content-sha256` header, and the IAM action/ARN
  scope).

## Repo layout

```
.
├── README.md
└── functions/
    ├── rest-hono/            # HTTP/1.1 REST (Hono)
    ├── sse-hono/             # Server-Sent Events (Hono)
    ├── streaming-ndjson/     # chunked NDJSON / text streaming (Hono)
    ├── rpc-connect/          # Connect + gRPC-Web RPC (Connect)
    ├── webhook/              # HMAC-signed webhook receiver (http)
    ├── iam-auth/             # IAM (SigV4) authenticated endpoint (http)
    ├── express/              # REST (Express)
    └── fastify/              # REST (Fastify)
```
