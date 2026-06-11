# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy the Maven wrapper and POM first for better layer caching
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Download dependencies (cached when pom.xml doesn't change)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build the fat JAR (skip tests — they run in CI)
COPY src ./src
RUN ./mvnw package -DskipTests -B

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S s3lite && adduser -S s3lite -G s3lite

# Copy the fat JAR from the build stage
COPY --from=builder /app/target/*.jar app.jar

# Create the storage volume mount point
RUN mkdir -p /app/s3-data && chown -R s3lite:s3lite /app

USER s3lite

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
