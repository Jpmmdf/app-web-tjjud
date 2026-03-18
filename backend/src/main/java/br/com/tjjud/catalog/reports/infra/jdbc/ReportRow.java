package br.com.tjjud.catalog.reports.infra.jdbc;

import java.math.BigDecimal;

public record ReportRow(
        Long authorId,
        String authorName,
        Long bookId,
        String title,
        String publisher,
        Integer edition,
        Integer publicationYear,
        BigDecimal price,
        Long subjectId,
        String subjectDescription) {
}
