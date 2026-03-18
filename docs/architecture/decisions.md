# Decisoes Arquiteturais

## ADR-001: API-first como regra do projeto

O contrato REST e a primeira referencia de integracao. Backend e frontend sao implementados a partir dele.

**Motivacao**

- reduzir divergencia entre times e camadas
- manter a UI desacoplada das entidades JPA
- permitir validacao objetiva por Swagger UI e `/api-docs`

## ADR-002: Valor monetario em decimal canonico

O campo `price` trafega como string decimal canonica na API e vira `BigDecimal` no backend.

**Motivacao**

- evitar erro de ponto flutuante
- preservar coerencia entre UI, API e banco
- permitir mascara BRL sem alterar o contrato

## ADR-003: Relatorio por autor apoiado em view de banco

A view `vw_relatorio_livros_por_autor` consolida as linhas do relatorio e simplifica o consumo pelo backend.

**Motivacao**

- manter a logica de agregacao perto dos dados
- reduzir repeticao de joins complexos na aplicacao
- facilitar validacao do relatorio em JSON e PDF

## ADR-004: Entrega cloud-native por containers

O runtime alvo foi descrito como containers independentes para SPA, API e banco, com health checks e roteamento por borda.

**Motivacao**

- aproximar a entrega de um ambiente de producao
- permitir escalabilidade e observabilidade por container
- simplificar demonstracao local com `docker compose`
