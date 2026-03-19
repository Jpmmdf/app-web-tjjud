package br.com.tjjud.catalog.subjects.application;

import br.com.tjjud.catalog.shared.api.PageResponse;
import br.com.tjjud.catalog.shared.api.SortDirection;
import br.com.tjjud.catalog.shared.api.SortFactory;
import br.com.tjjud.catalog.shared.exception.BusinessValidationException;
import br.com.tjjud.catalog.shared.exception.ConflictException;
import br.com.tjjud.catalog.shared.exception.ResourceNotFoundException;
import br.com.tjjud.catalog.subjects.api.SubjectResponse;
import br.com.tjjud.catalog.subjects.api.SubjectUpsertRequest;
import br.com.tjjud.catalog.subjects.domain.Subject;
import br.com.tjjud.catalog.subjects.infra.persistence.SubjectRepository;
import io.micrometer.observation.annotation.Observed;
import jakarta.transaction.Transactional;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@Observed(name = "catalog.subjects", contextualName = "catalog-subjects-service")
public class SubjectService {
    private static final Map<String, String> SORT_FIELDS = Map.of(
            "description", "description",
            "id", "id");

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public PageResponse<SubjectResponse> list(String query, int page, int size, String sortField, SortDirection sortDirection) {
        PageRequest pageRequest = PageRequest.of(page, size, SortFactory.from(sortField, sortDirection, SORT_FIELDS));
        String sanitized = sanitize(query);
        Page<Subject> results = sanitized == null
                ? subjectRepository.findAll(pageRequest)
                : subjectRepository.findByDescriptionContainingIgnoreCase(sanitized, pageRequest);
        return PageResponse.from(results.map(SubjectResponse::from));
    }

    public SubjectResponse get(Long subjectId) {
        return SubjectResponse.from(findEntity(subjectId));
    }

    @Transactional
    public SubjectResponse create(SubjectUpsertRequest request) {
        String description = sanitizeRequired(request.description());
        ensureUniqueDescription(description, null);
        Subject subject = new Subject(description);
        return SubjectResponse.from(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectResponse update(Long subjectId, SubjectUpsertRequest request) {
        Subject subject = findEntity(subjectId);
        String description = sanitizeRequired(request.description());
        ensureUniqueDescription(description, subjectId);
        subject.changeDescription(description);
        return SubjectResponse.from(subjectRepository.save(subject));
    }

    @Transactional
    public void delete(Long subjectId) {
        Subject subject = findEntity(subjectId);
        try {
            subjectRepository.delete(subject);
            subjectRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("error.assunto.exclusao.vinculado");
        }
    }

    private Subject findEntity(Long subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("resource.assunto", subjectId));
    }

    private String sanitize(String value) {
        if (value == null) {
            return null;
        }
        String sanitized = value.trim();
        return sanitized.isEmpty() ? null : sanitized;
    }

    private String sanitizeRequired(String value) {
        String sanitized = sanitize(value);
        if (sanitized == null) {
            throw new BusinessValidationException("INVALID_TEXT_FIELD", "error.assunto.descricao.vazia");
        }
        return sanitized;
    }

    private void ensureUniqueDescription(String description, Long currentId) {
        boolean alreadyExists = currentId == null
                ? subjectRepository.existsByDescriptionIgnoreCase(description)
                : subjectRepository.existsByDescriptionIgnoreCaseAndIdNot(description, currentId);
        if (alreadyExists) {
            throw new ConflictException("error.assunto.duplicado", description);
        }
    }
}
