package com.example.groupproject60.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class ChatbotAdminController {

    @GetMapping("/chatbot")
    public String chatbotAdmin() {
        return "chatbot-admin";
    }
}