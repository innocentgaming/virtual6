# 🛡️ AeroShield AI — Winter Smog & Urban Clean Air Navigator

[![AeroShield CI](https://github.com/aadiyadav1706/aeroshield-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/aadiyadav1706/aeroshield-ai/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/tests-17%20passed-success.svg)](tests/)
[![Repo Size](https://img.shields.io/badge/repo%20size-%3C%201%20MB-blue.svg)]()
[![Single Branch](https://img.shields.io/badge/branch-main%20only-purple.svg)]()

> **A GenAI-Powered Assistant that empowers families and communities to navigate severe winter smog and urban air pollution through low-emission daily routines, indoor air quality hacks, and sustainable alternatives with clear, quantified health and ecological impacts.**

---

## 📌 1. Chosen Vertical & Problem Alignment

### The Winter Smog Crisis
Every winter, metropolitan centers worldwide (e.g., Delhi NCR, Lahore, Beijing, Salt Lake City Basin, London, Milan) suffer catastrophic seasonal spikes in fine particulate matter (**PM2.5** and **PM10**). 

The root cause is a meteorological phenomenon known as **Radiation Temperature Inversion**:
1. Cold night air is trapped under a warm boundary ceiling.
2. Calm surface winds (< 5 km/h) prevent atmospheric mixing.
3. Tailpipe combustion, biomass/wood space heating, agricultural residues, and construction dust concentrate directly in the human breathing zone (the lowest 50–100 meters).
4. Traditional routines—like early morning runs, uncontrolled cross-ventilation, and biomass heating—drastically multiply inhaled toxic doses, especially for **infants, schoolchildren, asthmatics, and elderly grandparents**.

### AeroShield AI Persona & Mission
AeroShield AI acts as an **intelligent, empathetic, and scientifically grounded clean-air copilot**. It bridges the gap between passive sensor readings and active household intervention:
- Translates complex air quality telemetry into **personalized, low-emission daily timelines**.
- Prescribes **practical, low-cost Indoor Air Quality (IAQ) hacks** (including DIY Corsi-Rosenthal purifiers for under $40).
- Calculates the **direct health impact** (micrograms of inhaled PM2.5 prevented, equivalent cigarettes avoided) and **direct emissions avoided** (kg CO2e prevented).
- Coordinates **community-driven defense** (reporting open waste burning, carpooling clusters, and idling hotspots).

---

## 🧠 2. Approach, Scientific Logic & Mathematical Models

### A. Inhaled Particulate Dose Model
AeroShield does not just report ambient concentration ($\mu g/m^3$); it computes the **Inhaled Dose ($Dose$)** of PM2.5 deposited in the respiratory tract:

$$\text{Dose} (\mu g) = \sum_{i=1}^{n} C_i \times V_i \times T_i$$

Where:
- $C_i$ = Micro-environmental PM2.5 concentration ($\mu g/m^3$) during time slot $i$
- $V_i$ = Minute ventilation / inhalation rate ($m^3/h$) according to EPA Exposure Factors Handbook:
  - Sleep / Rest: $0.45\text{ m}^3/h$
  - Sedentary / Desk Work: $0.75\text{ m}^3/h$
  - Active Commute / Walking: $1.10\text{ m}^3/h$
  - Strenuous Outdoor Exercise: $2.90\text{ m}^3/h$
- $T_i$ = Duration of exposure ($hours$)

### B. Berkeley Earth Toxicity Equivalence
To communicate risk effectively to families, avoided particulate mass is mapped to equivalent cigarettes avoided using the peer-reviewed **Berkeley Earth particulate equivalence rule** ($22\ \mu g/m^3\text{ exposure for 24h} \approx 264\ \mu g\text{ inhaled} \approx 1\text{ cigarette}$):

$$\text{Cigarettes Avoided} = \frac{\text{Total Inhaled Dose Avoided } (\mu g)}{264}$$

### C. Indoor Air Quality (IAQ) Single-Compartment Mass-Balance Model
The simulator models indoor air dynamics in real time using the differential mass balance equation:

$$\frac{dC_{in}}{dt} = \frac{P \cdot a \cdot C_{out}}{V} + \frac{S}{V} - \left(a + k_{dep} + \frac{CADR}{V}\right) C_{in}$$

Where:
- $C_{in}$ = Indoor PM2.5 concentration ($\mu g/m^3$)
- $C_{out}$ = Outdoor ambient PM2.5 concentration ($\mu g/m^3$)
- $P$ = Building envelope penetration factor ($\sim 0.75$)
- $a$ = Air exchange rate ($ACH$, $h^{-1}$)
- $k_{dep}$ = Natural gravitational deposition rate ($\sim 0.2\ h^{-1}$)
- $S$ = Indoor emission generation rate ($\mu g/h$) from gas stoves, dry sweeping, or incense
- $CADR$ = Clean Air Delivery Rate ($m^3/h$) of the air filtration system
- $V$ = Room volume ($m^3$)

### D. Dual-Engine GenAI Architecture
1. **Google Gemini LLM Integration**: Connects to the official `@google/generative-ai` SDK (`gemini-1.5-flash`) for dynamic, context-aware reasoning using the user's family profile, microclimate data, and conversational prompts.
2. **Built-in Deterministic Scientific Engine**: Automatically serves as a zero-latency, offline fallback if no API key is provided or if network calls are blocked. Guarantees 100% uptime with zero crashes.

---

## 🏗️ 3. System Architecture & Project Structure

```
aeroshield-ai/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI test and build workflow
├── client/
│   ├── index.html               # Accessible HTML5 root
│   ├── vite.config.ts           # Client bundler configuration
│   ├── tsconfig.json            # Client TypeScript rules
│   └── src/
│       ├── main.tsx             # React entry point
│       ├── App.tsx              # Application layout & navigation
│       ├── index.css            # Tailwind & accessible design styles
│       ├── services/
│       │   └── api.ts           # Typed API client & session storage
│       └── components/
│           ├── Navbar.tsx       # City selector & real-time AQI badge
│           ├── AQIDashboard.tsx # Microclimate, pollutants & inversion banner
│           ├── RoutinePlanner.tsx # Schedule optimizer & impact calculators
│           ├── IAQSimulator.tsx # Physics box model & DIY Corsi-Rosenthal
│           ├── ChatAssistant.tsx# Dual-engine conversational GenAI copilot
│           ├── CommunityHub.tsx # Crowdsourced reports & transition matrix
│           └── ApiKeyModal.tsx  # Secure API key modal
├── server/
│   ├── tsconfig.json            # Server TypeScript rules
│   ├── public/                  # Compiled client bundle (served statically)
│   └── src/
│       ├── index.ts             # Express server with Helmet, CORS & Rate Limits
│       ├── types/index.ts       # Domain TypeScript contracts
│       ├── utils/sanitizer.ts   # Security sanitization & XSS guard
│       ├── routes/apiRoutes.ts  # Express route definitions
│       ├── controllers/
│       │   └── apiController.ts # HTTP request handlers & validation
│       └── services/
│           ├── aqiService.ts    # Real-time Open-Meteo API & inversion detection
│           ├── routineOptimizerService.ts # Dose & emission reduction engine
│           ├── iaqSimulationService.ts    # Physical mass-balance simulator
│           ├── geminiService.ts           # Dual-engine GenAI logic
│           └── communityService.ts        # Community store & upvoting
├── tests/
│   ├── aqi.test.ts              # EPA AQI breakpoints & inversion tests
│   ├── routine.test.ts          # Dose calculation & schedule optimizer tests
│   ├── iaq.test.ts              # IAQ decay & source emission tests
│   ├── sanitizer.test.ts        # XSS, length & boundary sanitization tests
│   └── gemini.test.ts           # Knowledge base & fallback reasoning tests
├── .gitignore                   # Excludes node_modules, dist, env, keeping repo < 1MB
├── package.json                 # Unified npm package configuration
├── tailwind.config.js           # Accessible theme color palette
└── vitest.config.ts             # Automated test configuration
```

---

## 🎯 4. Evaluation Focus Areas Compliance

| Evaluation Parameter | Implementation in AeroShield AI |
| :--- | :--- |
| **Code Quality** | Strictly typed TypeScript throughout; modular separation of Concerns (Controllers, Services, Routers, Components); Clean code standards. |
| **Security** | Comprehensive input sanitization against XSS and script injection; Helmet CSP headers; IP rate limiting; zero stored hardcoded secrets; optional user keys stored client-side only. |
| **Efficiency** | Repository size is **under 1 MB** (well within the 10 MB limit); In-memory LRU caching for weather/AQI with 10-minute TTL; Lightweight bundled frontend. |
| **Testing** | 17 automated unit and integration tests across 5 test suites using Vitest, validating all core equations, sanitizers, and decision services. |
| **Accessibility (a11y)** | Semantic HTML5 tags (`<main>`, `<nav>`, `<section>`, `<article>`); WCAG 2.1 AA compliant color contrast; ARIA live regions and labels; keyboard-navigable interactive controls. |
| **Problem Alignment** | Directly tackles severe winter smog, inversion trapping, DIY filtration, low-emission daily routines, and quantifiable health impacts. |

---

## ⚙️ 5. Assumptions Made

1. **Meteorological Thermal Inversion**: Identified when surface temperatures are under 16°C with calm wind speeds (< 8 km/h) and relative humidity > 65%, which matches empirical winter boundary conditions in northern plains and valley basins.
2. **Safe Micro-Ventilation Window**: Inversion layers typically lift when solar irradiation is at its daily maximum (between 12:00 PM and 2:30 PM). This is recommended as the single safest window for airing out indoor CO2 and moisture.
3. **Equivalence Metrics**: We apply the peer-reviewed Berkeley Earth metric ($1\text{ cigarette} \approx 22\ \mu g/m^3 \text{ PM2.5 for 24h} \approx 264\ \mu g \text{ inhaled}$) to translate micrograms into intuitive, actionable risk indicators.
4. **Commute Emission Savings**: Transitioning from a single-occupancy fossil fuel vehicle to electric metro or shared carpooling saves an average of $185\text{ g CO}_2$ per kilometer.
5. **Zero API Key Barrier**: Recognizing that evaluators or offline users may not have an active Gemini API key configured, the system provides a dual-engine architecture with rich deterministic reasoning so all features work instantly out-of-the-box.

---

## 🚀 6. Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# Clone the repository (Single branch)
git clone https://github.com/aadiyadav1706/aeroshield-ai.git
cd aeroshield-ai

# Install dependencies
npm install
```

### Running Tests
Execute the comprehensive test suite (17 tests covering routine optimization, IAQ simulation, security sanitization, and fallback engines):
```bash
npm run test
```

### Running in Development Mode
Starts both the backend Express server (port 5000) and the Vite React frontend (port 5173):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building & Running Production Server
```bash
# Build both frontend bundle and server TypeScript
npm run build

# Start the production server
npm start
```
Open [http://localhost:5000](http://localhost:5000) to view the integrated production application.

---

## 🌿 7. License & Credits
Developed under the **MIT License**.
- Weather & Particulate Telemetry: Powered by Open-Meteo Air Quality API
- Medical Guidelines: World Health Organization (WHO) & US Environmental Protection Agency (EPA)
- Filtration Science: Corsi-Rosenthal Foundation & ASHRAE 52.2 Standards
