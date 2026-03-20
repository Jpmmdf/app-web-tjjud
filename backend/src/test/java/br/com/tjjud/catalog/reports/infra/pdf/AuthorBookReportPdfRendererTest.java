package br.com.tjjud.catalog.reports.infra.pdf;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.com.tjjud.catalog.reports.api.AuthorBookReportResponse;
import br.com.tjjud.catalog.reports.api.ReportAuthorGroup;
import br.com.tjjud.catalog.reports.api.ReportBookItem;
import br.com.tjjud.catalog.shared.api.reference.SubjectSummary;
import br.com.tjjud.catalog.shared.i18n.ApplicationMessages;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openpdf.text.pdf.PdfReader;
import org.openpdf.text.pdf.parser.PdfTextExtractor;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ResourceBundleMessageSource;

class AuthorBookReportPdfRendererTest {

    @AfterEach
    void clearLocale() {
        LocaleContextHolder.resetLocaleContext();
    }

    @Test
    void shouldRenderStructuredPdfContent() throws Exception {
        LocaleContextHolder.setLocale(Locale.forLanguageTag("pt-BR"));
        AuthorBookReportPdfRenderer renderer = new AuthorBookReportPdfRenderer(applicationMessages());

        AuthorBookReportResponse report = new AuthorBookReportResponse(
                OffsetDateTime.parse("2026-03-19T14:30:00-03:00"),
                List.of(new ReportAuthorGroup(
                        1L,
                        "Machado de Assis",
                        List.of(
                                new ReportBookItem(
                                        10L,
                                        "Dom Casmurro",
                                        "Editora Exemplo",
                                        3,
                                        1899,
                                        "129.90",
                                        List.of(new SubjectSummary(1L, "Romance"), new SubjectSummary(2L, "Clássico"))),
                                new ReportBookItem(
                                        11L,
                                        "Memórias Póstumas",
                                        "Outra Editora",
                                        2,
                                        1881,
                                        "59.90",
                                        List.of())))));

        byte[] pdf = renderer.render(report);
        String extractedText = extractText(pdf);

        assertFalse(pdf.length == 0);
        assertTrue(extractedText.contains("Relatório de Livros por Autor"));
        assertTrue(extractedText.contains("Autores no relatório"));
        assertTrue(extractedText.contains("Livros no relatório"));
        assertTrue(extractedText.contains("Machado de Assis"));
        assertTrue(extractedText.contains("Dom Casmurro"));
        assertTrue(extractedText.contains("Detalhes editoriais"));
        assertTrue(extractedText.contains("Ano: 1899"));
        assertTrue(extractedText.contains("Ano: 1881"));
        assertFalse(extractedText.contains("Ano: 1.899"));
        assertFalse(extractedText.contains("Ano: 1.881"));
        assertTrue(extractedText.contains("Sem assuntos associados"));
    }

    private ApplicationMessages applicationMessages() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("messages");
        messageSource.setDefaultEncoding("UTF-8");
        return new ApplicationMessages(messageSource);
    }

    private String extractText(byte[] pdf) throws IOException {
        try (PdfReader reader = new PdfReader(pdf)) {
            PdfTextExtractor extractor = new PdfTextExtractor(reader);
            StringBuilder content = new StringBuilder();
            for (int page = 1; page <= reader.getNumberOfPages(); page++) {
                content.append(extractor.getTextFromPage(page));
                content.append('\n');
            }
            return content.toString();
        }
    }
}
