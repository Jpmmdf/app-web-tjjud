package br.com.tjjud.catalog.shared.api;

import java.util.List;

public record ProblemResponse(
        String type,
        String title,
        int status,
        String detail,
        String instance,
        List<ValidationError> errors) {
}
