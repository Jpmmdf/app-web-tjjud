package br.com.tjjud.catalog.subjects.api;

import br.com.tjjud.catalog.subjects.domain.Subject;

public record SubjectResponse(Long id, String description) {

    public static SubjectResponse from(Subject subject) {
        return new SubjectResponse(subject.getId(), subject.getDescription());
    }
}
