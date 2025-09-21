/**
 * Background worker which pings registered apps.
 * - Schedule runs every minute, checks app.intervalMin and lastPingAt
 * - Record results into PingLog
 *
 * Deploy this as an always-on service (Render background worker, Railway, Fly).
 */
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import Cron from 'cron';

const prisma = new PrismaClient();

async function pingApp(app) {
  const start = Date.now();
  try {
    const resp = await fetch(app.url, { method: 'GET', timeout: 15000 });
    const duration = Date.now() - start;
    await prisma.pingLog.create({ data: {
      appId: app.id,
      status: resp.status,
      ok: resp.ok,
      duration,
    }});
    await prisma.app.update({ where: { id: app.id }, data: { lastPingAt: new Date() } });
    console.log(`Ping OK ${app.url} -> ${resp.status} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    await prisma.pingLog.create({ data: {
      appId: app.id,
      status: 0,
      ok: false,
      duration,
      error: String(err)
    }});
    await prisma.app.update({ where: { id: app.id }, data: { lastPingAt: new Date() } });
    console.error(`Ping FAIL ${app.url} -> ${err}`);
  }
}

async function checkAndPing() {
  const now = new Date();
  const apps = await prisma.app.findMany({ where: { isActive: true } });
  for (const app of apps) {
    const last = app.lastPingAt || new Date(0);
    const diffMin = (now - last) / 60000;
    if (diffMin >= app.intervalMin) {
      // fire and forget
      pingApp(app).catch(console.error);
    }
  }
}

// cron every minute
const job = new Cron.CronJob('0 * * * * *', async () => {
  try {
    await checkAndPing();
  } catch (err) {
    console.error('Worker schedule error', err);
  }
});
job.start();
console.log('Worker started - cron every minute');
