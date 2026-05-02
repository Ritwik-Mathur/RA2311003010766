# Notification System Design

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                          │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  React App   │  │  MUI Theme   │  │  React Router (SPA)     │ │
│  │  (Vite+TS)   │  │  (Dark Mode) │  │  Query Params Routing   │ │
│  └──────┬───────┘  └──────────────┘  └─────────────────────────┘ │
│         │                                                        │
│  ┌──────▼───────────────────────────────────────────────────────┐│
│  │                    State Management Layer                     ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   ││
│  │  │useNotifs │ │ useAuth  │ │ useState │ │ URL SearchParams│  ││
│  │  │  (hook)  │ │  (hook)  │ │(read/un) │ │ (pagination)   │  ││
│  │  └────┬─────┘ └────┬─────┘ └──────────┘ └───────────────┘   ││
│  └───────┼─────────────┼────────────────────────────────────────┘│
│          │             │                                         │
│  ┌───────▼─────────────▼────────────────────────────────────────┐│
│  │                    API Utility Layer                           ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐ ││
│  │  │ fetchNotifs  │ │ authenticate │ │ register (one-time)   │ ││
│  │  │ (axios GET)  │ │ (axios POST) │ │ (axios POST)          │ ││
│  │  └──────┬───────┘ └──────┬───────┘ └───────────────────────┘ ││
│  └─────────┼────────────────┼───────────────────────────────────┘│
│            │                │                                    │
│  ┌─────────▼────────────────▼───────────────────────────────────┐│
│  │              Logging Middleware (logger.ts)                    ││
│  │  Log(stack, level, package, message) ──► POST /logs           ││
│  │  • Batch queue (5 logs / flush)                               ││
│  │  • Console output with styled levels                          ││
│  │  • Auto-flush every 3s                                        ││
│  └──────────────────────────┬───────────────────────────────────┘│
└─────────────────────────────┼────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Evaluation API     │
                    │  20.207.122.201     │
                    │                    │
                    │  /register         │
                    │  /auth             │
                    │  /notifications    │
                    │  /logs             │
                    └────────────────────┘
```

## 2. Data Flow

### 2.1 Authentication Flow

```
User → .env config → useAuth hook → POST /auth → access_token (in-memory)
                                                       │
                                                       ▼
                                              initLogger(token)
                                              axios interceptor
```

### 2.2 Notification Fetching

```
Page Mount
   │
   ▼
useNotifications hook
   │
   ├─► Log('frontend','info','hook','loading notifications')
   │
   ├─► GET /notifications (axios + Bearer token)
   │
   ├─► processNotifications(raw, topN=10)
   │   ├─ parseNotifications() → normalize types & IDs
   │   ├─ sortByTimestamp(DESC) → newest first
   │   └─ MinHeapTopN(10).insertBatch() → priority set
   │
   ├─► setState({ all, priority })
   │
   └─► Log('frontend','info','hook','loaded N notifications')
```

### 2.3 UI Rendering Pipeline

```
allNotifications / priorityNotifications
         │
         ├─► Filter by notification_type (query param)
         │
         ├─► Paginate: slice(start, end) based on page & limit
         │
         └─► Render NotificationCard[] with read/unread state
```

## 3. Priority Selection Logic

### Simple Approach (implemented)

- Sort all notifications by timestamp descending
- Take first N items → these are the "priority" (most recent) notifications

### Efficient Approach (implemented — MinHeap)

When new data streams in, a **min-heap** of size N is used:

1. If heap has fewer than N items → insert directly
2. If new item's timestamp > heap root (oldest in top-N) → replace root, heapify down
3. Otherwise → discard (not in top-N)

**Complexity:** O(M log N) where M = total notifications, N = priority count

## 4. Logging Strategy

### Where Logging is Used

| Location            | Level  | Package   | Example Message                             |
|---------------------|--------|-----------|---------------------------------------------|
| App init            | info   | page      | "app initialized"                           |
| Page mount          | info   | page      | "notification page loaded"                  |
| API request         | debug  | api       | "outgoing GET request to /notifications"    |
| API success         | info   | api       | "fetched 50 notifications successfully"     |
| API error           | error  | api       | "api error 401 from /notifications"         |
| Filter change       | info   | component | "filter type changed: event"                |
| Pagination          | info   | component | "pagination: page 2"                        |
| Mark as read        | info   | state     | "marking notification xyz as read"          |
| Priority toggle     | info   | state     | "priority mode toggled to: true"            |
| State update        | debug  | state     | "query params updated"                      |
| Sorting             | debug  | api       | "sorting 50 notifications by timestamp"     |
| Parsing             | info   | api       | "parsed 50 notifications successfully"      |

### Batch Delivery

- Logs are queued in memory (batch size = 5)
- Flushed to `POST /logs` every 3 seconds or when batch is full
- Remaining logs flushed on app unmount

## 5. Error Handling

| Error Type          | Handling                                                  |
|---------------------|-----------------------------------------------------------|
| Network failure     | Show error alert in UI, log as `error` level              |
| Auth failure        | Auto-auth retries from env, falls back to manual          |
| Invalid timestamp   | Fallback to epoch 0, log as `warn`                       |
| Empty response      | Show empty state UI with filter hint                      |
| Token expiry        | Interceptor logs error, re-auth can be triggered          |
| Parse error         | Graceful fallback with default values                     |

## 6. Scaling Considerations

### Frontend

- **Memoization**: `React.memo` on NotificationCard, `useMemo` on filtered/paginated lists
- **Virtual scrolling**: For 1000+ notifications, integrate `react-window` or `@tanstack/virtual`
- **Debounced search**: If text search is added, debounce API calls (300ms)
- **Service Worker**: Cache notification data for offline access

### Backend (hypothetical)

- **WebSocket/SSE**: Push new notifications instead of polling
- **Redis cache**: Cache notification lists with TTL
- **Pagination at API level**: Server-side cursor-based pagination
- **Message queue**: Process notification delivery asynchronously (RabbitMQ/Kafka)

### Logging

- **Structured JSON**: Already implemented
- **Log levels in prod**: Filter to `info` and above (skip `debug`)
- **Sampling**: In high-traffic, sample debug logs at 10%
- **Async batching**: Already implemented (queue + periodic flush)
