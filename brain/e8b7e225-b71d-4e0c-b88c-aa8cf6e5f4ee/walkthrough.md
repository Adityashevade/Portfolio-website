# BBL Stats 2026 - Walkthrough

## Overview
We have built a full-stack application to track Big Bash League 2025-2026 statistics.

**Tech Stack:**
- **Backend:** Python (FastAPI) + BeautifulSoup4 (Scraping)
- **Frontend:** React + Vite + Tailwind CSS

## Features
- **Real-time Data:** Scrapes data directly from [ESPNcricinfo BBL 2025-26](https://www.espncricinfo.com/series/big-bash-league-2025-26-1490534).
- **Interactive UI:** Sortable tables for Batting and Bowling stats.
- **Premium Design:** Modern, dark-themed UI with Tailwind CSS.
- **Data Sync:** "Sync Latest Data" button to trigger a fresh scrape from the backend.

## How to Run

### 1. Backend (API & Scraper)
The backend runs on `http://localhost:8000`.
**Prerequisite:** Requires Playwright for scraping.
```bash
pip install playwright
playwright install chromium
python -m uvicorn bbl_stats_api.api.main:app --reload
```

### 2. Frontend (UI)
The frontend runs on `http://localhost:5173`.
```bash
cd frontend
npm run dev
```

## Verification
1. Open [http://localhost:5173](http://localhost:5173).
2. You should see the **BBL 2026 STATS** dashboard.
3. Click **"Sync Latest Data"** to fetch the real stats from Cricinfo.
4. Toggle between "Most Runs" and "Most Wickets" tabs.
