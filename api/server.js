import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
app.use(cors()); app.use(express.json());
app.use(express.static(join(__dirname, '..')));
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;
const memStore = new Map();
// ⚡ Bolt: Cache API leaderboard to reduce database queries. Invalidate on new vitals.
let leaderboardCache = null;

const normalizeZ = z => Math.max(0, Math.min(1, (z + 3) / 6));
const calcDI = (ec, z) => Number((Number(ec) * 0.65 + normalizeZ(Number(z)) * 0.35).toFixed(4));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.post('/api/global/vitals', async (req, res) => {
  try {
    const arr = Array.isArray(req.body) ? req.body : [req.body];
    const rows = arr.map(v => ({ source_module: v.source_module, efficiency_coefficient: v.efficiency_coefficient, zscore: v.domain_kpis?.zscore ?? 0, signal_status: v.signal_status, system_timestamp: v.system_timestamp || new Date().toISOString() }));
    // Optimization: Batch upsert instead of N+1 queries. Reduces network roundtrips from O(N) to O(1).
    if (supabase) {
      const { error } = await supabase.from('vitals').upsert(rows, { onConflict: 'source_module' });
      if (error) rows.forEach(r => memStore.set(r.source_module, r));
    } else {
      rows.forEach(r => memStore.set(r.source_module, r));
    }
    // ⚡ Bolt: Invalidate leaderboard cache
    leaderboardCache = null;
    res.status(202).json({ status: 'accepted', count: arr.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/leaderboard', async (req, res) => {
  try {
    // ⚡ Bolt: Serve from cache if available to prevent constant DB polling
    if (leaderboardCache) return res.json(leaderboardCache);

    const rows = supabase ? (await supabase.from('vitals').select('*')).data || [] : Array.from(memStore.values());
    // ⚡ Bolt: Optimize large array mapping and sorting by replacing map().sort().map()
    // with pre-allocated array and direct property assignment to minimize memory churn
    const data = new Array(rows.length);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      data[i] = {
        module: r.source_module?.includes('golf') ? 'SPACEZGOLF' : 'BLUE HORIZON',
        dominanceIndex: calcDI(r.efficiency_coefficient, r.zscore),
        efficiency: Number(r.efficiency_coefficient),
        zscore: Number(r.zscore),
        signal: r.signal_status,
        timestamp: r.system_timestamp
      };
    }
    data.sort((a, b) => b.dominanceIndex - a.dominanceIndex);
    for (let i = 0; i < data.length; i++) {
      data[i].rank = i + 1;
    }

    // ⚡ Bolt: Store in cache
    leaderboardCache = data;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/analyze-swing', async (req, res) => {
  const { frames } = req.body;
  if (!frames?.length) return res.status(400).json({ error: 'No frames provided' });
  if (!process.env.XAI_API_KEY) return res.status(500).json({ error: 'XAI_API_KEY not set' });
  try {
    const r = await fetch('https://api.x.ai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.XAI_API_KEY}` }, body: JSON.stringify({ model: 'grok-vision-beta', messages: [{ role: 'system', content: 'Golf swing analyst. Return JSON: {tips:string[],issues:string[],score:number}' }, { role: 'user', content: frames.map(f => ({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${f}` } })) }], max_tokens: 500 }) });
    const d = await r.json(); const text = d.choices?.[0]?.message?.content || ''; const m = text.match(/\{[\s\S]*\}/); res.json(m ? JSON.parse(m[0]) : { tips: [text], issues: [], score: 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('*', (req, res) => res.sendFile(join(__dirname, '..', 'index.html')));
app.listen(port, () => console.log(`🚀 SpaceZgolf live → http://localhost:${port}`));
