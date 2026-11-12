package com.example.groupproject60.controller;

import com.example.groupproject60.model.*;
import com.example.groupproject60.service.BadgeService;
import com.example.groupproject60.service.CourseCompletionService;
import com.example.groupproject60.service.CourseService;
import com.example.groupproject60.service.UserService;
import com.example.groupproject60.service.TetrisGameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    @Autowired
    private BadgeService badgeService;

    @Autowired
    private CourseCompletionService courseCompletionService;

    @Autowired
    private TetrisGameService tetrisGameService;

    @GetMapping
    public String showDashboard(Model model, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return "redirect:/login";
        }

        try {
            Long userId;
            if (userDetails instanceof CustomUserDetails) {
                userId = ((CustomUserDetails) userDetails).getId();
            } else {
                String username = userDetails.getUsername();
                User user = userService.findByUsername(username);
                userId = user.getId();
            }
            
            User user = userService.getUserById(userId);
            if (user == null) {
                System.err.println("User not found for ID: " + userId);
                return "redirect:/login";
            }

            // Fetch recommended courses
            List<Course> recommendedCourses = courseService.getRecommendedCourses(userId);
            model.addAttribute("recommendedCourses", recommendedCourses);

            // Fetch level-based courses
            List<Course> levelBasedCourses = courseService.getLevelBasedCourses(user.getSkillLevel());
            model.addAttribute("levelBasedCourses", levelBasedCourses);

            // Fetch challenging courses
            List<Course> challengingCourses = courseService.getChallengingCourses(user.getSkillLevel());
            model.addAttribute("challengingCourses", challengingCourses);

            // Fetch badges
            List<Badge> badges = badgeService.getUserBadges(user);
            model.addAttribute("badges", badges);

            // Fetch course completions for the current user
            List<CourseCompletion> completions = courseCompletionService.getCourseCompletionsForUser(user);
            model.addAttribute("completions", completions);
            model.addAttribute("completionCount", completions.size());

            // Calculate total hours completed
            double totalHours = courseCompletionService.calculateTotalHoursCompleted(user);
            
            // Calculate highest level unlocked (1 level per 10 hours)
            int highestLevel = Math.min(4, (int)(totalHours / 10) + 1);
            
            // Add attributes to model
            model.addAttribute("totalHours", String.format("%.1f", totalHours));
            model.addAttribute("highestLevel", highestLevel);

            model.addAttribute("username", user.getUsername());

            return "dashboard";
        } catch (Exception e) {
            System.err.println("Error in dashboard controller: " + e.getMessage());
            e.printStackTrace();
            return "error";
        }
    }

//    @GetMapping
//    public String showDashboard(Model model, @AuthenticationPrincipal CustomUserDetails userDetails) {
//        if (userDetails == null) {
//            return "redirect:/login";
//        }
//
//        Long userId = userDetails.getId();
//        User user = userService.getUserById(userId);
//
//        // Fetch recommended courses
//        List<Course> recommendedCourses = courseService.getRecommendedCourses(userId);
//        model.addAttribute("recommendedCourses", recommendedCourses);
//
//        // Fetch level-based courses
//        List<Course> levelBasedCourses = courseService.getLevelBasedCourses(user.getSkillLevel());
//        model.addAttribute("levelBasedCourses", levelBasedCourses);
//
//        // Fetch challenging courses
//        List<Course> challengingCourses = courseService.getChallengingCourses(user.getSkillLevel());
//        model.addAttribute("challengingCourses", challengingCourses);
//
//        // Fetch badges
//        List<Badge> badges = badgeService.getUserBadges(user);
//        model.addAttribute("badges", badges);
//
//        // Fetch completed courses
//        List<CourseCompletion> completedCourses = courseCompletionService.getCompletedCoursesForCurrentUser();
//        model.addAttribute("completedCourses", completedCourses);
//
//        // Fetch in-progress courses
//        List<CourseCompletion> inProgressCourses = courseCompletionService.getInProgressCoursesForCurrentUser();
//        model.addAttribute("inProgressCourses", inProgressCourses);
//
//        model.addAttribute("username", user.getUsername());
//
//        return "dashboard";
//    }
}