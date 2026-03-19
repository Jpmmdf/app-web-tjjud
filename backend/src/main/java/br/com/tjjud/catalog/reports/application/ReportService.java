package br.com.tjjud.catalog.reports.application;

import br.com.tjjud.catalog.reports.api.AuthorBookReportResponse;
import br.com.tjjud.catalog.reports.api.PagedAuthorBookReportResponse;
import br.com.tjjud.catalog.reports.api.ReportAuthorGroup;
import br.com.tjjud.catalog.reports.api.ReportBookItem;
import br.com.tjjud.catalog.reports.infra.jdbc.AuthorBookReportViewRepository;
import br.com.tjjud.catalog.reports.infra.jdbc.ReportRow;
import br.com.tjjud.catalog.reports.infra.pdf.AuthorBookReportPdfRenderer;
import br.com.tjjud.catalog.shared.api.PageMetadata;
import br.com.tjjud.catalog.shared.api.SortDirection;
import br.com.tjjud.catalog.shared.exception.BusinessValidationException;
import br.com.tjjud.catalog.shared.api.reference.SubjectSummary;
import br.com.tjjud.catalog.shared.util.MoneyMapper;
import io.micrometer.observation.annotation.Observed;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
@Observed(name = "catalog.reports", contextualName = "catalog-reports-service")
public class ReportService {

    private final AuthorBookReportViewRepository reportViewRepository;
    private final AuthorBookReportPdfRenderer pdfRenderer;

    public ReportService(AuthorBookReportViewRepository reportViewRepository, AuthorBookReportPdfRenderer pdfRenderer) {
        this.reportViewRepository = reportViewRepository;
        this.pdfRenderer = pdfRenderer;
    }

    public PagedAuthorBookReportResponse getBooksByAuthor(
            Long authorId, int page, int size, String sortField, SortDirection sortDirection) {
        List<ReportRow> rows = reportViewRepository.findRows(authorId);

        Map<Long, MutableAuthorGroup> authorGroups = new LinkedHashMap<>();
        for (ReportRow row : rows) {
            MutableAuthorGroup authorGroup = authorGroups.computeIfAbsent(
                    row.authorId(), ignored -> new MutableAuthorGroup(row.authorId(), row.authorName()));
            authorGroup.add(row);
        }

        List<ReportAuthorGroup> authors = authorGroups.values().stream()
                .map(MutableAuthorGroup::toImmutable)
                .sorted(authorGroupComparator(sortField, sortDirection))
                .toList();

        int sanitizedSize = Math.max(size, 1);
        int fromIndex = Math.min(page * sanitizedSize, authors.size());
        int toIndex = Math.min(fromIndex + sanitizedSize, authors.size());
        List<ReportAuthorGroup> pageItems = authors.subList(fromIndex, toIndex);
        int totalPages = authors.isEmpty() ? 0 : (int) Math.ceil((double) authors.size() / sanitizedSize);

        return new PagedAuthorBookReportResponse(
                OffsetDateTime.now(),
                pageItems,
                new PageMetadata(page, sanitizedSize, authors.size(), totalPages));
    }

    public byte[] exportBooksByAuthor(Long authorId) {
        PagedAuthorBookReportResponse pagedReport = getBooksByAuthor(authorId, 0, Integer.MAX_VALUE, "authorName", SortDirection.ASC);
        AuthorBookReportResponse report = new AuthorBookReportResponse(pagedReport.generatedAt(), pagedReport.items());
        return pdfRenderer.render(report);
    }

    private Comparator<ReportAuthorGroup> authorGroupComparator(String sortField, SortDirection sortDirection) {
        String normalizedField = sortField == null || sortField.isBlank() ? "authorName" : sortField;
        Comparator<ReportAuthorGroup> comparator = switch (normalizedField) {
            case "authorId" -> Comparator.comparing(ReportAuthorGroup::authorId);
            case "bookCount" -> Comparator.comparing(group -> group.books().size());
            case "authorName" -> Comparator.comparing(ReportAuthorGroup::authorName, String.CASE_INSENSITIVE_ORDER);
            default -> throw new BusinessValidationException("INVALID_SORT_FIELD", "error.ordenacao.campo.invalido");
        };
        Comparator<ReportAuthorGroup> withTieBreaker = comparator.thenComparing(ReportAuthorGroup::authorId);
        return sortDirection != null && sortDirection.isAscending() ? withTieBreaker : withTieBreaker.reversed();
    }

    private static final class MutableAuthorGroup {

        private final Long authorId;
        private final String authorName;
        private final Map<Long, MutableBookItem> books = new LinkedHashMap<>();

        private MutableAuthorGroup(Long authorId, String authorName) {
            this.authorId = authorId;
            this.authorName = authorName;
        }

        private void add(ReportRow row) {
            MutableBookItem book = books.computeIfAbsent(
                    row.bookId(),
                    ignored -> new MutableBookItem(
                            row.bookId(),
                            row.title(),
                            row.publisher(),
                            row.edition(),
                            row.publicationYear(),
                            MoneyMapper.format(row.price())));
            book.addSubject(row.subjectId(), row.subjectDescription());
        }

        private ReportAuthorGroup toImmutable() {
            return new ReportAuthorGroup(
                    authorId,
                    authorName,
                    books.values().stream().map(MutableBookItem::toImmutable).toList());
        }
    }

    private static final class MutableBookItem {

        private final Long bookId;
        private final String title;
        private final String publisher;
        private final Integer edition;
        private final Integer publicationYear;
        private final String price;
        private final Map<Long, SubjectSummary> subjects = new LinkedHashMap<>();

        private MutableBookItem(
                Long bookId, String title, String publisher, Integer edition, Integer publicationYear, String price) {
            this.bookId = bookId;
            this.title = title;
            this.publisher = publisher;
            this.edition = edition;
            this.publicationYear = publicationYear;
            this.price = price;
        }

        private void addSubject(Long subjectId, String description) {
            subjects.putIfAbsent(subjectId, new SubjectSummary(subjectId, description));
        }

        private ReportBookItem toImmutable() {
            return new ReportBookItem(bookId, title, publisher, edition, publicationYear, price, new ArrayList<>(subjects.values()));
        }
    }
}
