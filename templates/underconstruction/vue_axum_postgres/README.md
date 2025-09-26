# app_template

## frontend
### init
mkdir apps
npm create vite@latest

### tailwindcss
npm install tailwindcss @tailwindcss/vite

### 実行
```
cd development
docker compose exec frontend bash
npm run dev
```

## backend
### 実行
```
cd development
docker compose exec api bash
bacon run-long
```