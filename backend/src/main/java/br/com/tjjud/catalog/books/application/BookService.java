package br.com.tjjud.catalog.books.application;

import br.com.tjjud.catalog.authors.domain.Author;
import br.com.tjjud.catalog.authors.infra.persistence.AuthorRepository;
import br.com.tjjud.catalog.books.api.BookResponse;
import br.com.tjjud.catalog.books.api.BookUpsertRequest;
import br.com.tjjud.catalog.books.domain.Book;
import br.com.tjjud.catalog.books.infra.persistence.BookRepository;
import br.com.tjjud.catalog.shared.api.PageMetadata;
import br.com.tjjud.catalog.shared.api.PageResponse;
import br.com.tjjud.catalog.shared.api.SortDirection;
import br.com.tjjud.catalog.shared.api.SortFactory;
import br.com.tjjud.catalog.shared.exception.BusinessValidationException;
import br.com.tjjud.catalog.shared.exception.ConflictException;
import br.com.tjjud.catalog.shared.exception.ResourceNotFoundException;
import br.com.tjjud.catalog.shared.util.MoneyMapper;
import br.com.tjjud.catalog.subjects.domain.Subject;
import br.com.tjjud.catalog.subjects.infra.persistence.SubjectRepository;
import io.micrometer.observation.annotation.Observed;
import jakarta.transaction.Transactional;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@Observed(name = "catalog.books", contextualName = "catalog-books-service")
public class BookService {
    private static final Map<String, String> SORT_FIELDS = Map.of(
            "title", "title",
            "publicationYear", "publicationYear",
            "price", "price",
            "id", "id");

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final SubjectRepository subjectRepository;

    public BookService(BookRepository bookRepository, AuthorRepository authorRepository, SubjectRepository subjectRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.subjectRepository = subjectRepository;
    }

    public PageResponse<BookResponse> list(
            String title, Long authorId, Long subjectId, int page, int size, String sortField, SortDirection sortDirection) {
        PageRequest pageRequest = PageRequest.of(page, size, SortFactory.from(sortField, sortDirection, SORT_FIELDS));
        String sanitizedTitle = sanitize(title);
        Page<Long> pageIds = bookRepository.findPageIds(sanitizedTitle, authorId, subjectId, pageRequest);
        List<BookResponse> items = pageIds.isEmpty() ? List.of() : hydrateBooks(pageIds.getContent()).stream()
                .map(BookResponse::from)
                .toList();
        Page<BookResponse> responsePage = new PageImpl<>(items, pageRequest, pageIds.getTotalElements());
        return new PageResponse<>(
                responsePage.getContent(),
                new PageMetadata(
                        responsePage.getNumber(),
                        responsePage.getSize(),
                        responsePage.getTotalElements(),
                        responsePage.getTotalPages()));
    }

    public BookResponse get(Long bookId) {
        return BookResponse.from(findEntity(bookId));
    }

    @Transactional
    public BookResponse create(BookUpsertRequest request) {
        Book book = new Book();
        applyRequest(book, request);
        return BookResponse.from(bookRepository.save(book));
    }

    @Transactional
    public BookResponse update(Long bookId, BookUpsertRequest request) {
        Book book = findEntity(bookId);
        applyRequest(book, request);
        return BookResponse.from(bookRepository.save(book));
    }

    @Transactional
    public void delete(Long bookId) {
        Book book = findEntity(bookId);
        bookRepository.delete(book);
        bookRepository.flush();
    }

    private Book findEntity(Long bookId) {
        return bookRepository.findDetailedById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("resource.livro", bookId));
    }

    private List<Book> hydrateBooks(Collection<Long> ids) {
        List<Book> books = bookRepository.findDetailedByIds(ids);
        Map<Long, Book> byId = new LinkedHashMap<>();
        books.forEach(book -> byId.put(book.getId(), book));
        return ids.stream().map(byId::get).toList();
    }

    private void applyRequest(Book book, BookUpsertRequest request) {
        String title = sanitizeRequired(request.title(), "error.livro.titulo.vazio");
        String publisher = sanitizeRequired(request.publisher(), "error.livro.editora.vazia");
        List<Long> authorIds = request.authorIds() == null ? List.of() : request.authorIds();
        List<Long> subjectIds = request.subjectIds() == null ? List.of() : request.subjectIds();

        Set<Long> uniqueAuthorIds = toUniqueSet(authorIds, "AUTHOR_IDS_DUPLICATED", "error.livro.autores.duplicados");
        Set<Long> uniqueSubjectIds =
                toUniqueSet(subjectIds, "SUBJECT_IDS_DUPLICATED", "error.livro.assuntos.duplicados");

        Set<Author> authors = resolveAuthors(uniqueAuthorIds);
        Set<Subject> subjects = resolveSubjects(uniqueSubjectIds);
        ensureUniqueBook(title, publisher, request.edition(), request.publicationYear(), book.getId());

        book.update(
                title,
                publisher,
                request.edition(),
                request.publicationYear(),
                MoneyMapper.parse(request.price()));
        book.replaceAuthors(authors);
        book.replaceSubjects(subjects);
    }

    private Set<Author> resolveAuthors(Set<Long> authorIds) {
        List<Author> authors = authorRepository.findAllById(authorIds);
        if (authors.size() != authorIds.size()) {
            Long missingId = authorIds.stream()
                    .filter(authorId -> authors.stream().noneMatch(author -> author.getId().equals(authorId)))
                    .findFirst()
                    .orElseThrow();
            throw new ResourceNotFoundException("resource.autor", missingId);
        }
        return new LinkedHashSet<>(authors);
    }

    private Set<Subject> resolveSubjects(Set<Long> subjectIds) {
        List<Subject> subjects = subjectRepository.findAllById(subjectIds);
        if (subjects.size() != subjectIds.size()) {
            Long missingId = subjectIds.stream()
                    .filter(subjectId -> subjects.stream().noneMatch(subject -> subject.getId().equals(subjectId)))
                    .findFirst()
                    .orElseThrow();
            throw new ResourceNotFoundException("resource.assunto", missingId);
        }
        return new LinkedHashSet<>(subjects);
    }

    private Set<Long> toUniqueSet(List<Long> ids, String code, String messageKey) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessValidationException(code, messageKey);
        }
        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>(ids);
        if (uniqueIds.size() != ids.size()) {
            throw new BusinessValidationException(code, messageKey);
        }
        return uniqueIds;
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }
        String sanitized = value.trim();
        return sanitized;
    }

    private String sanitizeRequired(String value, String messageKey) {
        String sanitized = sanitize(value);
        if (sanitized.isBlank()) {
            throw new BusinessValidationException("INVALID_TEXT_FIELD", messageKey);
        }
        return sanitized;
    }

    private void ensureUniqueBook(String title, String publisher, Integer edition, Integer publicationYear, Long currentId) {
        boolean alreadyExists = currentId == null
                ? bookRepository.existsByTitleIgnoreCaseAndPublisherIgnoreCaseAndEditionAndPublicationYear(
                        title, publisher, edition, publicationYear)
                : bookRepository.existsByTitleIgnoreCaseAndPublisherIgnoreCaseAndEditionAndPublicationYearAndIdNot(
                        title, publisher, edition, publicationYear, currentId);
        if (alreadyExists) {
            throw new ConflictException("error.livro.duplicado");
        }
    }
}
