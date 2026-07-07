#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATADIR="$DIR/mysql_data"

echo "=== Initializing MySQL on Port 3307 ==="
mkdir -p "$DATADIR"

# 1. Initialize data directory without password
echo "Initializing data directory..."
/usr/local/mysql/bin/mysqld --initialize-insecure --datadir="$DATADIR"

echo "MySQL initialized successfully. You can start the server now."
