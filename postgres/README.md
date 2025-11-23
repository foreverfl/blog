# Database Management Guide

This document explains how to initialize, migrate, and manage the PostgreSQL database.

**Core Tool**: [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) - Pure SQL-based migration (No ORM)

## 📁 Folder Structure

```
postgres/
├── init/                          # Development environment auto-initialization
│   ├── 01-schema.sql              # Table schemas
│   └── 02-indexes.sql             # Indexes
└── migrations/                    # Production migrations (node-pg-migrate)
    ├── 001_initial-schema.sql     # Initial schema
    ├── 002_add-indexes.sql        # Add indexes
    └── ...                        # Sequential change history
```

## 🎯 Development vs Production Workflows

### Development Environment (Auto-initialization)

```bash
# Start PostgreSQL with Docker (init folder auto-executes)
docker-compose -f docker-compose.dev.yml up -d postgres

# Re-initialize after schema changes
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres
```

**Features:**

- SQL files in `postgres/init/` folder auto-execute **on first run only**
- Executes in alphabetical order (01 → 02 → 03...)
- Can re-initialize anytime by deleting volumes

### Production Environment (node-pg-migrate)

```bash
# 1. Connect SSH Tunnel (production DB is inside VPC)
ssh -L 5433:localhost:5432 your-server

# 2. Check migration status
DATABASE_URL="postgresql://user:password@localhost:5433/mogumogu" npm run migrate:status

# 3. Run migrations
DATABASE_URL="postgresql://user:password@localhost:5433/mogumogu" npm run migrate:up

# 4. Rollback (if needed)
DATABASE_URL="postgresql://user:password@localhost:5433/mogumogu" npm run migrate:down
```

**Features:**

- Sequentially executes SQL files in `postgres/migrations/` folder
- Automatically records execution history in `pgmigrations` table
- Manages change history with Git
- Uses pure SQL only (No ORM)

## 🔧 node-pg-migrate Usage

### 1. Creating New Migrations

**Method A: Auto-generate (automatic numbering)**

```bash
npm run migrate:create add-user-role
# ❌ Issue: Creates .js file in root folder (configuration bug)
```

**Method B: Manual creation (Recommended)**

```bash
# Create postgres/migrations/003_add-user-role.sql
```

```sql
-- Migration: Add user role column
-- Description: Adds role column to users table for authorization
-- Date: 2024-01-23

BEGIN;

-- Add new column
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS role varchar(32) DEFAULT 'user' NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Verify changes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        RAISE EXCEPTION 'Migration failed: role column not found';
    END IF;
END $$;

COMMIT;
```

**File Naming Convention:**

- `{number}_{description}.sql` (e.g., `003_add-user-role.sql`)
- Numbers are 3-digit sequential increments
- Use kebab-case for descriptions

### 2. Running Migrations

```bash
# Local development (Docker)
DATABASE_URL="postgresql://user:password@localhost:5432/mogumogu" npm run migrate:up

# Production (SSH Tunnel)
DATABASE_URL="postgresql://user:password@localhost:5433/mogumogu" npm run migrate:up
```

### 3. Checking Migration Status

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mogumogu" npm run migrate:status
```

**Example output:**

```
┌─────────────────────────┬─────────┐
│ Migration               │ Status  │
├─────────────────────────┼─────────┤
│ 001_initial-schema      │ applied │
│ 002_add-indexes         │ applied │
│ 003_add-user-role       │ pending │
└─────────────────────────┴─────────┘
```

### 4. Rollback (Undo last migration)

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mogumogu" npm run migrate:down
```

**Important:**

- Rollback only undoes the last migration
- Manual reversal required if SQL file lacks rollback logic
- Backup is essential in production!

## 📋 Real-world Workflow

### Scenario 1: Adding a New Column

**Step 1: Local Development**

```bash
# Modify init/01-schema.sql (add column to table)
vim postgres/init/01-schema.sql

# Re-initialize local DB
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres
```

**Step 2: Write Migration File**

```bash
# Create postgres/migrations/003_add-user-role.sql
vim postgres/migrations/003_add-user-role.sql
```

**Step 3: Test Migration Locally**

```bash
# Run migration
DATABASE_URL="postgresql://user:password@localhost:5432/mogumogu" npm run migrate:up

# Check status
DATABASE_URL="postgresql://user:password@localhost:5432/mogumogu" npm run migrate:status
```

**Step 4: Git Commit**

```bash
git add postgres/
git commit -m "feat: add user role column"
```

**Step 5: Production Deployment**

```bash
# Connect SSH Tunnel
ssh -L 5433:localhost:5432 production-server

# Backup (Essential!)
pg_dump -h localhost -p 5433 -U user -d mogumogu > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration
DATABASE_URL="postgresql://user:password@localhost:5433/mogumogu" npm run migrate:up

# Verify
psql -h localhost -p 5433 -U user -d mogumogu -c "\d users"
```

### Scenario 2: Rolling Back a Migration

⚠️ **CRITICAL: NEVER delete migration files!** Migration files are history records, like Git commits.

#### Option A: Rollback with New Migration (Recommended)

**Best for:** Production environments where you need full audit trail

```bash
# Step 1: Create new migration to revert changes
vim postgres/migrations/004_remove-user-role.sql
```

```sql
-- Migration: Remove user role column
-- Description: Rollback 003_add-user-role.sql
-- Date: 2025-11-23

BEGIN;

DROP INDEX IF EXISTS idx_users_role;
ALTER TABLE public.users DROP COLUMN IF EXISTS role;

COMMIT;
```

```bash
# Step 2: Run the new migration normally
DATABASE_URL="postgresql://user:password@localhost:5432/mogumogu" npm run migrate:up

# Step 3: Update init files to reflect current state
vim postgres/init/01-schema.sql  # Remove role column

# Step 4: Commit changes
git add .
git commit -m "revert: remove user role column"
```

**Benefits:**

- Full change history preserved in Git
- Clear audit trail of what changed and when
- Can rollback the rollback if needed

#### Option B: Manual Rollback (Use only when necessary)

**Best for:** Local development, fixing mistakes quickly

```bash
# Step 1: Execute ROLLBACK INSTRUCTIONS from migration file
psql -h localhost -p 5432 -U user -d mogumogu <<EOF
ALTER TABLE public.users DROP COLUMN role;
DROP INDEX IF EXISTS idx_users_role;
EOF

# Step 2: Delete migration record from tracking table
psql -h localhost -p 5432 -U user -d mogumogu <<EOF
DELETE FROM pgmigrations WHERE name = '003_add-user-role';
EOF

# Step 3: Update init files
vim postgres/init/01-schema.sql  # Remove role column

# Step 4: Delete migration file ONLY if:
#   - Never run in production
#   - Not yet committed to Git
#   - Just for testing
rm postgres/migrations/003_add-user-role.sql  # Only for test files!
```

**Warnings:**

- ⚠️ Don't use in production (no audit trail)
- ⚠️ Never delete migration files that were run in production
- ⚠️ Make sure to update both DB and migration tracking table

## 🔍 Useful Commands

### Connect to PostgreSQL Container

```bash
docker exec -it postgres psql -U user -d mogumogu
```

### List Tables

```sql
\dt public.*
```

### Show Table Schema

```sql
\d public.users
```

### List Indexes

```sql
\di public.*
```

### Check Migration History

```sql
SELECT * FROM pgmigrations ORDER BY id;
```

### Manually Execute SQL File

```bash
# Development environment
psql -h localhost -p 5432 -U user -d mogumogu < postgres/migrations/003_add-user-role.sql

# Production environment (SSH Tunnel)
psql -h localhost -p 5433 -U user -d mogumogu < postgres/migrations/003_add-user-role.sql
```

## ⚠️ Important Notes

### Development Environment

- ✅ `init/` folder auto-executes **on first run only**
- ✅ Re-initialize by **deleting volumes** after schema changes
- ✅ Use `IF NOT EXISTS` in all SQL statements (ensures idempotency)

### Production Environment

- ⚠️ **NEVER** directly execute `init/` folder scripts in production
- ⚠️ **Always backup** before running migrations
- ⚠️ Use `BEGIN`/`COMMIT` transactions for rollback capability
- ⚠️ Perform critical changes **outside business hours**
- ⚠️ SSH Tunnel is for accessing VPC-internal DB (security essential)

### node-pg-migrate Limitations

- ⚠️ Auto-generation (`migrate:create`) doesn't work properly → **Manual creation recommended**
- ⚠️ Rollback only works for last migration
- ⚠️ `.node-pg-migraterc` has configuration bugs (workaround: manual file creation)

## 🎯 Best Practices

1. **Ensure Idempotency**

   ```sql
   -- ✅ Good example
   ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(32);
   CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

   -- ❌ Bad example
   ALTER TABLE users ADD COLUMN role varchar(32);  -- Errors on second run
   ```

2. **Use Transactions**

   ```sql
   BEGIN;
   -- All change operations
   COMMIT;
   ```

3. **Include Verification Logic**

   ```sql
   DO $$
   BEGIN
       IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'users' AND column_name = 'role') THEN
           RAISE EXCEPTION 'Migration failed';
       END IF;
   END $$;
   ```

4. **Comment Rollback Instructions**

   ```sql
   -- ROLLBACK INSTRUCTIONS:
   -- ALTER TABLE users DROP COLUMN role;
   -- DROP INDEX IF EXISTS idx_users_role;
   ```

5. **Clear Commit Messages**
   ```bash
   git commit -m "feat: add user role column for RBAC"
   ```

## 🔗 References

- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL Initialization](https://hub.docker.com/_/postgres)

## 📝 Troubleshooting

### Q: `npm run migrate:create` creates files in root folder

**A:** This is a `.node-pg-migraterc` configuration bug. Manually create files in `postgres/migrations/`.

### Q: Migrations aren't running

**A:** Check if DATABASE_URL environment variable is properly set:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mogumogu" npm run migrate:up
```

### Q: Development and production schemas differ

**A:**

1. Update `init/` folder to latest state
2. Record all migrations in `migrations/`
3. Run same migration files in both environments

### Q: Rollback isn't working

**A:** node-pg-migrate cannot auto-rollback SQL files without explicit down logic.
Manually write rollback SQL or restore from backup.

### Q: SSH Tunnel port conflict

**A:** Use a different port for tunneling:

```bash
ssh -L 5434:localhost:5432 production-server
DATABASE_URL="postgresql://user:password@localhost:5434/mogumogu" npm run migrate:up
```
