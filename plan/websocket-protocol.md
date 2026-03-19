# WebSocket JSONプロトコル仕様

## 概要

クライアントとサーバー間のメッセージは、すべて **JSON形式** でやり取りします。
イベントの種類は `type` フィールドで区別します。

---

## クライアント → サーバー

### 入室 (join)

ユーザーがWebSocketに接続後、最初に送信するメッセージ。

```json
{ "type": "join", "username": "Alice" }
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `type` | string | `"join"` 固定 |
| `username` | string | 使用するユーザー名 |

---

### メッセージ送信 (message)

チャットメッセージを送信する。

```json
{ "type": "message", "text": "こんにちは！" }
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `type` | string | `"message"` 固定 |
| `text` | string | 送信するメッセージ本文 |

> **注意:** `username` はサーバー側が `Map<ws, username>` で管理しているため、クライアントは送信不要。

---

## サーバー → 全クライアント（ブロードキャスト）

### 入室通知 (join)

誰かが入室したとき、全クライアントに送信される。

```json
{ "type": "join", "username": "Alice", "timestamp": "14:30:25" }
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `type` | string | `"join"` 固定 |
| `username` | string | 入室したユーザー名 |
| `timestamp` | string | 入室時刻 (HH:MM:SS) |

---

### メッセージ配信 (message)

誰かがメッセージを送信したとき、全クライアントに配信される。

```json
{ "type": "message", "username": "Alice", "text": "こんにちは！", "timestamp": "14:30:42" }
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `type` | string | `"message"` 固定 |
| `username` | string | 送信したユーザー名（サーバーが付与） |
| `text` | string | メッセージ本文 |
| `timestamp` | string | 送信時刻 (HH:MM:SS) |

---

### 退室通知 (leave)

誰かが切断したとき、全クライアントに送信される。
クライアントが明示的に送るのではなく、**サーバーが切断を検知して自動生成**する。

```json
{ "type": "leave", "username": "Alice", "timestamp": "14:35:10" }
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `type` | string | `"leave"` 固定 |
| `username` | string | 退室したユーザー名 |
| `timestamp` | string | 退室時刻 (HH:MM:SS) |

---

## 通信フロー図

```
クライアントA              サーバー               クライアントB
    |                        |                        |
    |-- join(Alice) -------->|                        |
    |<--- join通知 ----------|-- join通知 ----------->|
    |                        |                        |
    |-- message(テキスト) -->|                        |
    |<--- message配信 -------|-- message配信 -------->|
    |                        |                        |
    |-- (接続切断) --------->|                        |
    |                        |-- leave通知 ---------->|
```

---

## サーバー側の処理フロー

```
ws.on('connection')
  └── clients.set(ws, null)       // username未設定で登録

ws.on('message')
  ├── type === 'join'
  │     └── clients.set(ws, username)
  │         broadcast({ type: 'join', username, timestamp })
  └── type === 'message'
        └── username = clients.get(ws)
            broadcast({ type: 'message', username, text, timestamp })

ws.on('close')
  └── username = clients.get(ws)
      clients.delete(ws)
      broadcast({ type: 'leave', username, timestamp })
```
