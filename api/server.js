/**
 * Minimal Express API for KeepAlive
 * - Uses Supabase `/auth/v1/user` endpoint to validate tokens (client-side provides JWT)
 * - Uses Prisma to store apps and logs
 *
 * NOTE: Make sure DATABASE_URL and SUPABASE_URL are set in env.
 */
import express from 'express';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const PORT = process.env.PORT || 4000;

async function getUserFromToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const token = authorizationHeader.replace('Bearer ', '');
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!r.ok) return null;
    const user = await r.json();
    return user;
  } catch (err) {
    console.error('Supabase user fetch error', err);
    return null;
  }
}

app.get('/me', async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ id: user.id, email: user.email });
});

app.post('/apps', async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, url, intervalMin = 5 } = req.body;
  // find or create local user record
  let localUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!localUser) {
    localUser = await prisma.user.create({ data: { email: user.email } });
  }
  const appEntry = await prisma.app.create({ data: {
    name, url, intervalMin, userId: localUser.id
  }});
  res.json(appEntry);
});

app.get('/apps', async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const localUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!localUser) return res.json([]);
  const apps = await prisma.app.findMany({ where: { userId: localUser.id } });
  res.json(apps);
});

app.get('/apps/:id/logs', async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const logs = await prisma.pingLog.findMany({ where: { appId: req.params.id }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json(logs);
});

app.delete('/apps/:id', async (req, res) => {
  const user = await getUserFromToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  // ensure app belongs to user
  const localUser = await prisma.user.findUnique({ where: { email: user.email } });
  const appEntry = await prisma.app.findUnique({ where: { id: req.params.id }});
  if (!appEntry || appEntry.userId !== localUser?.id) return res.status(404).json({ error: 'Not found' });
  await prisma.app.delete({ where: { id: req.params.id }});
  res.json({ ok: true });
});

app.listen(PORT, () => console.log('API listening on', PORT));
