package com.alice.gametracker;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import com.amazonaws.serverless.exceptions.ContainerInitializationException;
import com.amazonaws.serverless.proxy.model.AwsProxyRequest;
import com.amazonaws.serverless.proxy.model.AwsProxyResponse;
import com.amazonaws.serverless.proxy.spring.SpringBootLambdaContainerHandler;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class StreamLambdaHandler implements RequestStreamHandler {
    private static SpringBootLambdaContainerHandler<AwsProxyRequest, AwsProxyResponse> handler;
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    static {
        try {
            handler = SpringBootLambdaContainerHandler.getAwsProxyHandler(GametrackerApplication.class);
        } catch (ContainerInitializationException e) {
            throw new RuntimeException("Could not initialize Spring Boot application", e);
        }
    }

    @Override
    public void handleRequest(InputStream input, OutputStream output, Context context) throws IOException {
        // Check if this is an EventBridge warmer event
        byte[] inputBytes = input.readAllBytes();
        String inputString = new String(inputBytes, StandardCharsets.UTF_8);
        
        try {
            JsonNode jsonNode = objectMapper.readTree(inputString);
            
            // EventBridge events have "source" field
            if (jsonNode.has("source") && jsonNode.get("source").asText().equals("aws.events")) {
                // This is a warmer event, return success without processing
                String response = "{\"statusCode\": 200, \"body\": \"Warmed\"}";
                output.write(response.getBytes(StandardCharsets.UTF_8));
                return;
            }
        } catch (Exception e) {
            // If JSON parsing fails, continue with normal processing
        }
        
        // Normal API Gateway request
        handler.proxyStream(new java.io.ByteArrayInputStream(inputBytes), output, context);
    }
}
