#!/bin/bash
set -e

MARKER_FILE="/app/.initialized"

if [ ! -f "$MARKER_FILE" ]; then
    echo "First-time volume detected. Running Python initialization script..."
    python /app/init_script.py
    
    touch "$MARKER_FILE"
else
    echo "Volume already exists. Skipping initialization."
fi

exec "$@"