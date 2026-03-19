package br.com.tjjud.catalog.reports.api;

import br.com.tjjud.catalog.reports.application.ReportService;
import br.com.tjjud.catalog.shared.api.SortDirection;
import br.com.tjjud.catalog.shared.i18n.ApplicationMessages;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/reports/books-by-author")
public class ReportController {

    private final ReportService reportService;
    private final ApplicationMessages messages;

    public ReportController(ReportService reportService, ApplicationMessages messages) {
        this.reportService = reportService;
        this.messages = messages;
    }

    @GetMapping
    public PagedAuthorBookReportResponse get(
            @RequestParam(required = false) Long authorId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "authorName") String sortField,
            @RequestParam(defaultValue = "ASC") SortDirection sortDirection) {
        return reportService.getBooksByAuthor(authorId, page, size, sortField, sortDirection);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam(required = false) Long authorId) {
        byte[] content = reportService.exportBooksByAuthor(authorId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(messages.get("report.arquivo.nome"))
                        .build()
                        .toString())
                .body(content);
    }
}
