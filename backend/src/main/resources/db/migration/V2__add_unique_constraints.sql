CREATE UNIQUE INDEX ux_autor_nome_ci ON autor (LOWER(nome));

CREATE UNIQUE INDEX ux_assunto_descricao_ci ON assunto (LOWER(descricao));

CREATE UNIQUE INDEX ux_livro_identidade_ci
    ON livro (LOWER(titulo), LOWER(editora), edicao, ano_publicacao);
