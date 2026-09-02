#!/bin/bash
set -e

# ==============================================================================
# PULSE AI (SGEA v2.0) - Script de Despliegue y Aprovisionamiento GCP / Firebase
# ==============================================================================

PROJECT_ID="training-ia-8f67f"
REGION="us-central1"

echo "🚀 Iniciando aprovisionamiento y despliegue para el proyecto: $PROJECT_ID..."

# 1. Verificar autenticación en Firebase
echo "🔑 Verificando sesión en Firebase CLI..."
npx -y firebase-tools projects:list

# 2. Desplegar reglas de Firestore en la nube
echo "🛡️ Desplegando reglas de seguridad de Firestore..."
npx -y firebase-tools deploy --only firestore:rules --project "$PROJECT_ID"

# 3. Instrucción para App Hosting
echo "📦 Repositorio GitHub sincronizado en rama 'main'."
echo "🔗 Para conectar o reconstruir App Hosting, visita:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/apphosting"

echo "✅ Despliegue de reglas y sincronización completados con éxito."
