package br.com.tjjud.catalog.books.domain;

import br.com.tjjud.catalog.authors.domain.Author;
import br.com.tjjud.catalog.shared.domain.BaseEntity;
import br.com.tjjud.catalog.subjects.domain.Subject;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "livro")
public class Book extends BaseEntity {

    @Column(name = "titulo", nullable = false, length = 40)
    private String title;

    @Column(name = "editora", nullable = false, length = 40)
    private String publisher;

    @Column(name = "edicao", nullable = false)
    private Integer edition;

    @Column(name = "ano_publicacao", nullable = false)
    private Integer publicationYear;

    @Column(name = "valor", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "livro_autor",
            joinColumns = @JoinColumn(name = "livro_id"),
            inverseJoinColumns = @JoinColumn(name = "autor_id"))
    private Set<Author> authors = new LinkedHashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "livro_assunto",
            joinColumns = @JoinColumn(name = "livro_id"),
            inverseJoinColumns = @JoinColumn(name = "assunto_id"))
    private Set<Subject> subjects = new LinkedHashSet<>();

    public String getTitle() {
        return title;
    }

    public String getPublisher() {
        return publisher;
    }

    public Integer getEdition() {
        return edition;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Set<Author> getAuthors() {
        return authors;
    }

    public Set<Subject> getSubjects() {
        return subjects;
    }

    public void update(String title, String publisher, Integer edition, Integer publicationYear, BigDecimal price) {
        this.title = title;
        this.publisher = publisher;
        this.edition = edition;
        this.publicationYear = publicationYear;
        this.price = price;
    }

    public void replaceAuthors(Set<Author> authors) {
        this.authors.clear();
        this.authors.addAll(authors);
    }

    public void replaceSubjects(Set<Subject> subjects) {
        this.subjects.clear();
        this.subjects.addAll(subjects);
    }
}
