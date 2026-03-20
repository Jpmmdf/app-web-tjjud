# Demo e Acessos

## URLs publicas

- Frontend demo: [https://front-demo.pavim.com.br](https://front-demo.pavim.com.br)
- Swagger UI: [https://front-demo.pavim.com.br/swagger-ui.html](https://front-demo.pavim.com.br/swagger-ui.html)
- OpenAPI JSON: [https://front-demo.pavim.com.br/api-docs](https://front-demo.pavim.com.br/api-docs)
- Health check: [https://front-demo.pavim.com.br/actuator/health](https://front-demo.pavim.com.br/actuator/health)
- Documentacao publica: [https://jpmmdf.github.io/app-web-tjjud/](https://jpmmdf.github.io/app-web-tjjud/)

## Como a demo esta exposta

- o frontend e o ponto de entrada publico
- a API e publicada pelo mesmo host, via proxy reverso do nginx
- o backend nao precisa de um host publico separado para a operacao normal da demo

## Ambiente publicado

- cluster Kubernetes: `31.220.89.105`
- namespace da demo: `app-web-tjjud-demo`
- GitOps: Argo CD sincronizando o caminho `k8s/demo`
- banco: PostgreSQL stateful com PVC
- TLS: `cert-manager` com certificado para `front-demo.pavim.com.br`

Para detalhes da topologia GitOps e da arvore de recursos publicada, veja `Operacao > GitOps e Demo`.
