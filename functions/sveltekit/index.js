// Server-rendered SvelteKit app on Lambda Web Functions, built with adapter-node.
//
// `npm run build` writes a standalone Node server to build/. That server reads HOST and PORT,
// so this entry maps AWS_LAMBDA_HTTP_ENDPOINT (host:port) onto them and then starts it.
// Falls back to localhost:3000 for local runs where the variable is unset.
const [host, port] = (process.env.AWS_LAMBDA_HTTP_ENDPOINT || 'localhost:3000').split(':');
process.env.HOST = host;
process.env.PORT = port;

// Dynamic import: a static one would be hoisted and read HOST/PORT before they are set.
await import('./build/index.js');
