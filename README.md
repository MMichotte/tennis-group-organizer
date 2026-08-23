# Tennis Group Organizer

Web app to plan tennis games fairly across a group of players.

- Pick play dates
- Register players and their excluded dates
- Set how many players play per game
- Generate a balanced planning (players with the lowest play count get picked first; excluded dates are honored)
- Export the planning to **Excel (.xlsx)** or **PDF** — and import it back (Excel/CSV) to reload or continue editing a planning
- Interface available in **English, French and Dutch** (language selector in the header; exports follow the selected language, imports accept any of them)

### How the planning is generated

Several randomized greedy passes are run; the best one is kept.

- Each date is filled with the available players with the lowest play count so far,
  preferring the players that can show up on the fewest remaining dates.
- Passes are scored on (1) missing player slots and (2) play-count imbalance
  across players, where the fairness target accounts for how many dates each
  player is actually available for.
- Files exported from the app can be re-imported: the first column must be a
  `Date` column, one column per player, ✅ = plays, ❌ = does not play.

## Local development

Requirements: Node.js >= 20

```bash
npm ci
npm run dev
```

The dev server runs on http://localhost:5173.

## Production build

```bash
npm run build
```

Outputs the static site to `dist/`.

## Run with the Node server

```bash
npm run build
cp -r dist/* public/
npm run start:node
```

Listens on port 8080 (override with the `PORT` env var).

## Docker

```bash
docker build -t tennis-organizer-app .
docker run --rm -p 8080:8080 tennis-organizer-app
```

`build.sh` builds, tags and pushes to Docker Hub.
