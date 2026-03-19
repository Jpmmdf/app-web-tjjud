# Onboarding

## Pre-requisitos

- Java 21
- Node.js 24 LTS com npm 11
- Docker Desktop
- Python 3 com `pip`

## Passo a passo rapido

### 1. Validar backend

```bash
make backend-test
```

### 2. Validar frontend

```bash
make frontend-test
```

### 3. Subir o ambiente completo

```bash
docker compose up --build
```

### 4. Acessar a solucao

- frontend: `http://localhost:4200`
- swagger: `http://localhost:4200/swagger-ui/index.html`
- actuator: `http://localhost:8080/actuator/health`

## Fluxo minimo de demonstracao

1. cadastrar dois autores
2. cadastrar dois assuntos
3. cadastrar um livro com valor mascarado
4. filtrar o livro por autor ou assunto
5. abrir o relatorio e exportar o PDF

## Atualizar documentacao e diagramas

```bash
make diagrams
make docs-build
```
