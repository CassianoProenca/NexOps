# ── Stage 1: Build ──────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# ── Stage 2: Runtime ────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S nexops && adduser -S nexops -G nexops
COPY --from=build /app/target/*.jar app.jar
RUN chown nexops:nexops app.jar
USER nexops
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
