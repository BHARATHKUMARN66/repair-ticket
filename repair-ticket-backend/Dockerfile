# ===================================================================
# Multi-Stage Dockerfile for OmniFix Repair Ticket Backend
# ===================================================================

# -------------------------------------------------------------------
# Stage 1: Build the Application
# -------------------------------------------------------------------
FROM eclipse-temurin:26-jdk AS build
WORKDIR /app

# Copy Maven wrapper files and pom.xml first to optimize Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Grant execution rights to the Maven wrapper
RUN chmod +x mvnw

# Download dependencies offline (cache layer)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build the executable JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# -------------------------------------------------------------------
# Stage 2: Minimal Runtime Environment
# -------------------------------------------------------------------
FROM eclipse-temurin:26-jre
WORKDIR /app

# Copy packaged JAR from build stage
COPY --from=build /app/target/repair-ticket-*.jar app.jar

# Render injects the PORT environment variable dynamically (defaults to 8082 locally)
ENV PORT=8082
EXPOSE 8082

# JVM flags optimized for container memory constraints on Render (MaxRAMPercentage 75%)
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -jar app.jar"]
