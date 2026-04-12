# ── Stage 1: Build ──────────────────────────────────────────────────────────
# Use official Maven + Java 21 image — no need to download Maven at build time
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml first and download dependencies (cached layer — speeds up rebuilds)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Run ────────────────────────────────────────────────────────────
# Use slim JRE-only image for production (smaller, more secure)
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy only the built JAR from the build stage
COPY --from=build /app/target/male-neuro-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
