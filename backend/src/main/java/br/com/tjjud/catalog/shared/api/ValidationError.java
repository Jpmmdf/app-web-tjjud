package br.com.tjjud.catalog.shared.api;

public record ValidationError(String field, String code, String message) {
}
