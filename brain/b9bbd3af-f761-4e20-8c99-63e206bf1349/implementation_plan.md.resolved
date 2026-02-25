# T20 World Cup 2024 Stats Extraction Plan

# Goal Description
Extract comprehensive T20 World Cup 2024 data including Teams, Squads (Players), and Player Statistics (Batting/Bowling) from Cricbuzz (publicly available source).
The data will be saved as a structured JSON file.

## User Review Required
> [!NOTE]
> Primary source is Cricbuzz. If Cricbuzz structure changes or blocks, we may need to pivot.
> We will use Playwright to handle dynamic content.

## Proposed Changes

### Data Extraction
#### [NEW] [t20_wc_scraper.py](file:///c:/Users/Aditya/bbl_stats_api/t20_wc_scraper.py)
- **Class `CricbuzzScraper`**:
    - `get_teams_and_squads()`: Navigates to the squads page, collects all teams and their player lists.
    - `get_batting_stats()`: Navigates to stats/batting page, extracts top run scorers (and potentially paginates if available/needed).
    - `get_bowling_stats()`: Navigates to stats/bowling page, extracts top wicket takers.
    - `merge_data()`: Combines squad data with stats data.
    - `save_data(filename)`: Dumps to JSON.

### Output
- `t20_wc_2024_data.json`: The final artifact containing:
    ```json
    {
      "teams": [
        {
          "name": "India",
          "players": [
             { "name": "Virat Kohli", "role": "Batsman", "stats": { "runs": 123, ... } }
          ]
        }
      ]
    }
    ```

## Verification Plan

### Automated Tests
- **Run the Scraper**: Execute `python t20_wc_scraper.py`.
- **Validation Script**: Create `verify_data.py` to check:
    - JSON is valid.
    - Contains at least 20 teams (T20 WC 2024 had 20 teams).
    - Contains reasonable stats (e.g. top run scorer > 200).

### Manual Verification
- Inspect the generated JSON file.
- Compare a few sample players with the website.
