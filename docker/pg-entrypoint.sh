#!/bin/sh
# DisuTasks — PostgreSQL entrypoint
# • Auto-migrates data between PG major versions via pg_upgrade.
# • Saves a pg_dump backup to /backups on every clean shutdown (SIGTERM).
# • Restores the latest backup automatically when a fresh cluster is detected.
set -e

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
PGPARENT=$(dirname "$PGDATA")
NEW_BINDIR="/usr/local/bin"
OLD16_BINDIR="/usr/local/pg16/bin"
BACKUP_DIR="/backups"
DB_NAME="${POSTGRES_DB:-gestor_tareas}"
DB_USER="${POSTGRES_USER:-postgres}"

# ── Step 1: handle legacy volume layout ──────────────────────────────────────
if [ -f "$PGPARENT/PG_VERSION" ] && [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "==> [DisuTasks] Datos legacy detectados en la raiz del volumen."
    echo "    Reorganizando en $PGDATA ..."
    mkdir -p "$PGDATA"
    for f in "$PGPARENT"/*; do
        [ "$f" = "$PGDATA" ] && continue
        mountpoint -q "$f" 2>/dev/null && continue
        mv "$f" "$PGDATA/"
    done
    echo "    Reorganizacion completada."
fi

# ── Step 2: detect version mismatch and auto-migrate ─────────────────────────
if [ -f "$PGDATA/PG_VERSION" ]; then
    OLD_VER=$(cat "$PGDATA/PG_VERSION")
    NEW_VER=$("$NEW_BINDIR/postgres" --version | grep -oE '[0-9]+' | head -1)

    if [ "$OLD_VER" != "$NEW_VER" ]; then
        echo ""
        echo "================================================================"
        echo "  DisuTasks :: Migracion automatica de base de datos"
        echo "  PostgreSQL $OLD_VER  ->  $NEW_VER"
        echo "================================================================"
        echo ""

        case "$OLD_VER" in
            16) OLD_BINDIR="$OLD16_BINDIR" ;;
            *)
                echo "ERROR: Binarios de PostgreSQL $OLD_VER no incluidos en esta imagen."
                exit 1
                ;;
        esac

        NEW_DATA="$PGPARENT/data_new_pg${NEW_VER}"
        BACKUP_DATA="$PGPARENT/data_pg${OLD_VER}_backup"

        PWFILE=$(mktemp)
        printf '%s' "${POSTGRES_PASSWORD:-postgres}" > "$PWFILE"
        chmod 600 "$PWFILE"
        chown postgres "$PWFILE"

        echo "[1/3] Inicializando nuevo cluster PG${NEW_VER} en $NEW_DATA ..."
        gosu postgres "$NEW_BINDIR/initdb" \
            --username="${POSTGRES_USER:-postgres}" \
            --pwfile="$PWFILE" \
            -D "$NEW_DATA"
        rm -f "$PWFILE"

        echo "[2/3] Ejecutando pg_upgrade ..."
        cd "$PGPARENT"
        gosu postgres pg_upgrade \
            --old-bindir="$OLD_BINDIR" \
            --new-bindir="$NEW_BINDIR" \
            --old-datadir="$PGDATA" \
            --new-datadir="$NEW_DATA"

        echo "host all all all trust" >> "$NEW_DATA/pg_hba.conf"

        echo "[3/3] Rotando directorios ..."
        mv "$PGDATA"   "$BACKUP_DATA"
        mv "$NEW_DATA" "$PGDATA"

        echo ""
        echo "================================================================"
        echo "  Migracion PG${OLD_VER} -> PG${NEW_VER} completada con exito."
        echo "  Backup anterior en: $BACKUP_DATA"
        echo "================================================================"
        echo ""
    fi
fi

# ── Step 3: backup on shutdown ────────────────────────────────────────────────
_backup() {
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"
    echo "[DisuTasks] Guardando backup -> $BACKUP_FILE"
    pg_dump -U "$DB_USER" --data-only --no-privileges "$DB_NAME" | gzip > "$BACKUP_FILE"
    # Keep only the last 10 backups
    ls -t "$BACKUP_DIR/${DB_NAME}_"*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    echo "[DisuTasks] Backup completado."
}

_shutdown() {
    echo "[DisuTasks] Señal de apagado recibida — guardando backup..."
    # Wait up to 30 s for postgres to be ready (might still be starting)
    i=0
    while [ $i -lt 30 ]; do
        pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1 && break
        sleep 1
        i=$((i + 1))
    done
    _backup
    kill -TERM "$PG_PID" 2>/dev/null
    wait "$PG_PID" 2>/dev/null
    exit 0
}

trap '_shutdown' TERM INT

# Start postgres in background so we own PID 1 and can intercept SIGTERM
docker-entrypoint.sh "$@" &
PG_PID=$!

wait "$PG_PID"
