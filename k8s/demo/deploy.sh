#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
K8S_DIR="$ROOT_DIR/k8s/demo"
SSH_TARGET="${K8S_DEMO_SSH_TARGET:-root@31.220.89.105}"
NAMESPACE="${K8S_DEMO_NAMESPACE:-app-web-tjjud-demo}"
WORK_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$WORK_DIR"
}

trap cleanup EXIT

latest_component_version() {
  local prefix="$1"
  local latest_tag

  latest_tag="$(git -C "$ROOT_DIR" tag --list "${prefix}v*" | LC_ALL=C sort -V | tail -n 1 || true)"

  if [[ -z "$latest_tag" ]]; then
    echo "Nenhuma tag de release encontrada para o prefixo ${prefix}v*" >&2
    exit 1
  fi

  echo "${latest_tag#${prefix}v}"
}

git -C "$ROOT_DIR" fetch --force --tags origin >/dev/null 2>&1

BACKEND_VERSION="${K8S_DEMO_BACKEND_VERSION:-$(latest_component_version backend-)}"
FRONTEND_VERSION="${K8S_DEMO_FRONTEND_VERSION:-$(latest_component_version frontend-)}"
BACKEND_IMAGE="joaomilhome/app-web-tjjud-backend:${BACKEND_VERSION}"
FRONTEND_IMAGE="joaomilhome/app-web-tjjud-frontend:${FRONTEND_VERSION}"

if [[ ! -f "$K8S_DIR/secret.env" ]]; then
  DB_PASSWORD="$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 24)"
  cat > "$K8S_DIR/secret.env" <<EOF
POSTGRES_DB=tjjud_catalog
POSTGRES_USER=tjjud
POSTGRES_PASSWORD=$DB_PASSWORD
DB_URL=jdbc:postgresql://postgres:5432/tjjud_catalog
DB_USERNAME=tjjud
DB_PASSWORD=$DB_PASSWORD
EOF
  chmod 600 "$K8S_DIR/secret.env"
fi

cp -R "$K8S_DIR"/. "$WORK_DIR"/

cat > "$WORK_DIR/versions.env" <<EOF
BACKEND_IMAGE=$BACKEND_IMAGE
FRONTEND_IMAGE=$FRONTEND_IMAGE
APP_VERSION=$BACKEND_VERSION
EOF

echo "==> Using backend image: $BACKEND_IMAGE"
echo "==> Using frontend image: $FRONTEND_IMAGE"

echo "==> Ensuring namespace exists on $SSH_TARGET"
ssh -o StrictHostKeyChecking=no "$SSH_TARGET" "kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -"

echo "==> Applying runtime secret to $SSH_TARGET"
kubectl create secret generic app-web-tjjud-demo-secrets \
  --namespace "$NAMESPACE" \
  --from-env-file="$K8S_DIR/secret.env" \
  --dry-run=client \
  -o yaml | ssh -o StrictHostKeyChecking=no "$SSH_TARGET" 'kubectl apply -f -'

echo "==> Applying manifests to $SSH_TARGET"
kubectl kustomize "$WORK_DIR" | ssh -o StrictHostKeyChecking=no "$SSH_TARGET" 'kubectl apply -f -'

echo "==> Waiting for PostgreSQL"
ssh -o StrictHostKeyChecking=no "$SSH_TARGET" "kubectl rollout status statefulset/postgres -n $NAMESPACE --timeout=10m"

echo "==> Waiting for backend"
ssh -o StrictHostKeyChecking=no "$SSH_TARGET" "kubectl rollout status deployment/backend -n $NAMESPACE --timeout=10m"

echo "==> Waiting for frontend"
ssh -o StrictHostKeyChecking=no "$SSH_TARGET" "kubectl rollout status deployment/frontend -n $NAMESPACE --timeout=10m"

echo "==> Waiting for certificate"
ssh -o StrictHostKeyChecking=no "$SSH_TARGET" "kubectl wait --for=condition=Ready certificate/app-web-tjjud-demo-tls -n $NAMESPACE --timeout=15m || true"

echo "==> Final status"
ssh -o StrictHostKeyChecking=no "$SSH_TARGET" "kubectl get all,ingress,certificate,pvc -n $NAMESPACE"
