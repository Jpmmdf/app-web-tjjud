# Catalogo Editorial TJJUD

Portal central da solucao API-first implementada para o desafio TJJUD.

## O que existe aqui

- backend `Spring Boot 4 / Java 21` com CRUD de autores, assuntos e livros
- frontend `Angular 21` com formularios reativos e mascara BRL para o campo de valor
- banco `PostgreSQL 16` com modelagem normalizada e view `vw_relatorio_livros_por_autor`
- exportacao PDF do relatorio por autor
- documentacao cloud-native e diagramas C4 gerados a partir de `Structurizr DSL`

## Como navegar

- **Arquitetura**: fronteiras do sistema, containers, componentes e topologia cloud-native
- **API**: endpoints, fluxos principais e pontos de observabilidade
- **Dados**: modelo relacional, tabelas associativas e view do relatorio
- **Operacao**: compose, health checks, configuracao externa e sinais de observabilidade
- **Release**: fluxo de versionamento, tags e publicacao das imagens Docker
- **Onboarding**: caminho minimo para subir o ambiente e validar a entrega

## Fluxo principal

1. Cadastrar autores.
2. Cadastrar assuntos.
3. Cadastrar livros associando pelo menos um autor e um assunto.
4. Consultar o relatorio agrupado por autor.
5. Exportar o PDF do relatorio.

## Criterio de atualizacao

Sempre que houver mudanca relevante de arquitetura, contrato, runtime ou topologia:

1. atualizar o `Structurizr DSL` em `docs/architecture/structurizr/workspace.dsl`
2. executar `make diagrams`
3. revisar as paginas de arquitetura, operacao e onboarding
4. validar o portal com `make docs-build`
