package br.com.tjjud.catalog.shared.api;

public record PageMetadata(int page, int size, long totalElements, int totalPages) {
}
