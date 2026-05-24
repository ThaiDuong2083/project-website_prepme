# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /workspace

# Cache Gradle wrapper & dependencies before copying source
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Pre-download dependencies (layer caching trick)
RUN chmod +x ./gradlew && ./gradlew dependencies --no-daemon --quiet || true

# Copy source
COPY src src

# Build without tests
RUN ./gradlew bootJar --no-daemon -x test

# Extract layers for faster image rebuilds (Spring Boot layertools)
RUN java -Djarmode=layertools \
    -jar build/libs/*.jar extract --destination /workspace/extracted

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime (minimal JRE image)
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy Spring Boot layers (ordered from least to most frequently changed)
COPY --from=builder --chown=appuser:appgroup /workspace/extracted/dependencies          ./
COPY --from=builder --chown=appuser:appgroup /workspace/extracted/spring-boot-loader    ./
COPY --from=builder --chown=appuser:appgroup /workspace/extracted/snapshot-dependencies ./
COPY --from=builder --chown=appuser:appgroup /workspace/extracted/application           ./

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:+OptimizeStringConcat", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", \
    "org.springframework.boot.loader.launch.JarLauncher"]
