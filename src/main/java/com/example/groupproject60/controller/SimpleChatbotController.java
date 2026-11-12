package com.example.groupproject60.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.groupproject60.service.SimpleChatbotService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/simple-chatbot")
public class SimpleChatbotController {

    private static final Logger logger = LoggerFactory.getLogger(SimpleChatbotController.class);

    private final SimpleChatbotService chatbotService;

    @Autowired
    public SimpleChatbotController(SimpleChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> handleMessage(@RequestBody Map<String, String> request) {
        try {
            // Log incoming message
            logger.info("Received chatbot message request");

            // Validate request format
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                logger.warn("Invalid chatbot request: message field is missing or empty");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message field is required and cannot be empty");
            }

            // Process message
            logger.debug("Processing message: {}", message);
            String response = chatbotService.processMessage(message);

            // Create response map
            Map<String, String> responseMap = new HashMap<>();

            // Check for special marker patterns
            if (response.startsWith("##course_recommendation##")) {
                // Extract the actual response without the marker
                String actualResponse = response.replace("##course_recommendation##", "");
                responseMap.put("response", actualResponse);
                responseMap.put("special", "course_recommendation");
                logger.info("Processed course recommendation request");
            }
            else if (response.startsWith("##show_bookmarks##")) {
                // Extract the actual response without the marker
                String actualResponse = response.replace("##show_bookmarks##", "");
                responseMap.put("response", actualResponse);
                responseMap.put("special", "show_bookmarks");
                logger.info("Processed bookmarks request");
            }
            else {
                responseMap.put("response", response);
                logger.info("Successfully processed regular chatbot message");
            }

            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            // Handle any errors
            logger.error("Error processing chatbot message", e);

            // Don't expose internal error details to user
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("response", "I'm sorry, I couldn't process your request at the moment. Please try again later.");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/questions")
    public ResponseEntity<Map<String, Object>> getAllQuestions() {
        Map<String, Object> response = new HashMap<>();
        response.put("questions", chatbotService.getAllQuestions());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-question")
    public ResponseEntity<Map<String, String>> addQuestion(@RequestBody Map<String, String> request) {
        String pattern = request.get("pattern");
        String response = request.get("response");

        if (pattern == null || pattern.isEmpty() || response == null || response.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Pattern and response cannot be empty");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        chatbotService.addNewQuestion(pattern, response);

        Map<String, String> successResponse = new HashMap<>();
        successResponse.put("message", "Question added successfully");

        return ResponseEntity.ok(successResponse);
    }
}