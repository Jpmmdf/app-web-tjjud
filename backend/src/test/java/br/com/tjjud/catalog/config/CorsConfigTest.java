package br.com.tjjud.catalog.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class CorsConfigTest {

    @Test
    void shouldAllowLocalhostOriginsOutsideProd() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("dev");

        assertDoesNotThrow(() -> new CorsConfig("http://localhost:4200,https://front-demo.pavim.com.br", environment));
    }

    @Test
    void shouldRejectLocalhostOriginsInProd() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");

        assertThrows(
                IllegalStateException.class,
                () -> new CorsConfig("http://localhost:4200,https://front-demo.pavim.com.br", environment));
    }
}
