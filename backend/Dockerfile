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

# Install unzip using microdnf (for minimal Amazon Linux images)
RUN microdnf install -y unzip && microdnf clean all

# Copy and extract the Spring Boot JAR
COPY --from=build /app/target/gametracker-0.0.1-SNAPSHOT.jar ${LAMBDA_TASK_ROOT}/app.jar
RUN cd ${LAMBDA_TASK_ROOT} && \
    unzip -q app.jar && \
    rm app.jar && \
    cp -r BOOT-INF/lib/* lib/ && \
    cp -r BOOT-INF/classes/* . && \
    rm -rf BOOT-INF META-INF org

# Set the handler
CMD ["com.alice.gametracker.StreamLambdaHandler::handleRequest"]
