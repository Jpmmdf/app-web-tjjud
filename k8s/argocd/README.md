# Argo CD

Manifestos do Argo CD para o ambiente demo do projeto.

Arquivos:

- `argocd-cm-ingress-health.yaml`: customiza o health check de `Ingress` para ambientes com Traefik sem `loadBalancer` publicado
- `app-project.yaml`: delimita o projeto `app-web-tjjud`
- `app-demo.yaml`: registra a aplicacao `app-web-tjjud-demo`

Observacao importante:

- a `Application` aponta para a branch `main`
- o Secret `app-web-tjjud-demo-secrets` precisa existir no cluster antes do primeiro sync
