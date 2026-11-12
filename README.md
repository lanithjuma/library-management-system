# Library Management System

NestJS + Prisma + PostgreSQL backend for a library's book catalog.

## Setup

```bash
cd api
npm install
cp .env.example .env        # then set DATABASE_URL to your hosted Postgres
npx prisma migrate dev --name init
npx prisma db seed
```

Add this to `api/package.json` so `db seed` works:

```json
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

## Schema Decisions

**Why Book references Genre instead of embedding it.**
`Book` holds a `genreId` foreign key with a `@relation` to `Genre`, rather than
storing the genre's data inside each book row. Reasons:

- **Single source of truth.** A genre's name lives in exactly one row. Renaming
  "Sci-Fi" to "Science Fiction" is one update, not a rewrite of every book.
- **No inconsistency.** Embedded strings drift ("Mystery", "mystery", "Mysteries").
  A foreign key guarantees every book points to a genre that actually exists.
- **Genres are queried on their own.** We list genres, count books per genre, and
  filter books by genre. With a separate table this is a simple indexed join;
  embedding would force scanning and de-duplicating every book.
- **Referential integrity.** PostgreSQL rejects a book with a bad `genreId` and
  blocks deleting a genre that still has books.

**Other decisions**

- `Role` is a Prisma enum (`PATRON`, `LIBRARIAN`) so invalid roles can't be stored;
  new users default to `PATRON`.
- `@@unique([title, author])` on `Book` makes the seed idempotent and prevents duplicate catalog entries.
- `@@index([genreId])` speeds up "books in this genre" queries.
- `copies` tracks stock per title (default 1).

**Stretch: Review model.** `Review` links `Book` and `User` (many-to-one each),
with `@@unique([bookId, userId])` so a user can review a book only once.
Deleting a book or user cascades to their reviews.

## Prisma vs. a Document Database

In a document database like MongoDB my instinct would be to nest the genre (or
even reviews) inside the book document. In Prisma the schema is declared up
front and relations are explicit, so the database enforces what a document store
leaves to application code. Changing the shape means a migration, which is more
ceremony but catches mistakes early.
