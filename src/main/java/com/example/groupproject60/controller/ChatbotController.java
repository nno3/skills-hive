package com.example.groupproject60.controller;

import com.example.groupproject60.service.WatsonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {
    @Autowired
    private WatsonService watsonService;

    @PostMapping("/message")
    public String handleMessage(@RequestBody String userMessage) {
        return watsonService.sendMessage(userMessage);
    }
}