package br.com.tjjud.catalog.authors.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthorUpsertRequest(
        @NotBlank(message = "{validation.autor.nome.obrigatorio}")
        @Size(max = 40, message = "{validation.autor.nome.tamanho}")
        String name) {
}
