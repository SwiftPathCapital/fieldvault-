const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET users in tenant
router.get('/', requireAuth, async (req, res) => {
  let query = supabase.from('users').select('*').order('first_name');
  if (req.user.role === 'superadmin' && req.query.tenant_id) {
    query = query.eq('tenant_id', req.query.tenant_id);
  } else if (req.user.role !== 'superadmin') {
    query = query.eq('tenant_id', req.user.tenant_id);
  }
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// CREATE user (invite) - admin creates auth user then profile
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { email, password, first_name, last_name, role, phone } = req.body;
  const tenant_id = req.user.role === 'superadmin' ? req.body.tenant_id : req.user.tenant_id;

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (authError) return res.status(400).json({ error: authError.message });

  // Create profile
  const { data, error } = await supabase.from('users').insert({
    id: authData.user.id,
    tenant_id,
    role,
    first_name,
    last_name,
    email,
    phone
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// UPDATE user
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('users').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Deactivate user
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabase.from('users').update({ is_active: false }).eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
