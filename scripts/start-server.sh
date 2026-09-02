#!/usr/bin/env bash
set -e

# ==============================================================================
# PULSE AI PRO - SCRIPT DE ARRANQUE ROBUSTO CON CAPACIDAD DE CABECERAS (128 KB)
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# 1. Garantizar NODE_OPTIONS y PATH universal
export NODE_OPTIONS="--max-http-header-size=131072"
export PATH="/Users/germanmorales/.nvm/versions/node/v24.15.0/bin:$HOME/.nvm/versions/node/v24.15.0/bin:$PATH:/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin"

NODE_BIN="/Users/germanmorales/.nvm/versions/node/v24.15.0/bin/node"
if [ ! -x "$NODE_BIN" ]; then
  NODE_BIN="$(command -v node || echo "node")"
fi

echo "🚀 [Pulse Server] Iniciando con NODE_OPTIONS=$NODE_OPTIONS"
echo "📂 [Pulse Server] Directorio: $PROJECT_DIR"
echo "⚙️ [Pulse Server] Binario Node: $NODE_BIN"

# 2. Liberar puerto 3000 de procesos zombis
echo "🧹 [Pulse Server] Verificando y liberando puerto 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# 3. Compilar si no existe BUILD_ID de producción o si se solicita explícitamente
if [ ! -f ".next/BUILD_ID" ] || [ "$1" == "--build" ] || [ "$1" == "-b" ]; then
  echo "📦 [Pulse Server] Generando compilación de producción limpia..."
  "$NODE_BIN" ./node_modules/next/dist/bin/next build
fi

# 4. Iniciar servidor Next.js directamente
echo "⚡ [Pulse Server] Levantando servidor en http://localhost:3000..."
exec "$NODE_BIN" ./node_modules/next/dist/bin/next start -p 3000
