# 🏗️ Solana Asset Tokenization Platform

**SolAssets** is a modern platform for tokenizing real-world assets (RWA) on the Solana blockchain, allowing investors to buy shares in real estate, equipment, and art.

![Platform Preview](https://via.placeholder.com/800x400/00A8E8/FFFFFF?text=SolAssets+Platform)

## 🌟 Key Features

### 💰 Investment
- **Fractional Ownership** — invest in expensive assets starting from 10 USDC
- **Global Access** — assets from around the world without geographical restrictions
- **Instant Liquidity** — trade asset shares 24/7 on decentralized exchange

### 🔒 Security and Transparency
- **Smart Contracts** — all operations recorded on Solana blockchain
- **KYC/AML** — complete user verification and regulatory compliance
- **Asset Audit** — professional valuation and verification of each asset

### 📊 Analytics and Management
- **Portfolio** — detailed yield and risk analytics
- **Transaction History** — complete transparency of all operations
- **Dividends** — automatic distribution of asset income

## 🏗️ Архитектура проекта

```
assetslicenew/
├── 🎨 Frontend (Next.js 14)
│   ├── app/                    # App Router страницы
│   │   ├── assets/            # Каталог активов
│   │   ├── portfolio/         # Портфолио пользователя
│   │   ├── trade/             # Торговая платформа
│   │   ├── history/           # История транзакций
│   │   └── api/               # API маршруты
│   ├── components/            # React компоненты
│   │   ├── layout/           # Компоненты макета
│   │   ├── providers/        # Context провайдеры
│   │   └── ui/               # UI компоненты
│   └── lib/                  # Утилиты и типы
│
├── ⚡ Solana Programs (Rust)
│   ├── rwa_backend/          # Основная программа токенизации
│   ├── rwa_market/           # Программа торговой площадки
│   └── rwa_registry/         # Реестр активов
│
├── 🗄️ Backend Services
│   ├── indexer/              # Индексатор блокчейн данных
│   ├── api/                  # REST API сервисы
│   └── migrations/           # Миграции базы данных
│
└── 📊 Database (PostgreSQL + Prisma)
    └── prisma/               # Схема и миграции БД
```

## 🛠️ Технологический стек

### Frontend
- **Next.js 14** — React фреймворк с App Router
- **TypeScript** — типизированный JavaScript
- **Tailwind CSS** — utility-first CSS фреймворк
- **Framer Motion** — анимации и переходы
- **Recharts** — графики и диаграммы

### Blockchain
- **Solana** — высокопроизводительный блокчейн
- **Anchor Framework** — фреймворк для разработки Solana программ
- **Rust** — системный язык программирования
- **SPL Token** — стандарт токенов Solana

### Wallet Integration
- **@solana/wallet-adapter** — интеграция с кошельками
- **Phantom** — поддержка популярного кошелька
- **Solflare** — альтернативный кошелек
- **Backpack** — современный кошелек для Solana

### Backend & Database
- **PostgreSQL** — реляционная база данных
- **Prisma** — современный ORM для TypeScript
- **Node.js** — серверная среда выполнения

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** 18+ и npm/yarn
- **Rust** 1.70+ и Cargo
- **Solana CLI** 1.16+
- **Anchor CLI** 0.29+
- **PostgreSQL** 14+

### Установка

1. **Клонирование репозитория**
```bash
git clone https://github.com/your-username/solana-asset-tokenization.git
cd solana-asset-tokenization
```

2. **Установка зависимостей**
```bash
# Frontend зависимости
npm install

# Solana программы
cd rwa_backend
anchor build
cd ..
```

3. **Настройка окружения**
```bash
# Скопируйте и настройте переменные окружения
cp .env.example .env.local
cp .env.example .env

# Настройте подключение к базе данных в .env
DATABASE_URL="postgresql://username:password@localhost:5432/solassets"
```

4. **Настройка базы данных**
```bash
# Создание и миграция базы данных
npx prisma migrate dev
npx prisma generate
```

5. **Запуск в режиме разработки**
```bash
# Запуск frontend
npm run dev

# В отдельном терминале - запуск Solana validator
solana-test-validator

# В третьем терминале - деплой программ
cd rwa_backend
anchor deploy
```

Приложение будет доступно по адресу: http://localhost:3000

## 📱 Основные страницы

### 🏠 Главная страница (`/`)
- Обзор платформы и ключевых преимуществ
- Статистика активов и инвесторов
- Интеграция с кошельками Solana

### 🏢 Каталог активов (`/assets`)
- Просмотр всех доступных активов
- Фильтрация по категориям (недвижимость, оборудование, искусство)
- Поиск и сортировка активов
- Детальная информация о каждом активе

### 💼 Портфолио (`/portfolio`)
- Обзор инвестиций пользователя
- Аналитика доходности и P&L
- Распределение активов по категориям
- История дивидендов

### 📈 Торговая площадка (`/trade`)
- Покупка и продажа долей активов
- Книга ордеров в реальном времени
- История сделок
- Графики цен и объемов

### 📋 История транзакций (`/history`)
- Полная история всех операций
- Фильтрация по типам транзакций
- Статусы подтверждений в блокчейне
- Экспорт данных

## 🔧 API Endpoints

### Assets API
```typescript
GET /api/assets              # Получить список активов
GET /api/assets/[id]         # Получить актив по ID
POST /api/assets             # Создать новый актив (admin)
```

### Portfolio API
```typescript
GET /api/portfolio           # Получить портфолио пользователя
GET /api/portfolio/stats     # Статистика портфолио
```

### Trading API
```typescript
GET /api/orderbook          # Получить книгу ордеров
POST /api/orders            # Создать ордер
GET /api/trades             # История сделок
```

### Transactions API
```typescript
GET /api/transactions       # История транзакций
POST /api/transactions      # Создать транзакцию
GET /api/transactions/[sig] # Получить транзакцию по подписи
```

## 🏗️ Solana программы

### RWA Backend (`rwa_backend`)
Основная программа для управления токенизированными активами:

```rust
// Основные инструкции
pub fn initialize(ctx: Context<Initialize>) -> Result<()>
pub fn create_asset(ctx: Context<CreateAsset>, params: CreateAssetParams) -> Result<()>
pub fn mint_shares(ctx: Context<MintShares>, amount: u64) -> Result<()>
pub fn transfer_shares(ctx: Context<TransferShares>, amount: u64) -> Result<()>
```

### RWA Market (`rwa_market`)
Программа децентрализованной торговой площадки:
- Создание и управление ордерами
- Сопоставление покупателей и продавцов
- Расчет комиссий и распределение

### RWA Registry (`rwa_registry`)
Реестр всех токенизированных активов:
- Метаданные активов
- Верификация и аудит
- Управление правами доступа

## 🎨 UI/UX особенности

### Дизайн система
- **Цветовая палитра**: Solana-inspired (зеленый) + Ocean blue
- **Типографика**: Inter для текста, Satoshi для заголовков
- **Темная тема**: Полная поддержка dark/light режимов
- **Адаптивность**: Mobile-first подход

### Анимации
- **Framer Motion** для плавных переходов
- **Микроинтеракции** для улучшения UX
- **Skeleton loading** для лучшего восприятия загрузки

### Компоненты
- **Модульная архитектура** — переиспользуемые UI компоненты
- **TypeScript** — полная типизация для безопасности
- **Error Boundaries** — обработка ошибок на уровне компонентов

## 🔐 Безопасность

### Blockchain Security
- **Program Derived Addresses (PDA)** для безопасного хранения данных
- **Anchor Framework** с встроенными проверками безопасности
- **Multisig** поддержка для критических операций

### Frontend Security
- **Input validation** на всех формах
- **XSS protection** через Next.js
- **CSRF protection** для API endpoints
- **Wallet signature verification** для всех транзакций

### Data Protection
- **Encrypted sensitive data** в базе данных
- **Rate limiting** для API endpoints
- **Audit logs** для всех критических операций

## 📊 База данных

### Основные модели

```prisma
model Asset {
  id           String @id @default(cuid())
  mint         String @unique
  ticker       String
  issuer       String
  priceUsdc    BigInt
  totalSupply  BigInt
  freeFloat    BigInt
  // Relations
  trades       Trade[]
  positions    Position[]
  dividends    Dividend[]
}

model Trade {
  id        String @id @default(cuid())
  sig       String @unique
  mint      String
  side      String // "buy" or "sell"
  priceUsdc BigInt
  amount    BigInt
  wallet    String
}

model Position {
  id        String @id @default(cuid())
  wallet    String
  mint      String
  amount    BigInt
  avgPrice  BigInt
}
```

## 🧪 Тестирование

### Frontend тесты
```bash
npm run test              # Unit тесты
npm run test:e2e          # End-to-end тесты
npm run test:coverage     # Покрытие кода
```

### Solana программы
```bash
cd rwa_backend
anchor test               # Тесты смарт-контрактов
```

## 🚀 Деплой

### Frontend (Vercel)
```bash
npm run build
npm run start
```

### Solana программы
```bash
# Mainnet деплой
anchor build
anchor deploy --provider.cluster mainnet
```

### База данных
```bash
# Продакшн миграции
npx prisma migrate deploy
```

## 🤝 Участие в разработке

1. **Fork** репозитория
2. Создайте **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** изменения (`git commit -m 'Add amazing feature'`)
4. **Push** в branch (`git push origin feature/amazing-feature`)
5. Откройте **Pull Request**

### Стандарты кода
- **ESLint** + **Prettier** для JavaScript/TypeScript
- **Rustfmt** для Rust кода
- **Conventional Commits** для сообщений коммитов

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.


---

**Сделано с ❤️ для будущего децентрализованных финансов**