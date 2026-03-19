package br.com.tjjud.catalog.shared.api;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
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
                .info(new Info()
                        .title("Catálogo editorial API")
                        .description("API para gerenciar autores, assuntos, livros e relatórios do catálogo editorial."))
                .servers(List.of(new Server()
                        .url("http://localhost:" + serverPort)
                        .description("Servidor local da API")));
    }
}
