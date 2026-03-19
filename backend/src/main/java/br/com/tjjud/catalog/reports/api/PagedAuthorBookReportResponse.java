package br.com.tjjud.catalog.reports.api;

import br.com.tjjud.catalog.shared.api.PageMetadata;
import java.time.OffsetDateTime;
import java.util.List;

public record PagedAuthorBookReportResponse(OffsetDateTime generatedAt, List<ReportAuthorGroup> items, PageMetadata page) {
}
