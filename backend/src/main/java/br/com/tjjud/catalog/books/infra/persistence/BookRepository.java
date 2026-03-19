package br.com.tjjud.catalog.books.infra.persistence;

import br.com.tjjud.catalog.books.domain.Book;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long> {

    boolean existsByTitleIgnoreCaseAndPublisherIgnoreCaseAndEditionAndPublicationYear(
            String title, String publisher, Integer edition, Integer publicationYear);

    boolean existsByTitleIgnoreCaseAndPublisherIgnoreCaseAndEditionAndPublicationYearAndIdNot(
            String title, String publisher, Integer edition, Integer publicationYear, Long id);

    @Query(
            value = """
                    select b.id
                    from Book b
                    left join b.authors a
                    left join b.subjects s
                    where (:title = '' or upper(b.title) like concat('%', upper(:title), '%'))
                      and (:authorId is null or a.id = :authorId)
                      and (:subjectId is null or s.id = :subjectId)
                    group by b.id, b.title
                    """,
            countQuery = """
                    select count(distinct b.id)
                    from Book b
                    left join b.authors a
                    left join b.subjects s
                    where (:title = '' or upper(b.title) like concat('%', upper(:title), '%'))
                      and (:authorId is null or a.id = :authorId)
                      and (:subjectId is null or s.id = :subjectId)
                    """)
    Page<Long> findPageIds(
            @Param("title") String title,
            @Param("authorId") Long authorId,
            @Param("subjectId") Long subjectId,
            Pageable pageable);

    @EntityGraph(attributePaths = {"authors", "subjects"})
    @Query("select b from Book b where b.id = :id")
    Optional<Book> findDetailedById(@Param("id") Long id);

    @Query("select distinct b from Book b left join fetch b.authors left join fetch b.subjects where b.id in :ids")
    List<Book> findDetailedByIds(@Param("ids") Collection<Long> ids);
}
