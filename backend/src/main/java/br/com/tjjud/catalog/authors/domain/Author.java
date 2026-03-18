package br.com.tjjud.catalog.authors.domain;

import br.com.tjjud.catalog.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "autor")
public class Author extends BaseEntity {

    @Column(name = "nome", nullable = false, length = 40)
    private String name;

    public Author() {
    }

    public Author(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void changeName(String name) {
        this.name = name;
    }
}
