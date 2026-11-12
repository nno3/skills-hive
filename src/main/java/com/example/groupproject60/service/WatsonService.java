package com.example.groupproject60.service;

import com.ibm.watson.assistant.v2.Assistant;
import com.ibm.watson.assistant.v2.model.MessageInput;
import com.ibm.watson.assistant.v2.model.MessageOptions;
import com.ibm.watson.assistant.v2.model.MessageResponse;
import com.ibm.watson.assistant.v2.model.RuntimeResponseGeneric;
import com.ibm.cloud.sdk.core.security.IamAuthenticator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.util.List;

@Service
public class WatsonService {
    private static final Logger logger = LoggerFactory.getLogger(WatsonService.class);

    private Assistant assistant;

    @Value("${watson.assistant.api.key}")
    private String apiKey;

    @Value("${watson.assistant.url}")
    private String url;

    @Value("${watson.assistant.assistant.id}")
    private String assistantId;

    @PostConstruct
    public void init() {
        try {
            logger.info("Initializing Watson Assistant service with API Key: {}", apiKey);
            IamAuthenticator authenticator = new IamAuthenticator.Builder()
                    .apikey(apiKey)
                    .build();
            assistant = new Assistant("2021-06-14", authenticator);
            assistant.setServiceUrl(url);
            logger.info("Watson Assistant service initialized successfully.");
        } catch (Exception e) {
            logger.error("Error initializing Watson Assistant service: ", e);
        }
    }

    public String sendMessage(String userMessage) {
        try {
            logger.info("Sending message to Watson Assistant: {}", userMessage);

            // Create MessageInput using the builder pattern
            MessageInput input = new MessageInput.Builder()
                    .messageType("text") // Specify the message type
                    .text(userMessage)   // Set the user's message
                    .build();
            logger.debug("MessageInput created: {}", input);

            // Create MessageOptions using the builder pattern
            MessageOptions options = new MessageOptions.Builder()
                    .assistantId(assistantId) // Set the assistant ID
                    .input(input)             // Set the input message
                    .build();
            logger.debug("MessageOptions created: {}", options);

            // Send the message to Watson Assistant
            logger.info("Calling Watson Assistant API...");
            MessageResponse response = assistant.message(options).execute().getResult();
            logger.info("Received response from Watson Assistant: {}", response);

            // Extract the first generic response and get its text
            List<RuntimeResponseGeneric> responses = response.getOutput().getGeneric();
            if (responses != null && !responses.isEmpty()) {
                RuntimeResponseGeneric firstResponse = responses.get(0);
                if (firstResponse != null && firstResponse.text() != null) {
                    logger.info("Response text: {}", firstResponse.text());
                    return firstResponse.text();
                }
            }
            logger.warn("No response received from Watson Assistant.");
            return "No response from Watson Assistant.";
        } catch (Exception e) {
            logger.error("Error communicating with Watson Assistant: ", e);
            return "Error communicating with Watson Assistant: " + e.getMessage();
        }
    }
}