package br.com.tjjud.catalog.books.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record BookUpsertRequest(
        @NotBlank(message = "{validation.livro.titulo.obrigatorio}")
        @Size(max = 40, message = "{validation.livro.titulo.tamanho}")
        String title,
        @NotBlank(message = "{validation.livro.editora.obrigatoria}")
        @Size(max = 40, message = "{validation.livro.editora.tamanho}")
        String publisher,
        @NotNull(message = "{validation.livro.edicao.obrigatoria}")
        @Min(value = 1, message = "{validation.livro.edicao.minimo}")
        Integer edition,
        @NotNull(message = "{validation.livro.ano-publicacao.obrigatorio}")
        @Min(value = 1000, message = "{validation.livro.ano-publicacao.formato}")
        @Max(value = 9999, message = "{validation.livro.ano-publicacao.formato}")
        Integer publicationYear,
        @NotBlank(message = "{validation.livro.valor.obrigatorio}")
        @Pattern(regexp = "^\\d{1,10}\\.\\d{2}$", message = "{validation.livro.valor.formato}")
        String price,
        @NotEmpty(message = "{validation.livro.autores.obrigatorios}")
        List<Long> authorIds,
        @NotEmpty(message = "{validation.livro.assuntos.obrigatorios}")
        List<Long> subjectIds) {
}
