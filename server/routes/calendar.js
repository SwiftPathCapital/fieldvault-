const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  let query = supabase
    .from('calendar_events')
    .select('*, clients(first_name,last_name), jobs(title,service_type), users!assigned_to(first_name,last_name)')
    .eq('tenant_id', req.user.tenant_id)
    .order('start_time');
  if (req.query.start) query = query.gte('start_time', req.query.start);
  if (req.query.end) query = query.lte('start_time', req.query.end);
  if (req.user.role === 'staff') query = query.eq('assigned_to', req.user.id);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({ ...req.body, tenant_id: req.user.tenant_id, created_by: req.user.id })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('calendar_events').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase.from('calendar_events').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
