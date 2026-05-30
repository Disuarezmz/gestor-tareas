#!/bin/sh
# DisuTasks — PostgreSQL auto-migration entrypoint
# Detects data from an older PG major version and upgrades it via pg_upgrade.
# Volume must be mounted at the PARENT of PGDATA (e.g. /var/lib/postgresql)
# so that old-data backup and new-data staging dirs share the same filesystem,
# allowing pg_upgrade --link (hard-link mode, no full data copy needed).
set -e

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
PGPARENT=$(dirname "$PGDATA")
NEW_BINDIR="/usr/local/bin"
OLD16_BINDIR="/usr/local/pg16/bin"

# ── Step 1: handle legacy volume layout ──────────────────────────────────────
# If the volume was previously mounted directly at $PGDATA (old docker-compose),
# the PG data files will appear at $PGPARENT/ instead of $PGPARENT/data/.
# Detect and reorganise transparently.
if [ -f "$PGPARENT/PG_VERSION" ] && [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "==> [DisuTasks] Datos legacy detectados en la raiz del volumen."
    echo "    Reorganizando en $PGDATA ..."
    mkdir -p "$PGDATA"
    for f in "$PGPARENT"/*; do
        [ "$f" = "$PGDATA" ] && continue
        # Skip paths that are Docker mount points (cannot be renamed)
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

        # Resolve old bindir for the detected version
        case "$OLD_VER" in
            16) OLD_BINDIR="$OLD16_BINDIR" ;;
            *)
                echo "ERROR: Binarios de PostgreSQL $OLD_VER no incluidos en esta imagen."
                echo "       Para migrar desde versiones anteriores a la 16, actualiza"
                echo "       docker/Dockerfile.db agregando otro stage FROM postgres:${OLD_VER}-alpine"
                echo "       y copia los binarios al path /usr/local/pg${OLD_VER}/bin/"
                exit 1
                ;;
        esac

        NEW_DATA="$PGPARENT/data_new_pg${NEW_VER}"
        BACKUP_DATA="$PGPARENT/data_pg${OLD_VER}_backup"

        # Temporary password file (avoids shell substitution issues)
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
        # pg_upgrade escribe logs en el directorio actual; usar PGPARENT (en el volumen)
        cd "$PGPARENT"
        gosu postgres pg_upgrade \
            --old-bindir="$OLD_BINDIR" \
            --new-bindir="$NEW_BINDIR" \
            --old-datadir="$PGDATA" \
            --new-datadir="$NEW_DATA"

        # Allow connections from any host (Docker networks) in the new cluster
        echo "host all all all trust" >> "$NEW_DATA/pg_hba.conf"

        echo "[3/3] Rotando directorios ..."
        mv "$PGDATA"   "$BACKUP_DATA"
        mv "$NEW_DATA" "$PGDATA"

        echo ""
        echo "================================================================"
        echo "  Migracion PG${OLD_VER} -> PG${NEW_VER} completada con exito."
        echo ""
        echo "  Backup del cluster anterior:"
        echo "    $BACKUP_DATA"
        echo ""
        echo "  Cuando confirmes que todo funciona, puedes eliminarlo con:"
        echo "    docker compose exec db rm -rf $BACKUP_DATA"
        echo "================================================================"
        echo ""
    fi
fi

exec docker-entrypoint.sh "$@"
