const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth, requireSuperAdmin, requireAdmin } = require('../middleware/auth');

// TENANTS (superadmin only)
router.get('/', requireAuth, requireSuperAdmin, async (req, res) => {
  const { data, error } = await supabase.from('tenants').select('*, users(count)').order('created_at');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', requireAuth, requireSuperAdmin, async (req, res) => {
  const { data, error } = await supabase.from('tenants').insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  const { data, error } = await supabase.from('tenants').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;
