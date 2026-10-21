import { json } from '@sveltejs/kit';

export const GET = ({ params }) =>
  json({ id: params.id, name: `item-${params.id}`, framework: 'sveltekit' });

export const POST = async ({ params, request }) =>
  json({ id: params.id, youSent: await request.json(), method: 'POST', at: new Date().toISOString() });
