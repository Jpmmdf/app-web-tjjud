# Kubernetes Demo

Este pacote cria um ambiente demo completo no cluster Kubernetes com:

- namespace `app-web-tjjud-demo`
- PostgreSQL persistente
- backend Spring Boot
- frontend Angular com nginx
- ingress Traefik para `front-demo.pavim.com.br`
- certificado TLS via `cert-manager` e `ClusterIssuer letsencrypt-cloudflare`
- backend acessivel apenas internamente no cluster e publicado externamente pelo proxy do frontend em `/api`

## Arquivos sensiveis

Os arquivos abaixo nao entram no Git e sao gerados pelo script de deploy:

- `k8s/demo/secret.env`
- `k8s/demo/versions.env`

## Deploy

Use o script:

```bash
./k8s/demo/deploy.sh
```

Por padrao ele:

1. busca as tags mais recentes de release do backend e do frontend no repositorio
2. gera `secret.env` e `versions.env` se necessario
3. aponta os manifests para as imagens publicadas no Docker Hub em `joaomilhome/app-web-tjjud-backend` e `joaomilhome/app-web-tjjud-frontend`
4. aplica os manifests no cluster remoto
5. aguarda o rollout do banco, backend e frontend

## Variaveis uteis

- `K8S_DEMO_SSH_TARGET`: host SSH do cluster. Padrao: `root@31.220.89.105`
- `K8S_DEMO_NAMESPACE`: namespace de deploy. Padrao: `app-web-tjjud-demo`
- `K8S_DEMO_BACKEND_VERSION`: força uma versao especifica do backend em vez da ultima tag publicada
- `K8S_DEMO_FRONTEND_VERSION`: força uma versao especifica do frontend em vez da ultima tag publicada
