package br.com.tjjud.catalog.subjects.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubjectUpsertRequest(
        @NotBlank(message = "{validation.assunto.descricao.obrigatoria}")
        @Size(max = 20, message = "{validation.assunto.descricao.tamanho}")
        String description) {
}
