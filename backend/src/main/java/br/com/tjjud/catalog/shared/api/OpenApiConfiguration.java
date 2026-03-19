package br.com.tjjud.catalog.shared.api;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

    @Bean
    OpenAPI catalogOpenApi(@Value("${server.port:8080}") String serverPort) {
        return new OpenAPI()
                .servers(List.of(new Server().url("http://localhost:" + serverPort)));
    }
}
