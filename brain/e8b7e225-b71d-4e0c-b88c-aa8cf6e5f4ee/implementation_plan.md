# BBL Stats 2026 Implementation Plan

## Goal Description
Create a full-stack application to display Big Bash League (BBL) 2026 statistics.
- **Backend**: Python (FastAPI) to serve player statistics. Since 2026 is in the future, we will generate mock/projected data.
- **Frontend**: React + Vite + Tailwind CSS for a modern, responsive UI.

## User Review Required
> [!IMPORTANT]
> The BBL 2026 season has not occurred yet. This application will use **mock/generated data** to simulate the stats for demonstration purposes.

## Proposed Changes

### Backend (`bbl_stats_api/`)
#### [NEW] [models.py](file:///c:/Users/Aditya/bbl_stats_api/bbl_stats_api/api/models.py)
 - Define Pydantic models: `Player`, `BattingStats`, `BowlingStats`.

#### [NEW] [scraper_service.py](file:///c:/Users/Aditya/bbl_stats_api/bbl_stats_api/scraper/scraper_service.py)
 - **Functionality**:
    - Fetch HTML from Cricinfo BBL 2025-2026 stats pages using **Playwright**.
    - Parse "Most Runs" and "Most Wickets" tables.
    - Extract: Player Name, Team, Matches, Runs, Wickets, Averages, Strike Rates.
    - Clean and normalize data (handle names, teams).
 - **Libraries**: `playwright` (headless browser for 403 bypass), `beautifulsoup4` (parsing).

#### [NEW] [main.py](file:///c:/Users/Aditya/bbl_stats_api/bbl_stats_api/api/main.py)
 - Setup FastAPI app.
 - Endpoint `/api/scrape`: Triggers a fresh scrape (admin/dev only).
 - Endpoint `/api/stats`: Returns the cached/latest scraped stats.
 - Enable CORS.

### Frontend (`frontend/`)
#### [NEW] Project Structure
 - Initialize React Vite project in `c:/Users/Aditya/bbl_stats_api/frontend`.
 - Install Tailwind CSS.

#### [NEW] Components
 - `src/components/PlayerCard.jsx`: Display individual player summary.
 - `src/components/StatsTable.jsx`: Comprehensive table of stats.
 - `src/App.jsx`: Main dashboard layout.

## Verification Plan

### Automated Tests
- **Backend Start**: Run `uvicorn bbl_stats_api.api.main:app --reload` and check `http://localhost:8000/docs`.
- **Frontend Start**: Run `npm run dev` in `frontend/` directory.

### Manual Verification
- Open Web Browser to Frontend URL (usually `http://localhost:5173`).
- Verify data loads from Backend Key players (e.g. mock data names) appear.
- Check Responsive Design on different screen sizes.
