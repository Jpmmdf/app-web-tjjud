# Quickstart: Cadastro de Livros

## Prerequisites

- Java 21
- Maven 3.9.14+
- Node.js 24 LTS
- npm 11+
- Docker e Docker Compose

## 1. Subir infraestrutura local

1. Criar um `docker-compose.yml` com PostgreSQL 16 expondo a porta `5432`.
2. Definir um banco local, por exemplo `tjjud_catalog`.
3. Configurar usuario e senha de desenvolvimento em `.env` ou `application-local.yml`.

## 2. Estruturar backend

1. Criar o projeto em `backend/` com Spring Boot.
2. Adicionar dependencias de Web, Validation, Data JPA, Flyway, PostgreSQL, Actuator, springdoc-openapi, OpenTelemetry, OpenPDF e mecanismo de mensagens via i18n/properties.
3. Configurar profile local apontando para o PostgreSQL do Docker e exportador OpenTelemetry compativel com o ambiente.
4. Criar migrations iniciais para tabelas, constraints, indices e `vw_relatorio_livros_por_autor`.
5. Implementar endpoints conforme [openapi.yaml](./contracts/openapi.yaml), com mensagens em portugues externalizadas.

## 3. Estruturar frontend

1. Criar o projeto em `frontend/` com Angular.
2. Adotar o Design System do gov.br no frontend como referencia principal de componentes, navegacao, formularios e acessibilidade visual.
3. Usar Bootstrap apenas quando necessario para suporte estrutural compativel com o padrao do gov.br.
4. Configurar roteamento para `livros`, `autores`, `assuntos` e `relatorios`.
5. Implementar um componente ou diretiva de moeda BRL reutilizavel para o campo `valor`.
6. Integrar o frontend aos endpoints do contrato REST, centralizar mensagens e rotulos em portugues e evitar estruturas visuais paralelas que conflitem com o Design System do gov.br.

## 4. Fluxo minimo de validacao

1. Cadastrar pelo menos dois autores.
2. Cadastrar pelo menos dois assuntos.
3. Cadastrar um livro com dois autores, dois assuntos e valor em reais com mascara.
4. Editar o livro e confirmar persistencia dos relacionamentos.
5. Confirmar que mensagens de validacao e feedback aparecem em portugues.
6. Gerar o relatorio por autor em JSON e PDF.
7. Verificar emissao de telemetria compativel com OpenTelemetry para pelo menos uma operacao principal.
8. Verificar que navegacao, formularios e feedbacks principais seguem o padrao visual e de interacao do Design System do gov.br.

## 5. Testes esperados

### Backend

- `./mvnw test`
- testes de integracao com PostgreSQL via Testcontainers
- testes de contrato para os endpoints principais
- smoke test para mensagens em portugues e telemetria OpenTelemetry nas rotas principais

### Frontend

- `npm test`
- `npm run e2e`

## 6. Script de demonstracao tecnica

1. Subir banco local.
2. Executar migrations.
3. Subir backend.
4. Subir frontend.
5. Demonstrar CRUD de autores, assuntos e livros.
6. Demonstrar valor monetario com mascara.
7. Demonstrar mensagens e validacoes em portugues.
8. Demonstrar relatorio agrupado por autor baseado na view do banco.
9. Demonstrar observabilidade minima via OpenTelemetry.
10. Demonstrar os testes automatizados mais relevantes.
