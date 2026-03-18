package br.com.tjjud.catalog.reports.api;

import java.util.List;

public record ReportAuthorGroup(Long authorId, String authorName, List<ReportBookItem> books) {
}
