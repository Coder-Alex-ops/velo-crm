# Velo CRM

CRM система за велосипеден сервиз — клиенти, велосипеди, ремонти и плащания.

Изградена с Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase Postgres
и iron-session за автентикация.

## Локално стартиране

1. Копирай `.env.example` в `.env.local` и попълни стойностите:
   - `DATABASE_URL` — от Supabase → Project Settings → Database → Connection string → Transaction (port 6543)
   - `SESSION_SECRET` — поне 32 случайни символа (`openssl rand -base64 32`)
2. ```bash
   npm install
   npm run dev
   ```
3. Отвори [http://localhost:3000](http://localhost:3000).

## Първи вход

Seed admin потребител:

- Email: `alecho882@gmail.com`
- Парола: `admin123`

Смени паролата от *Потребители* веднага след първи логин.

## Раздели

- **Табло** (`/`) — обобщение, статистики, последни сервизи
- **Клиенти** (`/customers`)
- **Велосипеди** (`/bicycles`)
- **Сервизни записи** (`/services`)
- **Потребители** (`/users`) — само за администратори
- **Login** (`/login`)

## Production deployment (Netlify)

1. Push към GitHub.
2. На [app.netlify.com](https://app.netlify.com) → *Add new site* → *Import from Git* → избери velo-crm repo.
3. Build settings се вземат автоматично от `netlify.toml`.
4. *Site settings → Environment variables* → добави:
   - `DATABASE_URL`
   - `SESSION_SECRET`
5. *Deploy site*. Готово.

## Валута

Всички суми се показват в евро (€).
