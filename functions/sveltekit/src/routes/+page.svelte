<script>
  let { data } = $props();
</script>

<h1>SvelteKit on Lambda Web Functions</h1>

<p>Rendered at {data.renderedAt}</p>

{#await data.slow}
  <p>Waiting for slow data…</p>
{:then slow}
  <p>Streamed in at {slow.resolvedAt}</p>
{/await}
