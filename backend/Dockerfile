FROM maven:3.9.14-eclipse-temurin-25 AS build
ARG APP_VERSION=local
WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY src src
RUN ./mvnw --batch-mode -DskipTests package

FROM eclipse-temurin:21-jre-alpine
ARG APP_VERSION=local
WORKDIR /app

RUN apk add --no-cache wget
LABEL org.opencontainers.image.version=$APP_VERSION
ENV APP_VERSION=$APP_VERSION

COPY --from=build /workspace/target/backend-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS:-} -jar /app/app.jar"]
