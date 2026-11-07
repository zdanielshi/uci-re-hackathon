# Build Baby Build

Autonomous housing lobbyist — hackathon demo (UCI, affordable housing in Orange County).

Pick a county → agent maps every official with power over housing → drafts personalized emails & call scripts → launches a (simulated) outreach campaign with live progress and replies.

- Mobile web only. Fully scripted: no API keys, no messages actually sent.
- Orange County roster seeded with real 2025–26 officeholders; other counties use a generated roster.
- Stances, scores, and replies are illustrative.

## Run
```
npm install
npm run dev
```

## Deploy
Import this repo in Vercel → framework auto-detects Next.js → Deploy. No env vars needed.
