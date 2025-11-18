#!/bin/sh
# Set a default DATABASE_URL if not provided
export DATABASE_URL="${DATABASE_URL:-file:./dev.db}"
npx prisma generate
