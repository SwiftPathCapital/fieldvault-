const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  let query = supabase.from('notes').select('*, users(first_name,last_name)').eq('tenant_id', req.user.tenant_id).order('created_at', { ascending: false });
  if (req.query.client_id) query = query.eq('client_id', req.query.client_id);
  if (req.query.job_id) query = query.eq('job_id', req.query.job_id);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('notes')
    .insert({ ...req.body, tenant_id: req.user.tenant_id, author_id: req.user.id })
    .select('*, users(first_name,last_name)').single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase.from('notes').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
