// TODOS
const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  let query = supabase.from('todos').select('*, clients(first_name,last_name), jobs(title)').order('due_date');
  if (req.user.role === 'staff') query = query.eq('assigned_to', req.user.id);
  else query = query.eq('tenant_id', req.user.tenant_id);
  if (req.query.is_done !== undefined) query = query.eq('is_done', req.query.is_done === 'true');
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('todos')
    .insert({ ...req.body, tenant_id: req.user.tenant_id })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('todos').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase.from('todos').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
