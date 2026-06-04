const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// Scope helper: superadmin can pass tenant_id, others use their own
const getTenantId = (req, queryTenantId) => {
  if (req.user.role === 'superadmin' && queryTenantId) return queryTenantId;
  return req.user.tenant_id;
};

// GET all clients
router.get('/', requireAuth, async (req, res) => {
  const tenant_id = getTenantId(req, req.query.tenant_id);
  let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (tenant_id) query = query.eq('tenant_id', tenant_id);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET single client with jobs and notes
router.get('/:id', requireAuth, async (req, res) => {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*, jobs(*), notes(*)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
});

// CREATE client
router.post('/', requireAuth, async (req, res) => {
  const tenant_id = getTenantId(req, req.body.tenant_id);
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...req.body, tenant_id })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// UPDATE client
router.put('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE client
router.delete('/:id', requireAuth, async (req, res) => {
  const { error } = await supabase.from('clients').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
