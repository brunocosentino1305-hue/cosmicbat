/* Global high score table for COSMIC BATS 3D.
   Runs on Netlify Functions, stores the list in Netlify Blobs (zero setup).
   GET  /api/scores        -> the top 20
   POST /api/scores        -> { name, score, wave }, returns the updated top 20 */

import { getStore } from '@netlify/blobs';

const KEY = 'top';
const MAX = 20;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
});

export default async (req) => {
  // strong consistency: a player must see their own score right after posting
  const store = getStore({ name: 'cosmic-bats-scores', consistency: 'strong' });

  if (req.method === 'GET') {
    const list = (await store.get(KEY, { type: 'json' })) || [];
    return json(list);
  }

  if (req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch (e) { return json({ error: 'bad json' }, 400); }

    const name = String(body.name || 'PILOT')
      .toUpperCase().replace(/[^A-Z0-9 .\-]/g, '').trim().slice(0, 10) || 'PILOT';
    const score = Math.floor(Number(body.score));
    const wave = Math.floor(Number(body.wave));

    // basic sanity: this is not anti-cheat, just a guard against junk
    if (!Number.isFinite(score) || score < 0 || score > 50000000) return json({ error: 'bad score' }, 400);

    const list = (await store.get(KEY, { type: 'json' })) || [];
    list.push({ name, score, wave: Number.isFinite(wave) && wave > 0 ? wave : 1, when: Date.now() });
    list.sort((a, b) => b.score - a.score || a.when - b.when);
    const top = list.slice(0, MAX);
    await store.setJSON(KEY, top);
    return json(top);
  }

  return json({ error: 'method not allowed' }, 405);
};

export const config = { path: '/api/scores' };
