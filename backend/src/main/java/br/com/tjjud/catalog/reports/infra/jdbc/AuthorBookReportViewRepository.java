package br.com.tjjud.catalog.reports.infra.jdbc;

import io.micrometer.observation.annotation.Observed;
import java.util.List;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@Observed(name = "catalog.reports.view", contextualName = "catalog-report-view-repository")
public class AuthorBookReportViewRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AuthorBookReportViewRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ReportRow> findRows(Long authorId) {
        String sql;
        MapSqlParameterSource params = new MapSqlParameterSource();
        if (authorId == null) {
            sql = """
                    select autor_id, autor_nome, livro_id, livro_titulo, editora, edicao, ano_publicacao, valor, assunto_id, assunto_descricao
                    from vw_relatorio_livros_por_autor
                    order by autor_nome, livro_titulo, assunto_descricao
                    """;
        } else {
            sql = """
                    select autor_id, autor_nome, livro_id, livro_titulo, editora, edicao, ano_publicacao, valor, assunto_id, assunto_descricao
                    from vw_relatorio_livros_por_autor
                    where autor_id = :authorId
                    order by autor_nome, livro_titulo, assunto_descricao
                    """;
            params.addValue("authorId", authorId);
        }

        return jdbcTemplate.query(sql, params, (resultSet, rowNum) -> new ReportRow(
                resultSet.getLong("autor_id"),
                resultSet.getString("autor_nome"),
                resultSet.getLong("livro_id"),
                resultSet.getString("livro_titulo"),
                resultSet.getString("editora"),
                resultSet.getInt("edicao"),
                resultSet.getInt("ano_publicacao"),
                resultSet.getBigDecimal("valor"),
                resultSet.getLong("assunto_id"),
                resultSet.getString("assunto_descricao")));
    }
}
