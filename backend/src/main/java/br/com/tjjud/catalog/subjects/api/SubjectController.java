package br.com.tjjud.catalog.subjects.api;

import br.com.tjjud.catalog.shared.api.PageResponse;
import br.com.tjjud.catalog.shared.api.SortDirection;
import br.com.tjjud.catalog.subjects.application.SubjectService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public PageResponse<SubjectResponse> list(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "description") String sortField,
            @RequestParam(defaultValue = "ASC") SortDirection sortDirection) {
        return subjectService.list(q, page, size, sortField, sortDirection);
    }

    @GetMapping("/{subjectId}")
    public SubjectResponse get(@PathVariable Long subjectId) {
        return subjectService.get(subjectId);
    }

    @PostMapping
    public ResponseEntity<SubjectResponse> create(@Valid @RequestBody SubjectUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.create(request));
    }

    @PutMapping("/{subjectId}")
    public SubjectResponse update(@PathVariable Long subjectId, @Valid @RequestBody SubjectUpsertRequest request) {
        return subjectService.update(subjectId, request);
    }

    @DeleteMapping("/{subjectId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long subjectId) {
        subjectService.delete(subjectId);
    }
}
