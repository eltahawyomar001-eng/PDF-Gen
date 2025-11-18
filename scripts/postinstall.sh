#!/bin/sh
# Only set default DATABASE_URL if not already set
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:./dev.db"
fi
npx prisma generate
