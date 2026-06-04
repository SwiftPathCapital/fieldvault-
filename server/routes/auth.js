const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  const { data: profile } = await supabase
    .from('users')
    .select('*, tenants(*)')
    .eq('id', data.user.id)
    .single();

  res.json({ session: data.session, user: profile });
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
  const { data } = await supabase
    .from('users')
    .select('*, tenants(*)')
    .eq('id', req.user.id)
    .single();
  res.json(data);
});

// Logout
router.post('/logout', requireAuth, async (req, res) => {
  await supabase.auth.signOut();
  res.json({ success: true });
});

module.exports = router;
