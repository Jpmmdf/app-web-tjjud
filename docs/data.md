# Dados

## Tabelas principais

### `autor`

- `id`
- `nome`

### `assunto`

- `id`
- `descricao`

### `livro`

- `id`
- `titulo`
- `editora`
- `edicao`
- `ano_publicacao`
- `valor`

### Associacoes

- `livro_autor`
- `livro_assunto`

Cada tabela associativa usa chave primaria composta e indices reversos para consultas por autor e por assunto.

## View de relatorio

`vw_relatorio_livros_por_autor` materializa a leitura logica do relatorio agrupado por autor.

Ela serve dois caminhos:

- retorno JSON para analise em tela
- exportacao PDF no backend

## Boas praticas aplicadas

- integridade referencial via foreign keys
- modelagem normalizada para relacionamento muitos-para-muitos
- `NUMERIC(12,2)` para valor monetario
- migrations versionadas com Flyway
- sem dependencia de `ddl-auto` para criacao de schema
