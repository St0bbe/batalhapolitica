import http from 'node:http';
import { WebcastPushConnection } from 'tiktok-live-connector';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3001);
const username = (process.env.TIKTOK_USERNAME || '').replace(/^@/, '').trim();
const clients = new Set();
const teams = new Map();
const lastLikes = new Map();
const lastGift = new Map();
let connected = false;
let live;
const clean = s => String(s ?? '').slice(0, 64);
const emit = event => {
  const payload = 'data: ' + JSON.stringify(event) + '\n\n';
  for (const res of clients) { try { res.write(payload); } catch { clients.delete(res); } }
};
const status = (message, online = connected) => emit({ kind: 'status', online, message });
const choose = text => {
  const t = clean(text).trim().toLowerCase();
  if (/^!(azul|flavio|flávio|0)$/.test(t)) return 0;
  if (/^!(vermelho|lula|1)$/.test(t)) return 1;
  return null;
};
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ online: connected, configured: !!username, username }));
    return;
  }
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });
    clients.add(res);
    res.write('retry: 3000\n\n');
    res.write('data: ' + JSON.stringify({kind:'status',online:connected,message:connected?'TikTok conectado':'Aguardando conexão com TikTok'}) + '\n\n');
    req.on('close', () => clients.delete(res));
    return;
  }
  res.writeHead(404); res.end('Not found');
});
server.listen(PORT, HOST, () => console.log('Bridge em http://' + HOST + ':' + PORT));
setInterval(() => { for (const c of clients) { try { c.write(': ping\n\n'); } catch { clients.delete(c); } } }, 20000).unref();

if (!username) {
  console.log('Defina TIKTOK_USERNAME para conectar a uma LIVE.');
} else {
  live = new WebcastPushConnection(username, { enableExtendedGiftInfo: true });
  live.on('connected', () => { connected = true; console.log('TikTok LIVE conectado: @' + username); status('Conectado à LIVE @' + username, true); });
  live.on('disconnected', () => { connected = false; status('TikTok desconectado', false); });
  live.on('streamEnd', () => { connected = false; status('LIVE encerrada', false); });
  live.on('error', err => console.error('TikTok:', err?.message || err));
  live.on('chat', data => {
    const userId = clean(data.userId || data.uniqueId);
    const team = choose(data.comment);
    if (team === null || !userId) return;
    teams.set(userId, team);
    emit({kind:'event',type:'comment',target:team,name:clean(data.nickname || data.uniqueId),points:5,source:'tiktok'});
  });
  live.on('like', data => {
    const userId = clean(data.userId || data.uniqueId);
    const team = teams.get(userId);
    if (team === undefined) return;
    // likeCount may be cumulative per user; use count only when supplied as a batch count.
    const count = Math.max(1, Math.min(100, Number(data.likeCount) || 1));
    const key = userId + ':' + (data.totalLikeCount ?? '');
    if (data.totalLikeCount != null) {
      const total = Number(data.totalLikeCount);
      const prev = lastLikes.get(userId);
      lastLikes.set(userId, total);
      if (prev !== undefined && total <= prev) return;
    }
    emit({kind:'event',type:'like',target:team,name:clean(data.nickname || data.uniqueId),points:count*2,source:'tiktok'});
  });
  live.on('gift', data => {
    const userId = clean(data.userId || data.uniqueId);
    const team = teams.get(userId);
    if (team === undefined) return;
    const giftId = clean(data.giftId);
    const repeatEnd = data.repeatEnd === true || data.repeatEnd === 1;
    // Streak gifts: credit only the final event; non-streak gifts are credited immediately.
    if (data.giftType === 1 && !repeatEnd) return;
    const count = Math.max(1, Math.min(1000, Number(data.repeatCount) || 1));
    const key = [userId,giftId,data.groupId || '',count].join(':');
    const now = Date.now();
    if (now - (lastGift.get(key) || 0) < 2500) return;
    lastGift.set(key, now);
    if (lastGift.size > 2000) lastGift.clear();
    emit({kind:'event',type:'gift',target:team,name:clean(data.nickname || data.uniqueId),points:Math.min(20000,count*20),gift:clean(data.giftName || 'Presente'),source:'tiktok'});
  });
  const connect = async () => {
    try { await live.connect(); } catch(err) {
      connected = false;
      console.error('Falha na conexão:', err?.message || err);
      status('LIVE indisponível; nova tentativa em 15 segundos',false);
      setTimeout(connect, 15000);
    }
  };
  connect();
}
