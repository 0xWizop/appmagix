# Firestore Collections

Deploy rules: `firebase deploy --only firestore:rules` (and `firestore:indexes` if you use the indexes).

## Collections

| Collection | Description | Key fields |
|------------|-------------|------------|
| `users` | User profiles (synced from Firebase Auth or your app). Document ID = Firebase Auth `uid`. | `email`, `displayName`, `photoURL`, `role`, `createdAt` |
| `projects` | Client projects (websites, apps, Shopify builds). | `ownerId` (auth uid), `title`, `status`, `type`, `createdAt`, `updatedAt` |
| `tickets` | Support tickets. | `userId`, `subject`, `status`, `createdAt`, `updatedAt` |
| `tickets/{id}/messages` | Subcollection: messages per ticket. | `userId`, `body`, `createdAt` |
| `appConfig` | Read-only app config (e.g. feature flags). | arbitrary |
| `analytics_events` | Page view and custom events (server-written via API). | `projectId`, `ownerId`, `type`, `path`, `timestamp` |
| `notifications` | In-app notifications for users. | `userId`, `type`, `title`, `message`, `href`, `read`, `createdAt` |

## Example documents

**users/{uid}**
```json
{
  "email": "user@example.com",
  "displayName": "Jane Doe",
  "photoURL": "https://...",
  "role": "CLIENT",
  "createdAt": "2026-02-10T12:00:00Z"
}
```

**projects/{projectId}**
```json
{
  "ownerId": "<firebase-auth-uid>",
  "title": "My Store",
  "status": "in_development",
  "type": "shopify",
  "createdAt": "2026-02-10T12:00:00Z",
  "updatedAt": "2026-02-10T12:00:00Z"
}
```

**tickets/{ticketId}**
```json
{
  "userId": "<firebase-auth-uid>",
  "subject": "Help with checkout",
  "status": "open",
  "createdAt": "2026-02-10T12:00:00Z",
  "updatedAt": "2026-02-10T12:00:00Z"
}
```
