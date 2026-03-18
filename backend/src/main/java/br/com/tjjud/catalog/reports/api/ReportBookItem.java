package br.com.tjjud.catalog.reports.api;

import br.com.tjjud.catalog.shared.api.reference.SubjectSummary;
import java.util.List;

public record ReportBookItem(
        Long bookId,
        String title,
        String publisher,
        Integer edition,
        Integer publicationYear,
        String price,
        List<SubjectSummary> subjects) {
}
