const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// HTTPサーバー: public/index.html を配信
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, '../public/index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// WebSocketサーバー: 同一ポートでHTTPと共存
const wss = new WebSocketServer({ server });

// 接続中クライアント管理: Map<ws, username>
const clients = new Map();

// 現在時刻を HH:MM:SS 形式で返す
function getTimestamp() {
  return new Date().toLocaleTimeString('ja-JP', { hour12: false });
}

// 全クライアントにJSONをブロードキャスト
function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

wss.on('connection', (ws) => {
  clients.set(ws, null); // username未設定で登録

  ws.on('message', (rawData) => {
    let data;
    try {
      data = JSON.parse(rawData.toString());
    } catch (e) {
      return; // 不正なJSONは無視
    }

    if (data.type === 'join') {
      const username = String(data.username || '').trim();
      if (!username) return;
      clients.set(ws, username);
      console.log(`[入室] ${username}`);
      broadcast({ type: 'join', username, timestamp: getTimestamp() });

    } else if (data.type === 'message') {
      const username = clients.get(ws);
      if (!username) return; // join前のメッセージは無視
      const text = String(data.text || '').trim();
      if (!text) return;
      console.log(`[メッセージ] ${username}: ${text}`);
      broadcast({ type: 'message', username, text, timestamp: getTimestamp() });
    }
  });

  ws.on('close', () => {
    const username = clients.get(ws);
    clients.delete(ws);
    if (username) {
      console.log(`[退室] ${username}`);
      broadcast({ type: 'leave', username, timestamp: getTimestamp() });
    }
  });

  ws.on('error', (err) => {
    console.error('[WebSocket エラー]', err.message);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ポート ${PORT} はすでに使用中です。`);
  } else {
    console.error('[サーバーエラー]', err.message);
  }
});

server.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});

// Ctrl+C を押したときに実行される
process.on('SIGINT', () => {
  console.log('サーバーを終了します。クリーンアップ中...');

  // 全クライアントを安全に閉じる
  //wss.clients.forEach(client => client.close());

  // 最後にプロセスを終了
  process.exit();
});

// 30秒おきにメモリ確認
setInterval(() => {
  const memory = process.memoryUsage();
  console.log(`--- Memory Usage ---`);
  console.log(`RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB`); // プロセス全体のメモリ
  console.log(`Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`); // 実際に使われているヒープ
  console.log(`Clients: ${wss.clients.size}`); // 接続中のクライアント数
  //console.log(`Rooms: ${rooms.size}`); // 管理しているルーム数
}, 30000);