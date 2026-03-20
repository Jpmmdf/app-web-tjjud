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

O arquivo abaixo nao entra no Git e e gerado pelo script de deploy:

- `k8s/demo/secret.env`

O arquivo `k8s/demo/versions.env` agora faz parte do repositorio para que o Argo CD consiga montar o pacote diretamente do Git.

## Deploy

Use o script:

```bash
./k8s/demo/deploy.sh
```

Por padrao ele:

1. busca as tags mais recentes de release do backend e do frontend no repositorio
2. gera `secret.env` se necessario
3. aplica ou atualiza o Secret runtime `app-web-tjjud-demo-secrets` no cluster remoto
4. monta um pacote temporario com as tags de imagem desejadas para backend e frontend
5. aplica os manifests no cluster remoto
6. aguarda o rollout do banco, backend e frontend

## Variaveis uteis

- `K8S_DEMO_SSH_TARGET`: host SSH do cluster. Padrao: `root@31.220.89.105`
- `K8S_DEMO_NAMESPACE`: namespace de deploy. Padrao: `app-web-tjjud-demo`
- `K8S_DEMO_BACKEND_VERSION`: força uma versao especifica do backend em vez da ultima tag publicada
- `K8S_DEMO_FRONTEND_VERSION`: força uma versao especifica do frontend em vez da ultima tag publicada

## Argo CD

O pacote `k8s/demo` foi estruturado para ser consumido pelo Argo CD diretamente do Git.
Para isso:

- `versions.env` fica versionado no repositorio
- o Secret `app-web-tjjud-demo-secrets` precisa existir previamente no cluster
- o backend continua interno ao cluster e o frontend publica a API externamente por `/api`
