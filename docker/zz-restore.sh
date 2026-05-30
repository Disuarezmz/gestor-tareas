#!/bin/sh
# Runs inside docker-entrypoint-initdb.d on fresh cluster initialization.
# If a backup exists in /backups, restores the latest one automatically.
set -e

BACKUP_DIR="/backups"
DB_NAME="${POSTGRES_DB:-gestor_tareas}"

LATEST=$(ls -t "$BACKUP_DIR/${DB_NAME}_"*.sql.gz 2>/dev/null | head -1)

if [ -z "$LATEST" ]; then
    echo "[DisuTasks] No hay backup previo, base de datos iniciada vacía."
    exit 0
fi

echo "================================================================"
echo "  DisuTasks :: Restaurando datos desde backup"
echo "  Archivo: $LATEST"
echo "================================================================"
gunzip -c "$LATEST" | psql -v ON_ERROR_STOP=0 -U "$POSTGRES_USER" "$DB_NAME"
echo "[DisuTasks] Restauración completada."
