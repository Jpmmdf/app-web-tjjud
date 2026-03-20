package br.com.tjjud.catalog.shared.util;

import br.com.tjjud.catalog.shared.exception.BusinessValidationException;
import java.math.BigDecimal;
import java.math.RoundingMode;

public final class MoneyMapper {

    private MoneyMapper() {
    }

    public static BigDecimal parse(String value) {
        try {
            String sanitized = value == null ? null : value.trim();
            BigDecimal parsed = new BigDecimal(sanitized).setScale(2, RoundingMode.UNNECESSARY);
            if (parsed.signum() < 0) {
                throw new BusinessValidationException("INVALID_PRICE", "error.valor.nao-negativo");
            }
            return parsed;
        } catch (RuntimeException ex) {
            if (ex instanceof BusinessValidationException businessValidationException) {
                throw businessValidationException;
            }
            throw new BusinessValidationException("INVALID_PRICE", "error.valor.formato-invalido");
        }
    }

    public static String format(BigDecimal value) {
        return value.setScale(2, RoundingMode.UNNECESSARY).toPlainString();
    }
}
