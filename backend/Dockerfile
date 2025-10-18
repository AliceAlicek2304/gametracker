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

# Copy the built JAR
COPY --from=build /app/target/gametracker-0.0.1-SNAPSHOT.jar ${LAMBDA_TASK_ROOT}/lib/

# Set the handler
CMD ["com.alice.gametracker.StreamLambdaHandler::handleRequest"]
