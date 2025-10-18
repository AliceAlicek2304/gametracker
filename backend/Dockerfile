# Stage 1: Build with Maven
FROM public.ecr.aws/docker/library/maven:3.9-amazoncorretto-21 AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the shaded (uber) JAR
COPY src ./src
RUN mvn clean package -DskipTests && \
    echo "=== JARs created by Maven build ===" && \
    ls -lh /app/target/*.jar && \
    echo "=== Verifying shaded JAR contains handler ===" && \
    jar -tf /app/target/gametracker-0.0.1-SNAPSHOT-aws.jar | grep StreamLambdaHandler || \
    (echo "ERROR: Handler class not in shaded JAR!" && exit 1)

# Stage 2: AWS Lambda runtime
FROM public.ecr.aws/lambda/java:21

# Extract the shaded JAR directly into /var/task (Lambda classpath root)
# This puts all .class files and resources directly in the filesystem
COPY --from=build /app/target/gametracker-0.0.1-SNAPSHOT-aws.jar /tmp/app.jar
RUN cd ${LAMBDA_TASK_ROOT} && \
    jar -xf /tmp/app.jar && \
    rm /tmp/app.jar && \
    echo "✅ Extracted JAR contents to ${LAMBDA_TASK_ROOT}" && \
    echo "Checking for handler class..." && \
    ls -la ${LAMBDA_TASK_ROOT}/com/alice/gametracker/StreamLambdaHandler.class 2>/dev/null || \
    (echo "❌ ERROR: StreamLambdaHandler.class not found!" && exit 1)

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Lambda handler
CMD ["com.alice.gametracker.StreamLambdaHandler::handleRequest"]
