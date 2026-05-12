const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Golden4visa';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'teemie-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Data helpers
const dataPath = (file) => path.join(__dirname, 'data', file);
const readData = (file) => JSON.parse(fs.readFileSync(dataPath(file), 'utf8'));
const writeData = (file, data) => fs.writeFileSync(dataPath(file), JSON.stringify(data, null, 2));

// Auth middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.admin) return next();
  res.redirect('/admin/login');
};

// ─── PUBLIC ROUTES ────────────────────────────────────

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'services.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'contact.html')));
app.get('/work', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pages', 'work.html')));

// ─── PUBLIC API ───────────────────────────────────────

app.get('/api/services', (req, res) => res.json(readData('services.json')));
app.get('/api/testimonials', (req, res) => res.json(readData('testimonials.json')));
app.get('/api/projects', (req, res) => res.json(readData('projects.json')));

// ─── ADMIN AUTH ───────────────────────────────────────

app.get('/admin', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'admin', 'dashboard.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'login.html')));

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.admin = true;
    res.redirect('/admin');
  } else {
    res.redirect('/admin/login?error=1');
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ─── ADMIN API ────────────────────────────────────────

// Services CRUD
app.get('/admin/api/services', requireAuth, (req, res) => res.json(readData('services.json')));
app.post('/admin/api/services', requireAuth, (req, res) => {
  const services = readData('services.json');
  const newItem = { ...req.body, id: Date.now() };
  services.push(newItem);
  writeData('services.json', services);
  res.json({ success: true, item: newItem });
});
app.put('/admin/api/services/:id', requireAuth, (req, res) => {
  let services = readData('services.json');
  services = services.map(s => s.id == req.params.id ? { ...s, ...req.body } : s);
  writeData('services.json', services);
  res.json({ success: true });
});
app.delete('/admin/api/services/:id', requireAuth, (req, res) => {
  let services = readData('services.json');
  services = services.filter(s => s.id != req.params.id);
  writeData('services.json', services);
  res.json({ success: true });
});

// Testimonials CRUD
app.get('/admin/api/testimonials', requireAuth, (req, res) => res.json(readData('testimonials.json')));
app.post('/admin/api/testimonials', requireAuth, (req, res) => {
  const items = readData('testimonials.json');
  const newItem = { ...req.body, id: Date.now() };
  items.push(newItem);
  writeData('testimonials.json', items);
  res.json({ success: true, item: newItem });
});
app.put('/admin/api/testimonials/:id', requireAuth, (req, res) => {
  let items = readData('testimonials.json');
  items = items.map(t => t.id == req.params.id ? { ...t, ...req.body } : t);
  writeData('testimonials.json', items);
  res.json({ success: true });
});
app.delete('/admin/api/testimonials/:id', requireAuth, (req, res) => {
  let items = readData('testimonials.json');
  items = items.filter(t => t.id != req.params.id);
  writeData('testimonials.json', items);
  res.json({ success: true });
});

// Projects CRUD
app.get('/admin/api/projects', requireAuth, (req, res) => res.json(readData('projects.json')));
app.post('/admin/api/projects', requireAuth, (req, res) => {
  const items = readData('projects.json');
  const newItem = { ...req.body, id: Date.now() };
  items.push(newItem);
  writeData('projects.json', items);
  res.json({ success: true, item: newItem });
});
app.put('/admin/api/projects/:id', requireAuth, (req, res) => {
  let items = readData('projects.json');
  items = items.map(p => p.id == req.params.id ? { ...p, ...req.body } : p);
  writeData('projects.json', items);
  res.json({ success: true });
});
app.delete('/admin/api/projects/:id', requireAuth, (req, res) => {
  let items = readData('projects.json');
  items = items.filter(p => p.id != req.params.id);
  writeData('projects.json', items);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`✦ Teemie Portfolio running on port ${PORT}`));
