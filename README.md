# Prepaid Parking System

An IoT-based prepaid parking management system built for academic purposes.

## Tech Stack

- **Frontend**: Next.js (App Router) with JavaScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB

## Project Structure

```
├── app/                    # Next.js pages
│   ├── page.jsx           # Home page
│   ├── layout.jsx         # Root layout
│   ├── dashboard/         # Dashboard page
│   ├── pay/[slotId]/      # Payment page
│   ├── admin/             # Admin panel
│   └── api/               # API Routes (backend)
│       ├── slots/         # GET slots, POST init
│       ├── payment/       # Payment confirmation
│       ├── iot/           # IOT events from ESP
│       └── admin/         # Admin commands
│
├── lib/                    # Shared utilities
│   ├── mongodb.js         # MongoDB connection
│   └── parking-store.js   # Database operations
```

## Setup Instructions

### 1. Get MongoDB URI

Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas):
1. Sign up / Log in
2. Create a new cluster (free tier works)
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/`)

### 2. Add Environment Variable

In v0:
1. Click **Vars** in the left sidebar
2. Add `MONGODB_URI` with your MongoDB connection string

### 3. Initialize Parking Slots

1. Go to the Admin page (`/admin`)
2. Click "Initialize 4 Slots" button

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/slots | Get all parking slots |
| POST | /api/slots/init | Initialize parking slots |
| POST | /api/payment/confirm | Confirm payment for a slot |
| POST | /api/iot/event | Receive IOT events from ESP |
| POST | /api/admin/command | Execute admin commands |

## Parking Flow

1. **User pays** → Session created with status `PAID` → Barrier opens
2. **Car enters** → ESP sends `CAR_ENTERED` → Status becomes `ACTIVE`
3. **Car exits normally** → ESP sends `CAR_EXITED` → Status becomes `AVAILABLE`
4. **Time expires** → Arduino sends `OVERSTAY` → Status becomes `OVERSTAY`
5. **User pays extra** → Slot unlocks → Car can exit

## ESP/Arduino Integration

When deployed, send HTTP POST requests to your app:

```
POST https://your-app.vercel.app/api/iot/event
Content-Type: application/json

{
  "slotId": "SLOT-1",
  "event": "CAR_ENTERED"
}
```

Available events: `CAR_ENTERED`, `CAR_EXITED`, `OVERSTAY`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (required) |
