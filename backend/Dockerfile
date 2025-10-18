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

RUN mkdir -p ${LAMBDA_TASK_ROOT}/lib
# Copy all built jars to a temp directory, then select the shaded (-aws) jar if present,
# otherwise pick the largest jar as a sensible fallback. This prevents a fallback COPY
# from overwriting a correct shaded jar.
RUN mkdir -p ${LAMBDA_TASK_ROOT}/jars
COPY --from=build /app/target/*.jar ${LAMBDA_TASK_ROOT}/jars/

# Choose the -aws jar if exists, otherwise choose the largest jar
RUN set -e; \
	if ls ${LAMBDA_TASK_ROOT}/jars/*-aws.jar 1>/dev/null 2>&1; then \
		chosen=$(ls -1 ${LAMBDA_TASK_ROOT}/jars/*-aws.jar | head -n 1); \
	else \
		chosen=$(ls -1S ${LAMBDA_TASK_ROOT}/jars/*.jar | head -n 1); \
	fi; \
	echo "Selected jar: $chosen"; \
	mv "$chosen" ${LAMBDA_TASK_ROOT}/app.jar; \
	rm -rf ${LAMBDA_TASK_ROOT}/jars

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Lambda handler
CMD ["com.alice.gametracker.StreamLambdaHandler::handleRequest"]
