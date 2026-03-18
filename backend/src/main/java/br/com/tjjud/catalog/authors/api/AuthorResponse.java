package br.com.tjjud.catalog.authors.api;

import br.com.tjjud.catalog.authors.domain.Author;

public record AuthorResponse(Long id, String name) {

    public static AuthorResponse from(Author author) {
        return new AuthorResponse(author.getId(), author.getName());
    }
}
