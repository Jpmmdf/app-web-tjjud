package br.com.tjjud.catalog.shared.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import br.com.tjjud.catalog.shared.exception.BusinessValidationException;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class MoneyMapperTest {

    @Test
    void shouldParseCanonicalDecimal() {
        assertEquals(new BigDecimal("129.90"), MoneyMapper.parse("129.90"));
    }

    @Test
    void shouldRejectNegativeValue() {
        assertThrows(BusinessValidationException.class, () -> MoneyMapper.parse("-1.00"));
    }
}
