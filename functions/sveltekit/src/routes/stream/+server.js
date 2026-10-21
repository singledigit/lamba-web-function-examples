const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function* lines() {
  const start = Date.now();
  for (let i = 1; i <= 5; i++) {
    if (i > 1) await sleep(1000);
    yield JSON.stringify({ i, elapsedMs: Date.now() - start }) + '\n';
  }
}

// Newline-delimited JSON, one object per second.
export const GET = () =>
  new Response(ReadableStream.from(lines()).pipeThrough(new TextEncoderStream()), {
    headers: { 'Content-Type': 'application/x-ndjson' },
  });
