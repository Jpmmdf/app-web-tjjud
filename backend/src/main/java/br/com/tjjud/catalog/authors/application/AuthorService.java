package br.com.tjjud.catalog.authors.application;

import br.com.tjjud.catalog.authors.api.AuthorResponse;
import br.com.tjjud.catalog.authors.api.AuthorUpsertRequest;
import br.com.tjjud.catalog.authors.domain.Author;
import br.com.tjjud.catalog.authors.infra.persistence.AuthorRepository;
import br.com.tjjud.catalog.shared.api.PageResponse;
import br.com.tjjud.catalog.shared.api.SortDirection;
import br.com.tjjud.catalog.shared.api.SortFactory;
import br.com.tjjud.catalog.shared.exception.BusinessValidationException;
import br.com.tjjud.catalog.shared.exception.ConflictException;
import br.com.tjjud.catalog.shared.exception.ResourceNotFoundException;
import br.com.tjjud.catalog.shared.util.TextNormalizer;
import io.micrometer.observation.annotation.Observed;
import jakarta.transaction.Transactional;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@Observed(name = "catalog.authors", contextualName = "catalog-authors-service")
public class AuthorService {
    private static final Map<String, String> SORT_FIELDS = Map.of(
            "name", "name",
            "id", "id");

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    public PageResponse<AuthorResponse> list(String query, int page, int size, String sortField, SortDirection sortDirection) {
        PageRequest pageRequest = PageRequest.of(page, size, SortFactory.from(sortField, sortDirection, SORT_FIELDS));
        String sanitized = sanitize(query);
        Page<Author> results = sanitized == null
                ? authorRepository.findAll(pageRequest)
                : authorRepository.findByNameContainingIgnoreCase(sanitized, pageRequest);
        return PageResponse.from(results.map(AuthorResponse::from));
    }

    public AuthorResponse get(Long authorId) {
        return AuthorResponse.from(findEntity(authorId));
    }

    @Transactional
    public AuthorResponse create(AuthorUpsertRequest request) {
        String name = sanitizeRequired(request.name());
        ensureUniqueName(name, null);
        Author author = new Author(name);
        return AuthorResponse.from(authorRepository.save(author));
    }

    @Transactional
    public AuthorResponse update(Long authorId, AuthorUpsertRequest request) {
        Author author = findEntity(authorId);
        String name = sanitizeRequired(request.name());
        ensureUniqueName(name, authorId);
        author.changeName(name);
        return AuthorResponse.from(authorRepository.save(author));
    }

    @Transactional
    public void delete(Long authorId) {
        Author author = findEntity(authorId);
        try {
            authorRepository.delete(author);
            authorRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("error.autor.exclusao.vinculado");
        }
    }

    private Author findEntity(Long authorId) {
        return authorRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("resource.autor", authorId));
    }

    private String sanitize(String value) {
        return TextNormalizer.normalize(value);
    }

    private String sanitizeRequired(String value) {
        String sanitized = sanitize(value);
        if (sanitized == null) {
            throw new BusinessValidationException("INVALID_TEXT_FIELD", "error.autor.nome.vazio");
        }
        return sanitized;
    }

    private void ensureUniqueName(String name, Long currentId) {
        boolean alreadyExists = currentId == null
                ? authorRepository.existsByNameIgnoreCase(name)
                : authorRepository.existsByNameIgnoreCaseAndIdNot(name, currentId);
        if (alreadyExists) {
            throw new ConflictException("error.autor.duplicado", name);
        }
    }
}
