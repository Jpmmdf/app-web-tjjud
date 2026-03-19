package br.com.tjjud.catalog.reports.infra.pdf;

import br.com.tjjud.catalog.reports.api.AuthorBookReportResponse;
import br.com.tjjud.catalog.reports.api.ReportAuthorGroup;
import br.com.tjjud.catalog.reports.api.ReportBookItem;
import br.com.tjjud.catalog.shared.api.reference.SubjectSummary;
import br.com.tjjud.catalog.shared.i18n.ApplicationMessages;
import io.micrometer.observation.annotation.Observed;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.openpdf.text.Chunk;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.Rectangle;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

@Component
@Observed(name = "catalog.reports.pdf", contextualName = "catalog-report-pdf-renderer")
public class AuthorBookReportPdfRenderer {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final DateTimeFormatter TIMESTAMP_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss", PT_BR);
    private static final Color BRAND = new Color(19, 81, 180);
    private static final Color BRAND_SOFT = new Color(219, 232, 251);
    private static final Color SURFACE_ALT = new Color(245, 247, 250);
    private static final Color BORDER = new Color(208, 215, 222);
    private static final Color TEXT_MUTED = new Color(80, 80, 80);
    private final ApplicationMessages messages;

    public AuthorBookReportPdfRenderer(ApplicationMessages messages) {
        this.messages = messages;
    }

    public byte[] render(AuthorBookReportResponse report) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate(), 36f, 36f, 42f, 42f);
            PdfWriter.getInstance(document, outputStream);
            document.addTitle(messages.get("report.titulo"));
            document.open();

            addDocumentHeader(document, report);
            addSummary(document, report);

            if (report.authors().isEmpty()) {
                document.add(createEmptyState());
            } else {
                for (ReportAuthorGroup author : report.authors()) {
                    addAuthorSection(document, author);
                }
            }

            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException ex) {
            throw new IllegalStateException(messages.get("error.report.pdf.geracao"), ex);
        }
    }

    private void addDocumentHeader(Document document, AuthorBookReportResponse report) throws DocumentException {
        Paragraph title = new Paragraph(messages.get("report.titulo"), titleFont());
        title.setSpacingAfter(4f);
        document.add(title);

        Paragraph subtitle = new Paragraph(messages.get("report.subtitulo"), bodyMutedFont());
        subtitle.setSpacingAfter(8f);
        document.add(subtitle);

        Paragraph generatedAt = new Paragraph(
                messages.get("report.gerado-em", formatTimestamp(report.generatedAt())), bodyFont());
        generatedAt.setSpacingAfter(16f);
        document.add(generatedAt);
    }

    private void addSummary(Document document, AuthorBookReportResponse report) throws DocumentException {
        PdfPTable summary = new PdfPTable(new float[] {1f, 1f, 1.4f});
        summary.setWidthPercentage(100);
        summary.setSpacingAfter(18f);
        summary.addCell(createMetricCell(
                messages.get("report.resumo.autores"), String.valueOf(report.authors().size())));
        summary.addCell(createMetricCell(
                messages.get("report.resumo.livros"), String.valueOf(totalBooks(report))));
        summary.addCell(createMetricCell(
                messages.get("report.resumo.gerado-em"), formatTimestamp(report.generatedAt())));
        document.add(summary);
    }

    private Paragraph createEmptyState() {
        Paragraph emptyState = new Paragraph(messages.get("report.vazio"), bodyFont());
        emptyState.setSpacingBefore(6f);
        emptyState.setSpacingAfter(6f);
        return emptyState;
    }

    private void addAuthorSection(Document document, ReportAuthorGroup author) throws DocumentException {
        PdfPTable sectionHeader = new PdfPTable(new float[] {4f, 1.3f});
        sectionHeader.setWidthPercentage(100);
        sectionHeader.setSpacingBefore(6f);
        sectionHeader.setSpacingAfter(8f);
        sectionHeader.addCell(createSectionTitleCell(author.authorName()));
        sectionHeader.addCell(createSectionCountCell(messages.get("report.secao.autor.livros", author.books().size())));
        document.add(sectionHeader);

        PdfPTable table = new PdfPTable(new float[] {3.2f, 3.4f, 1.5f, 3.3f});
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitLate(false);
        addHeaderCell(table, messages.get("report.coluna.livro"));
        addHeaderCell(table, messages.get("report.coluna.detalhes"));
        addHeaderCell(table, messages.get("report.coluna.valor"));
        addHeaderCell(table, messages.get("report.coluna.assuntos"));

        for (int index = 0; index < author.books().size(); index++) {
            ReportBookItem book = author.books().get(index);
            Color background = index % 2 == 0 ? Color.WHITE : SURFACE_ALT;
            table.addCell(createBodyCell(book.title(), bodyStrongFont(), background, Element.ALIGN_LEFT));
            table.addCell(createDetailsCell(book, background));
            table.addCell(createBodyCell(formatCurrency(book.price()), bodyStrongFont(), background, Element.ALIGN_RIGHT));
            table.addCell(createSubjectsCell(book.subjects(), background));
        }

        document.add(table);
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, labelFont()));
        cell.setBackgroundColor(BRAND_SOFT);
        cell.setBorderColor(BORDER);
        cell.setPadding(8f);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(cell);
    }

    private PdfPCell createMetricCell(String label, String value) {
        Paragraph content = new Paragraph();
        content.setLeading(0f, 1.2f);
        content.add(new Phrase(label + "\n", labelFont()));
        content.add(new Phrase(value, metricValueFont()));

        PdfPCell cell = new PdfPCell(content);
        cell.setBorderColor(BORDER);
        cell.setBackgroundColor(SURFACE_ALT);
        cell.setPadding(10f);
        return cell;
    }

    private PdfPCell createSectionTitleCell(String authorName) {
        PdfPCell cell = new PdfPCell(new Phrase(authorName, sectionTitleFont()));
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(BORDER);
        cell.setPaddingBottom(8f);
        cell.setPaddingTop(2f);
        cell.setPaddingLeft(0f);
        cell.setPaddingRight(0f);
        return cell;
    }

    private PdfPCell createSectionCountCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, badgeFont()));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(Color.WHITE);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(BORDER);
        cell.setPaddingBottom(8f);
        cell.setPaddingTop(2f);
        cell.setPaddingLeft(0f);
        cell.setPaddingRight(0f);
        return cell;
    }

    private PdfPCell createDetailsCell(ReportBookItem book, Color background) {
        Paragraph details = new Paragraph();
        details.setLeading(0f, 1.2f);
        details.add(new Phrase(messages.get("report.detalhe.editora", book.publisher()), bodyFont()));
        details.add(Chunk.NEWLINE);
        details.add(new Phrase(messages.get("report.detalhe.edicao", book.edition()), bodyFont()));
        details.add(Chunk.NEWLINE);
        details.add(new Phrase(messages.get("report.detalhe.ano", book.publicationYear()), bodyFont()));
        return createParagraphCell(details, background, Element.ALIGN_LEFT);
    }

    private PdfPCell createSubjectsCell(Iterable<SubjectSummary> subjects, Color background) {
        Paragraph content = new Paragraph();
        content.setLeading(0f, 1.2f);
        boolean hasSubjects = false;
        for (SubjectSummary subject : subjects) {
            if (hasSubjects) {
                content.add(Chunk.NEWLINE);
            }
            content.add(new Phrase(subject.description(), bodyFont()));
            hasSubjects = true;
        }
        if (!hasSubjects) {
            content.add(new Phrase(messages.get("report.assuntos.vazio"), bodyMutedFont()));
        }
        return createParagraphCell(content, background, Element.ALIGN_LEFT);
    }

    private PdfPCell createBodyCell(String value, Font font, Color background, int horizontalAlignment) {
        return createParagraphCell(new Paragraph(value, font), background, horizontalAlignment);
    }

    private PdfPCell createParagraphCell(Paragraph content, Color background, int horizontalAlignment) {
        PdfPCell cell = new PdfPCell(content);
        cell.setBackgroundColor(background);
        cell.setBorderColor(BORDER);
        cell.setPadding(8f);
        cell.setHorizontalAlignment(horizontalAlignment);
        cell.setVerticalAlignment(Element.ALIGN_TOP);
        return cell;
    }

    private int totalBooks(AuthorBookReportResponse report) {
        return report.authors().stream().mapToInt(author -> author.books().size()).sum();
    }

    private String formatCurrency(String canonicalPrice) {
        return NumberFormat.getCurrencyInstance(PT_BR).format(new BigDecimal(canonicalPrice));
    }

    private String formatTimestamp(OffsetDateTime timestamp) {
        return timestamp.format(TIMESTAMP_FORMATTER);
    }

    private Font titleFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.NORMAL, BRAND);
    }

    private Font sectionTitleFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Font.NORMAL, BRAND);
    }

    private Font labelFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, TEXT_MUTED);
    }

    private Font metricValueFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Font.NORMAL, BRAND);
    }

    private Font bodyFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, Color.BLACK);
    }

    private Font bodyStrongFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, Color.BLACK);
    }

    private Font bodyMutedFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, TEXT_MUTED);
    }

    private Font badgeFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, BRAND);
    }
}
