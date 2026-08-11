# Bear Downloader 🐻

Aplikasi webview berbasis **Cordova** dengan fitur lengkap:
- 📥 **File Downloader** (web fetch + native file transfer)
- 🔊 **Text-to-Speech** (menggunakan `window.speechSynthesis` browser/Android)
- 🔄 **Pull-to-Refresh Navbar** (touch gesture custom)
- 💻 **Mode Desktop** (CSS grid responsive + toggle)
- 🐻 **Logo Beruang** SVG

## Struktur

```
bear-downloader/
├── .github/workflows/build.yml   # CI/CD: build APK otomatis
├── config.xml                    # Konfigurasi Cordova
├── package.json
├── www/                          # Web assets (HTML/CSS/JS)
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   ├── js/pull-to-refresh.js
│   └── img/bear-logo.svg
└── README.md
```

## Cara Pakai (Lokal)

```bash
# Install Cordova
npm install -g cordova@12

# Tambah platform Android
cordova platform add android@12.0.1

# Install plugin
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-file-transfer

# Build debug APK
cordova build android --debug

# Build release APK
cordova build android --release
```

## GitHub Actions

Workflow `.github/workflows/build.yml` akan otomatis build APK saat push ke `main`/`master`. Artifact APK bisa diunduh dari tab **Actions** di repo.

## Testing di Browser

Buka `www/index.html` langsung di browser — semua fitur berjalan kecuali native downloader (perlu Cordova plugin).

## Lisensi

MIT — dibuat dengan ❤️ oleh BearAi