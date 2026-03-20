# Operacao

## Containers locais

O runtime local padrao usa:

- `postgres`: banco relacional
- `backend`: API Spring Boot
- `frontend`: SPA Angular servida por nginx
- `jaeger`: backend local de traces com ingestao OTLP e interface web

Suba tudo com:

```bash
docker compose up --build
```

## Configuracao externa

### Backend

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `SERVER_PORT`
- `JAVA_OPTS`
- `OTEL_ENVIRONMENT`
- `MANAGEMENT_TRACING_SAMPLING_PROBABILITY`
- `MANAGEMENT_OTLP_TRACING_ENDPOINT`
- `MANAGEMENT_OTLP_TRACING_TRANSPORT`

### Banco

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

## Health checks

- postgres: `pg_isready`
- backend: `/actuator/health/readiness`
- frontend: publicado na porta `4200` e usando proxy reverso para `/api`

## Observabilidade

- logs estruturados do Spring Boot e nginx
- `/actuator/metrics` para metricas
- `/actuator/health`, `/liveness` e `/readiness` para probes
- traces OpenTelemetry exportados via OTLP HTTP para o Jaeger local
- spans de negocio nos fluxos de CRUD, consulta da view de relatorio e geracao de PDF
- UI local do Jaeger em `http://localhost:16686`
- documentacao MkDocs para runbook e topologia

## Escalabilidade cloud-native

- a SPA pode ser servida por hosting estatico ou container leve
- a API pode escalar horizontalmente porque o estado e externo ao processo
- o banco continua como dependencia stateful gerenciada separadamente
- a view do relatorio reduz custo de agregacao na camada web

## Releases

O fluxo de release e publicacao de imagens roda apos merge na `main`. O detalhamento de versionamento, tags e Docker Hub esta em `docs/release.md`.
