package br.com.tjjud.catalog.integration;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.tjjud.catalog.BackendApplication;
import br.com.tjjud.catalog.authors.api.AuthorUpsertRequest;
import br.com.tjjud.catalog.books.api.BookUpsertRequest;
import br.com.tjjud.catalog.subjects.api.SubjectUpsertRequest;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Testcontainers
@SpringBootTest(classes = BackendApplication.class)
@AutoConfigureMockMvc
@Sql(
        statements = "TRUNCATE TABLE livro_autor, livro_assunto, livro, autor, assunto RESTART IDENTITY CASCADE",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class CatalogApiIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("tjjud_catalog")
            .withUsername("tjjud")
            .withPassword("tjjud");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCreateUpdateAndDeleteAuthor() throws Exception {
        long authorId = createAuthor("Machado de Assis");

        mockMvc.perform(get("/api/v1/authors").param("q", "Machado"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.items[0].name").value("Machado de Assis"));

        mockMvc.perform(put("/api/v1/authors/{authorId}", authorId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new AuthorUpsertRequest("Clarice Lispector"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Clarice Lispector"));

        mockMvc.perform(delete("/api/v1/authors/{authorId}", authorId))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldCreateAndListSubjects() throws Exception {
        long subjectId = createSubject("Romance");

        mockMvc.perform(get("/api/v1/subjects").param("q", "Roma"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.items[0].id").value(subjectId))
                .andExpect(jsonPath("$.items[0].description").value("Romance"));
    }

    @Test
    void shouldRejectDuplicatedAuthor() throws Exception {
        createAuthor("Machado de Assis");

        mockMvc.perform(post("/api/v1/authors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new AuthorUpsertRequest("Machado de Assis"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Conflito"))
                .andExpect(jsonPath("$.detail").value("Já existe um autor cadastrado com o nome \"Machado de Assis\"."));
    }

    @Test
    void shouldNormalizeAuthorNameAndSearchQuery() throws Exception {
        mockMvc.perform(post("/api/v1/authors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new AuthorUpsertRequest("  Machado   de   Assis  "))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Machado de Assis"));

        mockMvc.perform(get("/api/v1/authors").param("q", "  Machado   de  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].name").value("Machado de Assis"));

        mockMvc.perform(post("/api/v1/authors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new AuthorUpsertRequest("Machado    de Assis"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Já existe um autor cadastrado com o nome \"Machado de Assis\"."));
    }

    @Test
    void shouldRejectDuplicatedSubject() throws Exception {
        createSubject("Romance");

        mockMvc.perform(post("/api/v1/subjects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new SubjectUpsertRequest("Romance"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Conflito"))
                .andExpect(jsonPath("$.detail").value("Já existe um assunto cadastrado com a descrição \"Romance\"."));
    }

    @Test
    void shouldNormalizeSubjectDescriptionAndSearchQuery() throws Exception {
        mockMvc.perform(post("/api/v1/subjects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new SubjectUpsertRequest("  Dados   abertos  "))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("Dados abertos"));

        mockMvc.perform(get("/api/v1/subjects").param("q", "  Dados   abertos "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].description").value("Dados abertos"));

        mockMvc.perform(post("/api/v1/subjects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new SubjectUpsertRequest("Dados    abertos"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail")
                        .value("Já existe um assunto cadastrado com a descrição \"Dados abertos\"."));
    }

    @Test
    void shouldCreateBookAndQueryDetails() throws Exception {
        long authorA = createAuthor("Machado de Assis");
        long authorB = createAuthor("Jose de Alencar");
        long subjectA = createSubject("Romance");
        long subjectB = createSubject("Classico");

        long bookId = createBook(new BookUpsertRequest(
                "Dom Casmurro",
                "Editora Exemplo",
                3,
                1899,
                "129.90",
                List.of(authorA, authorB),
                List.of(subjectA, subjectB)));

        mockMvc.perform(get("/api/v1/books/{bookId}", bookId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Dom Casmurro"))
                .andExpect(jsonPath("$.price").value("129.90"))
                .andExpect(jsonPath("$.authors", hasSize(2)))
                .andExpect(jsonPath("$.subjects", hasSize(2)));

        mockMvc.perform(get("/api/v1/books").param("authorId", String.valueOf(authorA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].id").value(bookId));
    }

    @Test
    void shouldRejectDuplicatedBook() throws Exception {
        long authorId = createAuthor("Machado de Assis");
        long subjectId = createSubject("Romance");
        BookUpsertRequest request = new BookUpsertRequest(
                "Dom Casmurro",
                "Editora Exemplo",
                3,
                1899,
                "129.90",
                List.of(authorId),
                List.of(subjectId));

        createBook(request);

        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Conflito"))
                .andExpect(jsonPath("$.detail")
                        .value("Já existe um livro cadastrado com a mesma combinação de título, editora, edição e ano de publicação."));
    }

    @Test
    void shouldNormalizeBookTextAndTitleFilter() throws Exception {
        long authorId = createAuthor("Machado de Assis");
        long subjectId = createSubject("Romance");

        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new BookUpsertRequest(
                                "  Dom   Casmurro  ",
                                "  Editora   Exemplo  ",
                                3,
                                1899,
                                "129.90",
                                List.of(authorId),
                                List.of(subjectId)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Dom Casmurro"))
                .andExpect(jsonPath("$.publisher").value("Editora Exemplo"));

        mockMvc.perform(get("/api/v1/books").param("title", " Dom   Casmurro "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].title").value("Dom Casmurro"))
                .andExpect(jsonPath("$.items[0].publisher").value("Editora Exemplo"));

        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new BookUpsertRequest(
                                "Dom    Casmurro",
                                "Editora    Exemplo",
                                3,
                                1899,
                                "129.90",
                                List.of(authorId),
                                List.of(subjectId)))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail")
                        .value("Já existe um livro cadastrado com a mesma combinação de título, editora, edição e ano de publicação."));
    }

    @Test
    void shouldRejectBookWithDuplicatedAuthors() throws Exception {
        long authorId = createAuthor("Machado de Assis");
        long subjectId = createSubject("Romance");

        mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new BookUpsertRequest(
                                "Livro Invalido",
                                "Editora",
                                1,
                                2024,
                                "10.00",
                                List.of(authorId, authorId),
                                List.of(subjectId)))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Falha de validação de negócio"))
                .andExpect(jsonPath("$.detail").value("Os autores informados não podem conter itens duplicados."));
    }

    @Test
    void shouldReturnPortugueseValidationMessages() throws Exception {
        mockMvc.perform(post("/api/v1/authors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new AuthorUpsertRequest(" "))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Falha de validação"))
                .andExpect(jsonPath("$.detail").value("Um ou mais campos da requisição são inválidos."))
                .andExpect(jsonPath("$.errors", hasSize(1)))
                .andExpect(jsonPath("$.errors[0].message").value("Informe o nome do autor."));
    }

    @Test
    void shouldBlockDeletingReferencedAuthorAndGenerateReport() throws Exception {
        long authorId = createAuthor("Machado de Assis");
        long subjectId = createSubject("Romance");
        createBook(new BookUpsertRequest(
                "Memorias Postumas",
                "Editora Exemplo",
                1,
                1881,
                "59.90",
                List.of(authorId),
                List.of(subjectId)));

        mockMvc.perform(delete("/api/v1/authors/{authorId}", authorId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail")
                        .value("O autor não pode ser excluído porque está vinculado a um ou mais livros."));

        mockMvc.perform(get("/api/v1/reports/books-by-author")
                        .param("sortField", "bookCount")
                        .param("sortDirection", "DESC")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.items[0].authorId").value(authorId))
                .andExpect(jsonPath("$.items[0].books", hasSize(1)))
                .andExpect(jsonPath("$.items[0].books[0].subjects", hasSize(1)));

        mockMvc.perform(get("/api/v1/reports/books-by-author/export"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("livros-por-autor.pdf")))
                .andExpect(result -> {
                    byte[] bytes = result.getResponse().getContentAsByteArray();
                    if (bytes.length == 0) {
                        throw new AssertionError("Expected PDF content");
                    }
                });
    }

    @Test
    void shouldBlockDeletingReferencedSubjectWithSpecificMessage() throws Exception {
        long authorId = createAuthor("Machado de Assis");
        long subjectId = createSubject("Romance");
        createBook(new BookUpsertRequest(
                "Memorias Postumas",
                "Editora Exemplo",
                1,
                1881,
                "59.90",
                List.of(authorId),
                List.of(subjectId)));

        mockMvc.perform(delete("/api/v1/subjects/{subjectId}", subjectId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail")
                        .value("O assunto não pode ser excluído porque está vinculado a um ou mais livros."));
    }

    @Test
    void shouldExposeOpenApiServerWithBackendPort() throws Exception {
        mockMvc.perform(get("/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Catálogo editorial API"))
                .andExpect(jsonPath("$.info.description")
                        .value("API para gerenciar autores, assuntos, livros e relatórios do catálogo editorial."))
                .andExpect(jsonPath("$.info.version").value("local"))
                .andExpect(jsonPath("$.servers[0].description").value("Servidor local da API"))
                .andExpect(jsonPath("$.servers[0].url").value("http://localhost:8080"));
    }

    private long createAuthor(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/authors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new AuthorUpsertRequest(name))))
                .andExpect(status().isCreated())
                .andReturn();
        return extractId(result);
    }

    private long createSubject(String description) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/subjects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(new SubjectUpsertRequest(description))))
                .andExpect(status().isCreated())
                .andReturn();
        return extractId(result);
    }

    private long createBook(BookUpsertRequest request) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isCreated())
                .andReturn();
        return extractId(result);
    }

    private long extractId(MvcResult result) throws Exception {
        JsonNode jsonNode = objectMapper.readTree(result.getResponse().getContentAsByteArray());
        return jsonNode.get("id").asLong();
    }
}
