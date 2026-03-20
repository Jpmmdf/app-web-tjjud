package br.com.tjjud.catalog.shared.util;

import java.util.regex.Pattern;

public final class TextNormalizer {

    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private TextNormalizer() {
    }

    public static String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        return WHITESPACE.matcher(trimmed).replaceAll(" ");
    }
}
