package br.com.tjjud.catalog.reports.infra.pdf;

import br.com.tjjud.catalog.reports.api.AuthorBookReportResponse;
import br.com.tjjud.catalog.reports.api.ReportAuthorGroup;
import br.com.tjjud.catalog.reports.api.ReportBookItem;
import br.com.tjjud.catalog.shared.api.reference.SubjectSummary;
import br.com.tjjud.catalog.shared.i18n.ApplicationMessages;
import io.micrometer.observation.annotation.Observed;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;
import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

@Component
@Observed(name = "catalog.reports.pdf", contextualName = "catalog-report-pdf-renderer")
public class AuthorBookReportPdfRenderer {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private final ApplicationMessages messages;

    public AuthorBookReportPdfRenderer(ApplicationMessages messages) {
        this.messages = messages;
    }

    public byte[] render(AuthorBookReportResponse report) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, outputStream);
            document.open();

            document.add(new Paragraph(messages.get("report.titulo"), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
            document.add(new Paragraph(messages.get("report.gerado-em", report.generatedAt())));
            document.add(new Paragraph(" "));

            if (report.authors().isEmpty()) {
                document.add(new Paragraph(messages.get("report.vazio")));
            } else {
                for (ReportAuthorGroup author : report.authors()) {
                    document.add(new Paragraph(author.authorName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
                    document.add(new Paragraph(" "));
                    PdfPTable table = new PdfPTable(new float[] {4f, 3f, 1f, 1.4f, 1.8f, 4f});
                    table.setWidthPercentage(100);
                    addHeaderCell(table, messages.get("report.coluna.livro"));
                    addHeaderCell(table, messages.get("report.coluna.editora"));
                    addHeaderCell(table, messages.get("report.coluna.edicao"));
                    addHeaderCell(table, messages.get("report.coluna.ano"));
                    addHeaderCell(table, messages.get("report.coluna.valor"));
                    addHeaderCell(table, messages.get("report.coluna.assuntos"));

                    for (ReportBookItem book : author.books()) {
                        table.addCell(new Phrase(book.title()));
                        table.addCell(new Phrase(book.publisher()));
                        table.addCell(new Phrase(String.valueOf(book.edition())));
                        table.addCell(new Phrase(String.valueOf(book.publicationYear())));
                        table.addCell(new Phrase(formatCurrency(book.price())));
                        table.addCell(new Phrase(book.subjects().stream()
                                .map(SubjectSummary::description)
                                .reduce((left, right) -> left + ", " + right)
                                .orElse("")));
                    }

                    document.add(table);
                    document.add(new Paragraph(" "));
                }
            }

            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException ex) {
            throw new IllegalStateException(messages.get("error.report.pdf.geracao"), ex);
        }
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        table.addCell(cell);
    }

    private String formatCurrency(String canonicalPrice) {
        return NumberFormat.getCurrencyInstance(PT_BR).format(new BigDecimal(canonicalPrice));
    }
}
