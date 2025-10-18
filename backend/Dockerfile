# Multi-stage build for AWS Lambda with Spring Boot
FROM public.ecr.aws/docker/library/maven:3.9-amazoncorretto-21 AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Final stage - AWS Lambda Java Runtime
FROM public.ecr.aws/lambda/java:21

# Install unzip
RUN microdnf install -y unzip && microdnf clean all

# Copy and extract Spring Boot JAR
COPY --from=build /app/target/gametracker-0.0.1-SNAPSHOT.jar ${LAMBDA_TASK_ROOT}/app.jar

# Extract the Spring Boot JAR properly for Lambda
WORKDIR ${LAMBDA_TASK_ROOT}
RUN unzip -q app.jar && \
    rm app.jar && \
    # Copy dependencies from BOOT-INF/lib to Lambda's lib directory
    cp -r BOOT-INF/lib/* lib/ && \
    # Copy application classes to root
    cp -r BOOT-INF/classes/* . && \
    # Remove Spring Boot loader classes but keep META-INF
    rm -rf BOOT-INF org

# Set the handler
CMD ["com.alice.gametracker.StreamLambdaHandler::handleRequest"]
