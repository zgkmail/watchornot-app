# Testing WatchOrNot on iPhone/Mobile Devices

This guide shows you how to test the WatchOrNot app on your iPhone or other mobile devices while running the development servers on your computer.

## Prerequisites

1. Your computer and iPhone must be on the **same Wi-Fi network**
2. Both frontend and backend servers must be running on your computer
3. Your computer's firewall must allow incoming connections on ports 3000 and 3001

## Step 1: Find Your Computer's Local IP Address

### On macOS:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Or: System Preferences → Network → Wi-Fi → Advanced → TCP/IP

### On Linux:
```bash
hostname -I
```
Or:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### On Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your Wi-Fi adapter.

You'll get an IP address like:
- `192.168.1.XXX` (most common)
- `10.0.0.XXX`
- `172.16.X.XXX`

**Example:** `192.168.1.5`

## Step 2: Start the Servers

The servers are already configured to accept network connections!

### Terminal 1: Start Backend
```bash
cd backend
npm start
```

You'll see output like:
```
==================================================
🎬 WatchOrNot Backend Server
==================================================
✓ Server running on port 3001
✓ Environment: development
✓ CORS enabled for development (localhost + local network)

📍 Local:    http://localhost:3001
📍 Network:  http://192.168.1.5:3001

💡 To test on iPhone: Use http://192.168.1.5:3000 in Safari
==================================================
```

**Copy the Network URL** - you'll need it!

### Terminal 2: Start Frontend
```bash
npm run dev
```

You'll see output like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.5:3000/
```

## Step 3: Open on Your iPhone

1. Open **Safari** on your iPhone
2. Type the **Network URL** from the Vite output (e.g., `http://192.168.1.5:3000`)
3. Press Go

The app should load just like on your computer!

## How It Works

The app automatically detects the host you're using:
- If you access via `http://192.168.1.5:3000`, the app will call the backend at `http://192.168.1.5:3001`
- If you access via `http://localhost:3000`, the app will call the backend at `http://localhost:3001`

No configuration needed! 🎉

## Troubleshooting

### Can't connect from iPhone

**1. Check your firewall**

Your computer's firewall might be blocking incoming connections.

**macOS:**
- System Preferences → Security & Privacy → Firewall
- Click "Firewall Options"
- Make sure Node.js is allowed

**Windows:**
- Windows Defender Firewall → Allow an app through firewall
- Add Node.js if it's not listed

**Linux (Ubuntu):**
```bash
sudo ufw allow 3000
sudo ufw allow 3001
```

**2. Verify servers are listening on network**

```bash
# Check if ports are open
netstat -an | grep LISTEN | grep -E "3000|3001"
```

You should see:
```
*.3000    LISTEN
*.3001    LISTEN
```

**3. Test from another device first**

Try accessing the app from another computer on your network to rule out iPhone-specific issues.

**4. Check Wi-Fi network**

- Make sure your computer and iPhone are on the **same Wi-Fi network**
- Some public/corporate Wi-Fi networks block device-to-device communication
- Guest networks often isolate devices - use the main network

### CORS errors in Safari

If you see CORS errors, the backend CORS configuration should already allow local network IPs in development mode. Check:

1. Backend `.env` has `NODE_ENV=development` (or it's not set)
2. You're accessing via HTTP (not HTTPS)
3. The IP address is a valid local network IP

### App loads but can't fetch data

1. Check browser console for errors (Safari → Develop → Show Web Inspector)
2. Verify backend is running and accessible
3. Try accessing the backend directly: `http://YOUR-IP:3001/health`

## Testing Camera on iPhone

The camera feature requires HTTPS in production, but should work over HTTP on local network for testing. If it doesn't work:

1. Grant Safari permission to access the camera
2. Try refreshing the page
3. Check Safari's camera permissions in iOS Settings

## Network Performance

- First load might be slower over Wi-Fi than localhost
- Image uploads will take longer over network
- This is normal for local network testing

## Production Deployment

For production deployment on a real domain:
1. Build the frontend: `npm run build`
2. Deploy `dist/` folder to a static host with HTTPS
3. Deploy backend to a Node.js host
4. Update `FRONTEND_URL` in backend `.env` to your production domain
5. Camera features will require HTTPS in production

## Quick Reference

| Service | Local URL | Network URL (example) |
|---------|-----------|----------------------|
| Frontend | http://localhost:3000 | http://192.168.1.5:3000 |
| Backend | http://localhost:3001 | http://192.168.1.5:3001 |

Replace `192.168.1.5` with your actual computer's IP address.

---

Happy mobile testing! 📱
