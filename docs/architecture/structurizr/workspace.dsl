workspace "TJJUD Editorial Platform" "Cloud-native model for the TJJUD editorial catalog solution." {
    model {
        operator = person "Operador de catalogo" "Mantem autores, assuntos, livros e exporta o relatorio."
        engineer = person "Equipe tecnica" "Evolui o produto, o contrato e a operacao."
        reviewer = person "Avaliador tecnico" "Revisa a entrega funcional, a arquitetura e a documentacao."

        platform = softwareSystem "Plataforma Editorial TJJUD" "Solucao API-first para catalogo editorial, relatorio por autor e documentacao cloud-native." {
            web = container "Catalog Web" "SPA administrativa para CRUD, filtros e exportacao PDF." "Angular 21 standalone + Nginx"
            api = container "Catalog API" "API REST, regras de negocio, validacoes, relatorio e PDF." "Spring Boot 4.0 / Java 21" {
                shared = component "Shared API Layer" "DTOs, tratador global de erros, validacoes e MoneyMapper."
                authors = component "Author Slice" "Controlador, servico e repositorio da entidade autor."
                subjects = component "Subject Slice" "Controlador, servico e repositorio da entidade assunto."
                books = component "Book Slice" "CRUD de livros, filtros e relacionamentos muitos-para-muitos."
                reports = component "Report Slice" "Consulta a view relacional e gera JSON/PDF do relatorio."
                persistence = component "Persistence Layer" "JPA, Flyway e acesso ao PostgreSQL."
            }
            database = container "Catalog Database" "Persistencia transacional, tabelas associativas e view vw_relatorio_livros_por_autor." "PostgreSQL 16" "Database"
            docs = container "Documentation Portal" "Portal tecnico para onboarding, arquitetura, API e operacao." "MkDocs"
        }

        telemetry = softwareSystem "Observability Stack" "Centraliza logs, metricas e health checks do runtime."

        operator -> web "Opera o catalogo e emite o relatorio PDF" "HTTPS"
        engineer -> docs "Mantem runbooks, decisoes e diagramas" "Browser"
        reviewer -> docs "Consulta onboarding e arquitetura" "Browser"
        web -> api "Consome CRUD e relatorios" "HTTPS/JSON"
        docs -> api "Referencia Swagger UI, OpenAPI e health endpoints" "HTTPS"
        api -> database "Persiste entidades e consulta a view do relatorio" "JDBC"
        api -> telemetry "Publica logs, metricas e probes" "Actuator / OpenTelemetry"

        web -> shared "Consome endpoints padronizados e erros estruturados" "JSON"
        shared -> authors "Encaminha operacoes de autores"
        shared -> subjects "Encaminha operacoes de assuntos"
        shared -> books "Encaminha operacoes de livros"
        shared -> reports "Encaminha operacoes de relatorio"
        authors -> persistence "Usa repositorios e entidades"
        subjects -> persistence "Usa repositorios e entidades"
        books -> persistence "Resolve autores, assuntos e livros"
        reports -> persistence "Le a view e monta o PDF"
        persistence -> database "Executa migrations e consultas" "SQL"

        deploymentEnvironment "Cloud Native" {
            deploymentNode "Edge Zone" {
                infrastructureNode "Managed Ingress" "Termina TLS, publica o portal e roteia /api."

                deploymentNode "Static Hosting" {
                    containerInstance web
                }

                deploymentNode "Docs Hosting" {
                    containerInstance docs
                }
            }

            deploymentNode "Application Zone" {
                deploymentNode "Container Runtime" {
                    containerInstance api
                }
            }

            deploymentNode "Data Zone" {
                containerInstance database
            }

            deploymentNode "Platform Services" {
                infrastructureNode "Observability Workspace" "Recebe sinais de health, logs e metricas."
            }
        }
    }

    views {
        systemLandscape "landscape" {
            include *
            autoLayout lr
        }

        container platform "containers" {
            include *
            autoLayout lr
        }

        component api "api-components" {
            include *
            autoLayout lr
        }

        deployment platform "Cloud Native" "cloud-native" {
            include *
            autoLayout lr
        }

        styles {
            element "Person" {
                background #114b5f
                color #ffffff
                shape person
            }

            element "Software System" {
                background #577590
                color #ffffff
            }

            element "Container" {
                background #43aa8b
                color #ffffff
            }

            element "Component" {
                background #f9844a
                color #ffffff
            }

            element "Database" {
                shape cylinder
                background #8f5d5d
                color #ffffff
            }

            relationship "Relationship" {
                color #2f3e46
            }
        }

        theme default
    }
}
