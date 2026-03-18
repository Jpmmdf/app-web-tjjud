package br.com.tjjud.catalog.subjects.domain;

import br.com.tjjud.catalog.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "assunto")
public class Subject extends BaseEntity {

    @Column(name = "descricao", nullable = false, length = 20)
    private String description;

    public Subject() {
    }

    public Subject(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public void changeDescription(String description) {
        this.description = description;
    }
}
