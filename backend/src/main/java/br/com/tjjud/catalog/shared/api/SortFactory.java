package br.com.tjjud.catalog.shared.api;

import br.com.tjjud.catalog.shared.exception.BusinessValidationException;
import java.util.Map;
import org.springframework.data.domain.Sort;

public final class SortFactory {

    private SortFactory() {
    }

    public static Sort from(String sortField, SortDirection sortDirection, Map<String, String> allowedFields) {
        String normalizedField = sortField == null || sortField.isBlank() ? null : sortField.trim();
        String targetField = normalizedField == null ? allowedFields.values().iterator().next() : allowedFields.get(normalizedField);
        if (targetField == null) {
            throw new BusinessValidationException("INVALID_SORT_FIELD", "error.ordenacao.campo.invalido");
        }

        Sort baseSort = sortDirection != null && sortDirection.isAscending()
                ? Sort.by(targetField).ascending()
                : Sort.by(targetField).descending();
        return baseSort.and(Sort.by("id").ascending());
    }
}
