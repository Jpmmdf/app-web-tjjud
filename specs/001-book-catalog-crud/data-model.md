# Data Model: Cadastro de Livros

## Overview

O modelo preserva as entidades `Livro`, `Autor` e `Assunto` do enunciado, mantendo relacionamentos muitos-para-muitos por tabelas associativas e adicionando o campo monetario obrigatorio ao livro. A modelagem aplica boas praticas de integridade, tipagem e desempenho sem alterar o comportamento funcional esperado.

## Entities

### Livro

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| id | BIGINT | yes | PK, identity |
| titulo | VARCHAR(40) | yes | nao vazio, trim, max 40 |
| editora | VARCHAR(40) | yes | nao vazio, trim, max 40 |
| edicao | INTEGER | yes | inteiro positivo |
| ano_publicacao | SMALLINT | yes | entre 1000 e 9999 |
| valor | NUMERIC(12,2) | yes | maior ou igual a 0 |
| created_at | TIMESTAMP WITH TIME ZONE | yes | auditoria |
| updated_at | TIMESTAMP WITH TIME ZONE | yes | auditoria |

**Notes**

- O modelo original informava `AnoPublicacao` como `VARCHAR(4)`. A implementacao armazenara o valor como `SMALLINT` para reforcar validacao e ordenacao, mantendo o mesmo significado funcional.
- O valor do livro sera apresentado em reais na UI e persistido com precisao decimal fixa.

### Autor

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| id | BIGINT | yes | PK, identity |
| nome | VARCHAR(40) | yes | nao vazio, trim, max 40 |
| created_at | TIMESTAMP WITH TIME ZONE | yes | auditoria |
| updated_at | TIMESTAMP WITH TIME ZONE | yes | auditoria |

### Assunto

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| id | BIGINT | yes | PK, identity |
| descricao | VARCHAR(20) | yes | nao vazio, trim, max 20 |
| created_at | TIMESTAMP WITH TIME ZONE | yes | auditoria |
| updated_at | TIMESTAMP WITH TIME ZONE | yes | auditoria |

### LivroAutor

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| livro_id | BIGINT | yes | FK para livro(id) |
| autor_id | BIGINT | yes | FK para autor(id) |

**Constraints**

- PK composta (`livro_id`, `autor_id`)
- `ON DELETE RESTRICT` para impedir exclusao silenciosa de autores/livros relacionados
- indice secundario em `autor_id` para relatorio e consulta reversa

### LivroAssunto

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| livro_id | BIGINT | yes | FK para livro(id) |
| assunto_id | BIGINT | yes | FK para assunto(id) |

**Constraints**

- PK composta (`livro_id`, `assunto_id`)
- `ON DELETE RESTRICT`
- indice secundario em `assunto_id`

## Relationships

- Um `Livro` deve possuir um ou mais `Autor`.
- Um `Livro` deve possuir um ou mais `Assunto`.
- Um `Autor` pode estar associado a muitos `Livro`.
- Um `Assunto` pode estar associado a muitos `Livro`.

## Derived Read Model

### vw_relatorio_livros_por_autor

View de leitura responsavel por consolidar os dados usados no relatorio agrupado por autor.

| Column | Type | Source |
|--------|------|--------|
| autor_id | BIGINT | autor.id |
| autor_nome | VARCHAR(40) | autor.nome |
| livro_id | BIGINT | livro.id |
| livro_titulo | VARCHAR(40) | livro.titulo |
| editora | VARCHAR(40) | livro.editora |
| edicao | INTEGER | livro.edicao |
| ano_publicacao | SMALLINT | livro.ano_publicacao |
| valor | NUMERIC(12,2) | livro.valor |
| assunto_id | BIGINT | assunto.id |
| assunto_descricao | VARCHAR(20) | assunto.descricao |

## Validation Rules

- Nomes e descricoes sao salvos com `trim`.
- O backend rejeita livro sem autores ou sem assuntos.
- O backend rejeita IDs inexistentes ao criar ou atualizar relacionamentos.
- O backend rejeita repeticao do mesmo autor ou assunto no mesmo livro antes de chegar ao banco.
- O banco reforca unicidade nas tabelas associativas por meio da PK composta.
- O backend devolve mensagens especificas para:
  - validacao de campos obrigatorios
  - formato invalido de valor
  - ano de publicacao invalido
  - tentativa de exclusao com relacionamento ativo

## Indexing Strategy

- `idx_livro_titulo` para busca por titulo
- `idx_autor_nome` para listagem/busca de autores
- `idx_assunto_descricao` para listagem/busca de assuntos
- `idx_livro_autor_autor_id` para o relatorio por autor
- `idx_livro_assunto_assunto_id` para consultas por assunto

## Mapping To API

- `valor` sera serializado na API como string decimal canonica, por exemplo `129.90`.
- A UI exibira `R$ 129,90`, mas o backend nunca dependera da formatacao visual.
- Os endpoints de livro aceitarao arrays de IDs para autores e assuntos, enquanto as respostas detalhadas retornarao os objetos resumidos relacionados.
