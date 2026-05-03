# 🗳️ Election Explorer

> **An interactive, visual-first web application** that simplifies election processes across India 🇮🇳, USA 🇺🇸, and UK 🇬🇧 — built for the **Google Prompt Wars** competition.

[![Deployed on Cloud Run](https://img.shields.io/badge/Cloud%20Run-Deployed-blue?logo=google-cloud)](https://promptwar-git-1060062024302.europe-west1.run.app)
[![Firebase](https://img.shields.io/badge/Firebase-Integrated-orange?logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## ✨ Features

| Feature | Description |
|---|---|
| **📝 Step-by-Step Process** | 5-stage election process breakdown with detailed explanations |
| **🔀 Visual Flowchart** | Interactive flowchart connecting all election stages |
| **⏳ Timeline Slider** | Drag to explore each phase of the election calendar |
| **👥 Key Roles** | Meet the people and institutions that run elections |
| **🌍 Country Comparison** | Side-by-side table comparing India, USA, and UK |
| **🧠 Interactive Quiz** | 10 questions with instant feedback and scoring |
| **🌐 Multi-Language** | Google Translate widget for 10+ languages |
| **📊 Analytics** | Full GA4 event tracking and Firebase leaderboard |

## 🏗️ Architecture

```
Election Explorer
├── index.html           # Main entry — semantic HTML5, CSP headers, structured data
├── style.css            # Glassmorphism UI, dark theme, animations, responsive
├── data.js              # Immutable data layer (deep-frozen, JSDoc typed)
├── app.js               # Application logic (IIFE, safe DOM APIs, analytics)
├── firebase-config.js   # Firebase + GA4 integration module
├── tests.js             # Comprehensive test suite (80+ assertions)
├── tests.html           # Professional test runner UI
├── Dockerfile           # Nginx Alpine container for Cloud Run
├── nginx.conf           # Nginx config with security headers & gzip
├── app.yaml             # Google App Engine configuration
├── .dockerignore        # Docker build exclusions
└── .gcloudignore        # Cloud deployment exclusions
```

## 🔐 Security

- ✅ **Zero innerHTML** — All DOM manipulation uses `createElement` + `textContent`
- ✅ **Content Security Policy** — Strict CSP via `<meta>` tag
- ✅ **Data Immutability** — All data objects recursively frozen with `deepFreeze()`
- ✅ **Input Validation** — Country selector whitelisted, quiz indices bounds-checked
- ✅ **IIFE Scope Isolation** — No global namespace pollution
- ✅ **AbortController** — Event listener cleanup prevents memory leaks
- ✅ **Security Headers** — HSTS, X-Frame-Options, X-Content-Type-Options via nginx

## ☁️ Google Services Integration

| Service | Usage |
|---|---|
| **Google Cloud Run** | Container hosting with auto-scaling |
| **Google Analytics 4** | Page views, section tracking, quiz events |
| **Firebase Firestore** | Quiz score leaderboard storage |
| **Firebase Analytics** | User engagement metrics |
| **Google Fonts** | Inter & Outfit typefaces |
| **Google Translate** | Multi-language accessibility widget |
| **Structured Data** | Schema.org JSON-LD for Google Search |

## 🧪 Testing

Open `tests.html` in your browser to run the full test suite:

```
http://localhost:8080/tests.html
```

**Test categories:**
- 📦 Data Integrity — Structure, types, completeness
- 🔒 Security — Freeze verification, CSP, XSS prevention
- 🏗️ DOM Structure — Element existence, semantic HTML
- 🎨 Rendering — Dynamic content generation
- ♿ Accessibility — ARIA labels, headings, lang attribute
- ☁️ Google Services — GA4, Firebase, Translate, JSON-LD
- ⚡ Performance — Load time, DOM size, script placement

## 🚀 Deployment

### Google Cloud Run (Docker)
```bash
gcloud run deploy election-explorer \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

### Google App Engine
```bash
gcloud app deploy app.yaml
```

### Local Development
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve -l 8080
```

## 📊 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+) — zero dependencies
- **Styling**: Custom CSS with glassmorphism, gradients, animations
- **Container**: Docker + Nginx Alpine
- **Cloud**: Google Cloud Run, Firebase, Google Analytics 4
- **Testing**: Custom browser-based test framework

## 👤 Author

**Dhanush191205** — Built for Google Prompt Wars 2026

---

*Democracy works best when people understand how it works. 🏛️*
