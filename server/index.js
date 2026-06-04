require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const tenantsRoutes = require('./routes/tenants');
const usersRoutes = require('./routes/users');
const clientsRoutes = require('./routes/clients');
const jobsRoutes = require('./routes/jobs');
const calendarRoutes = require('./routes/calendar');
const todosRoutes = require('./routes/todos');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/notes', notesRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', app: 'FieldVault' }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => console.log(`FieldVault server running on port ${PORT}`));
