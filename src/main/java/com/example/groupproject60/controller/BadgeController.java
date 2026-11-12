package com.example.groupproject60.controller;

import com.example.groupproject60.model.Badge;
import com.example.groupproject60.model.User;
import com.example.groupproject60.service.BadgeAwardService;
import com.example.groupproject60.service.BadgeService;
import com.example.groupproject60.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    private final BadgeService badgeService;
    private final UserService userService;

    private BadgeAwardService badgeAwardService;

    // Constructor injection instead of field injection
    public BadgeController(BadgeService badgeService, UserService userService) {
        this.badgeService = badgeService;
        this.userService = userService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Badge>> getMyBadges() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }
        List<Badge> badges = badgeService.getUserBadges(currentUser);
        return ResponseEntity.ok(badges);
    }

    @PostMapping("/check")
    public ResponseEntity<List<Badge>> checkAndAwardBadges(@RequestParam double completedHours) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }
        // Pass the completedHours value to the service
        badgeAwardService.checkAndAwardBadges(currentUser, completedHours);

        // Return the updated badges list after awarding new badges
        List<Badge> badges = badgeService.getUserBadges(currentUser);
        return ResponseEntity.ok(badges);
    }

    // Helper method to get current user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = authentication.getName();
        return userService.findByUsername(username);
    }
}
