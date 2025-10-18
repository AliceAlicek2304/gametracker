# Stage 1: Build with Maven
FROM public.ecr.aws/docker/library/maven:3.9-amazoncorretto-21 AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the shaded (uber) JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: AWS Lambda runtime
FROM public.ecr.aws/lambda/java:21

RUN mkdir -p ${LAMBDA_TASK_ROOT}/lib
COPY --from=build /app/target/*-aws.jar ${LAMBDA_TASK_ROOT}/app.jar
COPY --from=build /app/target/*.jar ${LAMBDA_TASK_ROOT}/app.jar

# Set working directory (optional)
WORKDIR ${LAMBDA_TASK_ROOT}

# Lambda handler
CMD ["com.alice.gametracker.StreamLambdaHandler::handleRequest"]
