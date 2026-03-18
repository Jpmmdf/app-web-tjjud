package br.com.tjjud.catalog.books.api;

import br.com.tjjud.catalog.authors.domain.Author;
import br.com.tjjud.catalog.books.domain.Book;
import br.com.tjjud.catalog.shared.api.reference.AuthorSummary;
import br.com.tjjud.catalog.shared.api.reference.SubjectSummary;
import br.com.tjjud.catalog.shared.util.MoneyMapper;
import br.com.tjjud.catalog.subjects.domain.Subject;
import java.util.Comparator;
import java.util.List;

public record BookResponse(
        Long id,
        String title,
        String publisher,
        Integer edition,
        Integer publicationYear,
        String price,
        List<AuthorSummary> authors,
        List<SubjectSummary> subjects) {

    public static BookResponse from(Book book) {
        List<AuthorSummary> authors = book.getAuthors().stream()
                .sorted(Comparator.comparing(Author::getName))
                .map(author -> new AuthorSummary(author.getId(), author.getName()))
                .toList();

        List<SubjectSummary> subjects = book.getSubjects().stream()
                .sorted(Comparator.comparing(Subject::getDescription))
                .map(subject -> new SubjectSummary(subject.getId(), subject.getDescription()))
                .toList();

        return new BookResponse(
                book.getId(),
                book.getTitle(),
                book.getPublisher(),
                book.getEdition(),
                book.getPublicationYear(),
                MoneyMapper.format(book.getPrice()),
                authors,
                subjects);
    }
}
