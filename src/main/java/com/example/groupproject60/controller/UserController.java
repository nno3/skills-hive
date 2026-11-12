package com.example.groupproject60.controller;

import com.example.groupproject60.model.CustomUserDetails;
import com.example.groupproject60.model.User;
import com.example.groupproject60.dto.UserDto;
import com.example.groupproject60.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder; // Import PasswordEncoder
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Controller
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder; // Add this line


    @Autowired
    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder; // Initialize the passwordEncoder
    }

    // Login page
    @GetMapping("/login")
    public String showLoginPage(@RequestParam(value = "error", required = false) String error,
                                @RequestParam(value = "logout", required = false) String logout,
                                @RequestParam(value = "usernameChanged", required = false) String usernameChanged,
                                Model model) {
        if (error != null) {
            model.addAttribute("errorMessage", "Invalid username or password.");
        }
        if (logout != null) {
            model.addAttribute("successMessage", "You have been logged out successfully.");
        }


        if (usernameChanged != null) {
            model.addAttribute("usernameChanged", usernameChanged);
            model.addAttribute("infoMessage", "Your username has been changed. Please log in with your new username: " + usernameChanged);
        }


        return "login"; // This should match login.html
    }
    // Registration page
    @GetMapping("/register")
    public String showRegistrationForm(@RequestParam(value = "success", required = false) String success, Model model) {
        if (success != null) {
            model.addAttribute("successMessage", "Registration successful! You can now login.");
        }
        model.addAttribute("user", new UserDto()); // Use the no-argument constructor
        return "register";  // Render the register.html template
    }

    @PostMapping("/register")
    public String registerSave(@ModelAttribute("user") UserDto userDto, BindingResult result, Model model) {
        if (result.hasErrors()) {
            return "register"; // Return to the registration page with error messages
        }

        // Check if the username already exists
        User userByUsername = userService.findByUsername(userDto.getUsername());
        if (userByUsername != null) {
            model.addAttribute("Userexist", "Username is already taken.");
            return "register";
        }

        // Check if the email already exists
        User userByEmail = userService.findByEmail(userDto.getEmail());
        if (userByEmail != null) {
            model.addAttribute("EmailExist", "Email is already registered.");
            return "register";
        }

        // Save the user with skill level and security questions
        userService.save(userDto);
        model.addAttribute("successMessage", "Registration successful! You can now login.");
        return "redirect:/register?success";
    }

    // Forgot password page
    @GetMapping("/forgot-password")
    public String showForgotPasswordPage(Model model) {
        model.addAttribute("user", new UserDto()); // Use the no-argument constructor
        return "forgot-password";  // This should match the name of your HTML file
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String username,
                                @RequestParam String securityQuestion1,
                                @RequestParam String securityAnswer1,
                                @RequestParam String securityQuestion2,
                                @RequestParam String securityAnswer2,
                                Model model) {
        User user = userService.findByUsername(username);
        if (user != null) {
            if (user.getSecurityQuestion1().equals(securityQuestion1) &&
                    user.getSecurityAnswer1().equals(securityAnswer1) &&
                    user.getSecurityQuestion2().equals(securityQuestion2) &&
                    user.getSecurityAnswer2().equals(securityAnswer2)) {
                // If answers match, redirect to the reset password page with the username as a parameter
                model.addAttribute("username", username); // Adding the username for use on the reset page
                return "reset-password"; // This should navigate directly to the reset-password page
            } else {
                model.addAttribute("errorMessage", "Security answers do not match.");
            }
        } else {
            model.addAttribute("errorMessage", "User not found.");
        }
        return "forgot-password"; // Return to forgot password if validation fails
    }

    // Handle updating the password after resetting
    @PostMapping("/update-password")
    public String updatePassword(@RequestParam String username, @RequestParam String newPassword, Model model) {
        User user = userService.findByUsername(username);
        if (user != null) {
            String encodedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encodedPassword);
            userService.save(user);  // Ensure it saves in the DB
            return "redirect:/login?passwordReset";
        } else {
            model.addAttribute("errorMessage", "User not found.");
            return "redirect:/login?error";
        }
    }



}

