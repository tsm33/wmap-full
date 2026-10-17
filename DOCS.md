# WMap — Интерактивная картографическая платформа

## 1. Концепция

WMap — платформа для совместного планирования путешествий, объединяющая интерактивную карту и социальную сеть. Пользователи создают, публикуют и оценивают маршруты, комментируют их и общаются через отзывы.

---

## 2. Ключевые модули

### 2.1 Карта и маршруты

| Функция | Описание |
|---|---|
| Интерактивная карта | Просмотр карты (Leaflet / Mapbox GL / Яндекс Карты API) с зумом, перетаскиванием, переключением слоёв (спутник, схема, рельеф) |
| Точка маршрута | Добавление точек на карту кликом / поиском; указание имени, описания, категории (кафе, отель, достопримечательность, парковка и т.д.) |
| Соединение точек | Автоматическая прокладка маршрута между точками (пешеходный / автомобильный / велосипедный / транспортный режим) |
| Длительность и стоимость | Автоматический расчёт времени в пути и приблизительной стоимости (топливо, проезд, питание) |
| Дневные маршруты | Разбивка маршрута на дни поездки с привязкой к точкам |
| Редактирование | Drag-and-drop точек, вставка / удаление / переименование точек,.undo/redo |
| Экспорт | Экспорт маршрута в PDF, PNG, GPX, KML, ссылку-приглашение |
| Сохранение черновиков | Автосохранение неопубликованных маршрутов |

### 2.2 Социальная сеть / Профиль пользователя

| Функция | Описание |
|---|---|
| Профиль | Аватар, имя, биография, статистика (маршруты, подписчики, избранное), бейджи («Первый маршрут», «100 отзывов» и т.д.) |
| Лента | Лента публикаций подписок — новые маршруты, обновления, отзывы |
| Подписки / Подписчики | Возможность подписаться на пользователя, чтобы видеть его маршруты в ленте |
| Избранное | Сохранение чужих маршрутов в избранное (закладки) |
| Сравнение маршрутов | Сопоставление двух маршрутов по цене, длительности, оценке |

### 2.3 Система оценки и отзывов

| Функция | Описание |
|---|---|
| Рейтинг | Оценка маршрута от 1 до 5 звёзд (с точностью до 0.1 — среднее арифметическое) |
| Отзывы | Текстовый комментарий к маршруту с привязкой к точкам |
| Ответы автора | Вложенные комментарии — автор маршрута (и другие) отвечают на отзыв |
| Фото-отзывы | Загрузка фотографий к отзыву |
| Сортировка | Сортировка отзывов по дате, рейтингу, актуальности |
| Модерация | Жалобы на отзывы, скрытие оскорблений, блокировка пользователей |
| Реакции | Лайк / полезно на отзывы других пользователей |

### 2.4 Авторизация и безопасность

| Функция | Описание |
|---|---|
| Регистрация / Вход | Email + пароль (OAuth2 — опционально, на будущее) |
| JWT-сессии | Access (короткоживущий, в памяти приложения) + Refresh (ротация) |
| Сброс пароля | Через email с таймером жизни токена |
| RBAC | Роль: пользователь, модератор, администратор |
| 2FA | Опциональная двухфакторная аутентификация (TOTP) |

#### Реализация

Выбран стандартный для SPA + REST паттерн **JWT Access + Refresh**:

- Access-токен (15–30 мин) передаётся в заголовке `Authorization: Bearer`, хранится в памяти приложения (не в localStorage) — защита от XSS.
- Refresh-токен хранится в **HttpOnly cookie**, при каждом обновлении **ротируется**; при logout заносится в чёрный список (revocation).
- Пароли хешируются **bcrypt / argon2** (не храним в открытом виде).
- Для 0.5 RPS и одного сервера схема stateless-доступа не нагружает SQLite; отзыв токенов решается реестром refresh-токенов и чёрным списком.
- 2FA (TOTP) — опциональный модуль поверх JWT, подключается при необходимости.

---

## 3. Архитектура

Проект рассчитан на учебный масштаб (нагрузка ~0.5 RPS, бюджет 0): один сервис, файловая БД без отдельного сервера, только бесплатные сервисы.

```
┌─────────────────────────────────────────────┐
│                  Frontend                   │
│  React + Vite (SPA)                         │
│  - Карта: Leaflet + OpenStreetMap           │
│  - UI: Tailwind CSS / shadcn/ui             │
│  - Состояние: Zustand                       │
└──────────────────┬──────────────────────────┘
                   │ REST
┌──────────────────▼──────────────────────────┐
│                  Backend                    │
│  FastAPI (Python) — единый монолит          │
│  - Авторизация: JWT (email + пароль)        │
│  - Роутинг: OSRM (открытый сервер)          │
│  - Геокодинг: Nominatim (открытый API)      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│                  Database                   │
│  SQLite (файл БД, без отдельного сервера)   │
│  Файлы: локальное хранилище /uploads        │
│  (фото, аватары, экспорты)                  │
└─────────────────────────────────────────────┘
```

---

## 4. API — ключевые эндпоинты (REST)

### Auth

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Users

```
GET    /api/users/:id
PATCH  /api/users/:id
GET    /api/users/:id/routes
GET    /api/users/:id/followers
GET    /api/users/:id/following
POST   /api/users/:id/follow
DELETE /api/users/:id/follow
```

### Routes (маршруты)

```
POST   /api/routes              — создать маршрут
GET    /api/routes              — список маршрутов (фильтры, пагинация, сортировка)
GET    /api/routes/:id          — детали маршрута
PATCH  /api/routes/:id          — редактировать
DELETE /api/routes/:id          — удалить
POST   /api/routes/:id/publish  — опубликовать черновик
POST   /api/routes/:id/favorite — добавить в избранное
DELETE /api/routes/:id/favorite — убрать из избранного
GET    /api/routes/:id/export   — экспорт (PDF, GPX, KML)
GET    /api/routes/:id/stats    — статистика (просмотры, сохранения, оценка)
```

### Waypoints (точки маршрута)

```
GET    /api/routes/:id/waypoints
POST   /api/routes/:id/waypoints
PATCH  /api/routes/:id/waypoints/:wpId
DELETE /api/routes/:id/waypoints/:wpId
PATCH  /api/routes/:id/waypoints/reorder  — изменение порядка
```

### Reviews (отзывы)

```
GET    /api/routes/:id/reviews     — список отзывов (с вложенными ответами)
POST   /api/routes/:id/reviews     — оставить отзыв (рейтинг 1–5 + текст + фото)
POST   /api/reviews/:id/replies    — ответить на отзыв (автор/участник)
PATCH  /api/reviews/:id            — редактировать
DELETE /api/reviews/:id            — удалить
POST   /api/reviews/:id/report     — пожаловаться
POST   /api/reviews/:id/like       — поставить лайк
```

### Search

```
GET    /api/search?q=...&type=route|user  — поиск маршрутов и пользователей
GET    /api/search/nearby?lat=...&lng=...&radius=... — маршруты рядом
```

---

## 5. Модель данных (SQLite)

```sql
-- Пользователи
CREATE TABLE users (
    id         TEXT PRIMARY KEY,              -- UUID-строка
    email      TEXT UNIQUE NOT NULL,
    password   TEXT,                          -- NULL если OAuth
    name       TEXT NOT NULL,
    avatar_url TEXT,
    bio        TEXT,
    role       TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Подписки
CREATE TABLE follows (
    follower_id  TEXT REFERENCES users(id) ON DELETE CASCADE,
    following_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at   TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (follower_id, following_id)
);

-- Маршруты
CREATE TABLE routes (
    id           TEXT PRIMARY KEY,
    author_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
    title        TEXT NOT NULL,
    description  TEXT,
    cover_url    TEXT,
    status       TEXT DEFAULT 'draft',        -- draft, published, archived
    transport    TEXT DEFAULT 'car',          -- car, walk, bike, transit
    total_km     REAL,
    total_hours  REAL,
    total_cost   REAL,
    avg_rating   REAL DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    view_count   INTEGER DEFAULT 0,
    is_public    INTEGER DEFAULT 1,           -- SQLite: 1 = TRUE
    created_at   TEXT DEFAULT (datetime('now')),
    updated_at   TEXT DEFAULT (datetime('now'))
);

-- Точки маршрута
CREATE TABLE waypoints (
    id           TEXT PRIMARY KEY,
    route_id     TEXT REFERENCES routes(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL,
    name         TEXT,
    description  TEXT,
    category     TEXT,                        -- hotel, cafe, attraction, parking, etc.
    lat          REAL NOT NULL,               -- широта
    lng          REAL NOT NULL,               -- долгота
    duration_min INTEGER,                     -- время пребывания в минутах
    cost         REAL,
    created_at   TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_waypoints_route ON waypoints(route_id, position);

-- Отзывы (с вложенными ответами)
CREATE TABLE reviews (
    id         TEXT PRIMARY KEY,
    route_id   TEXT REFERENCES routes(id) ON DELETE CASCADE,
    author_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
    parent_id  TEXT REFERENCES reviews(id) ON DELETE CASCADE,  -- NULL = отзыв, иначе ответ
    rating     INTEGER CHECK (rating BETWEEN 1 AND 5),         -- NULL у ответов
    text       TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_reviews_route ON reviews(route_id);
CREATE INDEX idx_reviews_parent ON reviews(parent_id);

-- Фото отзывов
CREATE TABLE review_photos (
    id        TEXT PRIMARY KEY,
    review_id TEXT REFERENCES reviews(id) ON DELETE CASCADE,
    url       TEXT NOT NULL
);

-- Реакции на отзывы
CREATE TABLE review_likes (
    review_id  TEXT REFERENCES reviews(id) ON DELETE CASCADE,
    user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (review_id, user_id)
);

-- Избранное
CREATE TABLE favorites (
    user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
    route_id   TEXT REFERENCES routes(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, route_id)
);
```

---

## 6. Фронтенд — экранные сетки

### 6.1 Авторизация

| Экран | Описание |
|---|---|
| Login | Email + пароль, кнопки OAuth, ссылка «Забыли пароль?» |
| Register | Имя, email, пароль, подтверждение |
| Forgot Password | Ввод email, подтверждение |
| OAuth Callback | Обработка токена от провайдера |

### 6.2 Карта (главный экран)

| Элемент | Описание |
|---|---|
| Карта (100% viewport) | Интерактивная карта с плавающей боковой панелью |
| Поиск (top bar) | Поиск мест и маршрутов |
| Панель маршрута (side / bottom) | Список точек, расчёт, кнопка «Опубликовать» |
| Фильтры (layer toggle) | Тип транспорта, дневной план |
| Mini-map / overview | Масштабируемый обзор маршрута |
| Floating action | Кнопки: «Добавить точку», «Сохранить», «Поделиться» |

### 6.3 Лента (Feed)

| Элемент | Описание |
|---|---|
| Карточки маршрутов | Превью-карта, название, рейтинг, автор, дата |
| Фильтры | По тегам, рейтингу, дате, расстоянию, транспорту |
| Бесконечная прокрутка | Lazy load карточек |

### 6.4 Профиль пользователя

| Элемент | Описание |
|---|---|
| Шапка профиля | Аватар, имя, статистика, кнопка «Подписаться» |
| Вкладки | Мои маршруты / Избранное / Подписчики / Подписки |
| Карточки маршрутов | Same как в Feed |

### 6.5 Детали маршрута

| Элемент | Описание |
|---|---|
| Карта маршрута | Полноэкранная карта с маршрутом и точками |
| Информация | Название, описание, автор, статистика |
| Список точек | Нумерованный список с описаниями |
| Блок оценки | Средняя оценка + распределение звёзд |
| Отзывы | Список с фильтрацией, форма добавления, вложенные ответы автора |
| Кнопки | Поделиться / В избранное / Скачать (PDF/GPX) |

---

## 7. Нефункциональные требования

| Требование | Описание |
|---|---|
| Производительность | Отклик карты < 1s, загрузка ленты < 1s (нагрузка ~0.5 RPS) |
| Масштабируемость | Не требуется — нагрузка учебная, один сервер справляется |
| Безопасность | Валидация ввода, хеширование паролей, CSRF-защита |
| Доступность | Клавиатурная навигация, базовые aria-метки |
| Отзывчивость | Мобильная вёрстка карты и панели маршрута |
| Учебная цель | Понятный, прокомментированный код под требования дисциплины |

---

## 8. Фазы разработки

### Фаза 1 — MVP (4–6 недель)

- Регистрация / вход (email + пароль)
- Интерактивная карта с добавлением точек
- Создание, редактирование, сохранение маршрутов
- Публикация маршрута
- Просмотр маршрутов других пользователей (лента)
- Рейтинг (1–5 звёзд)

### Фаза 2 — Социал и обратная связь (4 недели)

- Отзывы с текстом и фото
- Ответы автора на отзывы (вложенные комментарии)
- Подписки / подписчики
- Избранное
- Профиль пользователя
- Поиск маршрутов и пользователей
- Уведомления о новых отзывах и ответах

### Фаза 3 — Полировка (2–3 недели)

- Экспорт маршрутов (PDF, GPX)
- Модерация и жалобы
- Административная панель
- Дополнительные режимы транспорта и слои карты

---

## 9. Стек технологий (рекомендация)

| Слой | Технологии |
|---|---|
| Frontend | React + Vite, Tailwind CSS, Zustand, Leaflet + OpenStreetMap |
| Backend | FastAPI (Python) — единый сервис |
| БД | SQLite (файл БД; Postgres — только при необходимости) |
| Файлы | Локальная папка `/uploads` |
| Гео | OSRM (открытый роутинг-сервер), Nominatim (открытый геокодинг) |
| CI/CD | GitHub Actions (по желанию) |
| Деплой | Один бесплатный хостинг: Render / Railway / Fly.io или VPS |

---

## 10. Команда (рекомендуемая)

| Роль | Кол-во | Зона ответственности |
|---|---|---|
| Студент (full-stack) | 1 | Весь проект: API, БД, карта, UI, деплой |

---

## 11. Идеи на будущее (вне текущего скоупа)

| Идея | Пояснение |
|---|---|
| Мессенджер | Личные и групповые чаты (WebSocket) — можно добавить после проверки спроса на отзывы |
| Совместное редактирование | Несколько авторов у одного маршрута в реальном времени |
| Мобильное приложение | Нативные приложения (React Native / Flutter) с офлайн-режимом |
| Клонирование маршрута | Форк чужого маршрута с изменениями под себя |
| Бронирование | Интеграция с отелями и билетами прямо из точек маршрута |
| Гид-режим | Пошаговая навигация по маршруту во время поездки |
