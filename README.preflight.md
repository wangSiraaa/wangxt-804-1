# Trae Preflight

This folder is prepared for `wangxt-804-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18104
- API_PORT: 19104
- WEB_PORT: 20104
- DB_PORT: 21104
- REDIS_PORT: 22104

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
