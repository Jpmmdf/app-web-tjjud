package br.com.tjjud.catalog.reports.api;

import java.time.OffsetDateTime;
import java.util.List;

public record AuthorBookReportResponse(OffsetDateTime generatedAt, List<ReportAuthorGroup> authors) {
}
