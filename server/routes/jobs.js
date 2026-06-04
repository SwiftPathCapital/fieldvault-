const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const getTenantId = (req, queryTenantId) => {
  if (req.user.role === 'superadmin' && queryTenantId) return queryTenantId;
  return req.user.tenant_id;
};

// GET all jobs
router.get('/', requireAuth, async (req, res) => {
  const tenant_id = getTenantId(req, req.query.tenant_id);
  let query = supabase
    .from('jobs')
    .select('*, clients(first_name, last_name, phone, email), users(first_name, last_name)')
    .order('created_at', { ascending: false });
  if (tenant_id) query = query.eq('tenant_id', tenant_id);
  if (req.query.status) query = query.eq('status', req.query.status);
  if (req.query.assigned_to) query = query.eq('assigned_to', req.query.assigned_to);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET single job with notes and todos
router.get('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, clients(*), notes(*), todos(*), users(first_name, last_name)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Job not found' });
  res.json(data);
});

// CREATE job
router.post('/', requireAuth, async (req, res) => {
  const tenant_id = getTenantId(req, req.body.tenant_id);
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...req.body, tenant_id })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// UPDATE job
router.put('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('jobs')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE job
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase.from('jobs').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
