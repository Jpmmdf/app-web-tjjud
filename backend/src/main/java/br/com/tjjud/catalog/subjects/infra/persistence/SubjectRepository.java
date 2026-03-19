package br.com.tjjud.catalog.subjects.infra.persistence;

import br.com.tjjud.catalog.subjects.domain.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Page<Subject> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);

    boolean existsByDescriptionIgnoreCase(String description);

    boolean existsByDescriptionIgnoreCaseAndIdNot(String description, Long id);
}
