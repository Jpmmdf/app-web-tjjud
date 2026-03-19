package br.com.tjjud.catalog.shared.api;

public enum SortDirection {
    ASC,
    DESC;

    public boolean isAscending() {
        return this == ASC;
    }
}
