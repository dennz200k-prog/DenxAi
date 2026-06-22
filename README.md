# Орион / Oryn — AI Chat

Чат с Claude и Gemini (имитация) на одном интерфейсе.

## Деплой на Vercel

### 1. Залей на GitHub
```bash
git init
git add .
git commit -m "init oryn"
git remote add origin https://github.com/ТВО_ИМЯ/oryn.git
git push -u origin main
```

### 2. Подключи к Vercel
1. Зайди на [vercel.com](https://vercel.com) → **New Project**
2. Импортируй репо `oryn`
3. Framework Preset: **Vite** (Vercel определит сам)
4. Нажми **Deploy**

### 3. Добавь API ключ
1. В Vercel → Settings → **Environment Variables**
2. Добавь переменную:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (твой ключ с [console.anthropic.com](https://console.anthropic.com))
3. Нажми **Redeploy**

Всё! Приложение будет доступно по ссылке типа `oryn.vercel.app`

## Локальный запуск
```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```
