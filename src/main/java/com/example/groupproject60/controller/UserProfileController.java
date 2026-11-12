package com.example.groupproject60.controller;

import com.example.groupproject60.model.CustomUserDetails;
import com.example.groupproject60.model.User;
import com.example.groupproject60.model.UserProfile;
import com.example.groupproject60.service.UserProfileService;
import com.example.groupproject60.service.UserService;
import com.example.groupproject60.model.CourseCompletion;
import com.example.groupproject60.service.CourseCompletionService;
import com.example.groupproject60.model.Badge;
import com.example.groupproject60.service.BadgeService;
import com.example.groupproject60.model.CourseInProgress;
import com.example.groupproject60.service.CourseInProgressService;
import com.example.groupproject60.model.Course;
import com.example.groupproject60.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;

@Controller
@RequestMapping("/profile")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private UserService userService;

    @Autowired
    private CourseCompletionService courseCompletionService;

    @Autowired
    private BadgeService badgeService;

   @Autowired
   private CourseInProgressService courseInProgressService;
//
  @Autowired
 private CourseService courseService;
//
   @Autowired
   private PasswordEncoder passwordEncoder;

    // Display the Profile home
    @GetMapping
    public String showProfileHome(Model model,
                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return "redirect:/login";
        }

        Long userId = userDetails.getId();
        UserProfile userProfile = userProfileService.getProfileByUserId(userId);
        User user = userService.getUserById(userId);

        if (userProfile == null || user == null) {
            return "redirect:/profile/create";
        }

        // Get completion statistics
        List<CourseCompletion> completions = courseCompletionService.getCourseCompletionsForUser(user);
        double totalHours = courseCompletionService.calculateTotalHoursCompleted(user);
        
        // Get courses in progress
        List<CourseInProgress> coursesInProgress = courseInProgressService.getCoursesInProgressForCurrentUser();
        
        // Get badges
        List<Badge> badges = badgeService.getUserBadges(user);
        
        // Create a map for course titles
        Map<Long, String> courseTitles = new HashMap<>();

        // Add titles for completed courses
        for (CourseCompletion completion : completions) {
            Long courseId = completion.getCourseId();
            try {
                Course course = courseService.getCourseById(courseId);
                if (course != null) {
                    courseTitles.put(courseId, course.getTitle());
                }
            } catch (Exception e) {
                courseTitles.put(courseId, "Unknown Course");
            }
        }

        // Add titles for courses in progress
        for (CourseInProgress inProgress : coursesInProgress) {
            Long courseId = inProgress.getCourseId();
            if (!courseTitles.containsKey(courseId)) {
                try {
                    Course course = courseService.getCourseById(courseId);
                    if (course != null) {
                        courseTitles.put(courseId, course.getTitle());
                    }
                } catch (Exception e) {
                    courseTitles.put(courseId, "Unknown Course");
                }
            }
        }

        // Add completion stats to model
        model.addAttribute("completionCount", completions.size());
        model.addAttribute("totalLearningHours", String.format("%.1f", totalHours));
        model.addAttribute("userProfile", userProfile);
        model.addAttribute("user", user);
        model.addAttribute("completions", completions);
        model.addAttribute("coursesInProgress", coursesInProgress);
        model.addAttribute("courseTitles", courseTitles);
        model.addAttribute("badges", badges);
        
        return "profile-home";
    }

    // Show the Edit Profile form
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id,
                               Model model,
                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return "redirect:/login";
        }

        // Optional: check if the path id matches the authenticated user's id
        if (!userDetails.getId().equals(id)) {
            // If you only want users to edit their own profile, redirect or show error
            return "redirect:/error";
        }

        UserProfile userProfile = userProfileService.getProfileByUserId(id);
        User user = userService.getUserById(id);

        if (userProfile == null || user == null) {
            return "redirect:/profile/create";
        }

        // Add the userProfile (with nested User) to the model
        model.addAttribute("userProfile", userProfile);
        return "edit-profile"; // Thymeleaf template
    }

    // Handle the Profile update (unified form approach)
    @PostMapping("/update")
    public String updateProfile(@ModelAttribute("userProfile") UserProfile userProfile,
                                @RequestParam("username") String username,
                                @RequestParam("firstname") String firstname,
                                @RequestParam("lastname") String lastname,
                                @RequestParam("email") String email,
                                @RequestParam("skillLevel") String skillLevel,
                                @RequestParam(value = "currentPassword", required = false) String currentPassword,
                                @RequestParam(value = "newPassword", required = false) String newPassword,
                                @RequestParam(value = "preferredCourseCategories", required = false) Set<String> preferredCourseCategories,
                                @AuthenticationPrincipal UserDetails userDetails,
                                RedirectAttributes redirectAttributes,
                                Model model) {

        if (userDetails == null) {
            return "redirect:/login";
        }

        Long currentUserId = ((CustomUserDetails)userDetails).getId();
        User existingUser = userService.getUserById(currentUserId);
        UserProfile existingUserProfile = userProfileService.getProfileByUserId(currentUserId);

        if (existingUser == null || existingUserProfile == null) {
            return "error";
        }

        // Check if username is being changed
        boolean usernameChanged = !existingUser.getUsername().equals(username);
        
        // If username is changed, check if it already exists
        if (usernameChanged) {
            User userWithSameUsername = userService.findByUsername(username);
            
            // If username exists and belongs to a different user
            if (userWithSameUsername != null && !userWithSameUsername.getId().equals(currentUserId)) {
                redirectAttributes.addFlashAttribute("errorMessage", "Username '" + username + "' is already taken. Please choose another username.");
                return "redirect:/profile/edit";
            }
        }

        // Merge user fields
        existingUser.setFirstname(firstname);
        existingUser.setLastname(lastname);
        existingUser.setUsername(username);
        existingUser.setEmail(email);
        existingUser.setSkillLevel(skillLevel);
        
        // Handle password change if requested
        if (newPassword != null && !newPassword.isEmpty() && currentPassword != null && !currentPassword.isEmpty()) {
            // Verify current password
            if (passwordEncoder.matches(currentPassword, existingUser.getPassword())) {
                existingUser.setPassword(passwordEncoder.encode(newPassword));
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Current password is incorrect. Password not updated.");
                return "redirect:/profile/edit";
            }
        }
        
        // Update user
        userService.updateUser(existingUser);

        // Merge profile fields
        existingUserProfile.setBio(userProfile.getBio());
        
        // Handle preferences
        if (preferredCourseCategories != null) {
            existingUserProfile.setPreferredCourseCategories(preferredCourseCategories);
        } else {
            existingUserProfile.setPreferredCourseCategories(new HashSet<>());
        }
        
        // Save updated profile
        userProfileService.save(existingUserProfile);
        
        redirectAttributes.addFlashAttribute("successMessage", "Profile updated successfully.");
        return "redirect:/profile";
    }

    // Show profile creation form
    @GetMapping("/create")
    public String showProfileCreationForm(Model model,
                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return "redirect:/login";
        }

        Long userId = userDetails.getId();
        UserProfile existingProfile = userProfileService.getProfileByUserId(userId);
        if (existingProfile != null) {
            return "redirect:/profile";
        }

        model.addAttribute("userProfile", new UserProfile());
        return "create-profile";
    }

    // Handle creating a new profile
    @PostMapping("/create")
    public String createProfile(@ModelAttribute("userProfile") UserProfile userProfile,
                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return "redirect:/login";
        }

        User user = userService.getUserById(userDetails.getId());
        if (user == null) {
            return "redirect:/login";
        }

        UserProfile existingProfile = userProfileService.getProfileByUserId(user.getId());
        if (existingProfile != null) {
            return "redirect:/profile";
        }

        // Associate this profile with the user
        userProfile.setUser(user);
        userProfileService.save(userProfile);

        return "redirect:/profile";
    }

    // Mark a course as completed
    @PostMapping("/complete-course")
    public String markCourseAsCompleted(@RequestParam Long userId,
                                        @RequestParam Long courseId) {
        userProfileService.markCourseAsCompleted(userId, courseId);
        return "redirect:/profile/edit/" + userId;
    }

    // Update preferred course categories
    @PostMapping("/update-preferences")
    public String updatePreferredCategories(@RequestParam Long userId,
                                            @RequestParam String categories) {
        userProfileService.updatePreferredCategories(userId, categories);
        return "redirect:/profile/edit/" + userId;
    }

    // ================= New Feature =================
    // View another user's profile by username
    @GetMapping("/view/{username}")
    public String viewUserProfile(@PathVariable String username, Model model) {
        User user = userService.findByUsername(username);
        if (user == null) {
            return "error";
        }
        
        UserProfile userProfile = userProfileService.getProfileByUserId(user.getId());
        
        // Get completion statistics
        List<CourseCompletion> completions = courseCompletionService.getCourseCompletionsForUser(user);
        double totalHours = courseCompletionService.calculateTotalHoursCompleted(user);
        
        model.addAttribute("user", user);
        model.addAttribute("userProfile", userProfile);
        model.addAttribute("completionCount", completions.size());
        model.addAttribute("totalLearningHours", String.format("%.1f", totalHours));
        
        return "view-profile";
    }

    // Edit Profile page
    @GetMapping("/edit")
    public String showEditProfileForm(Model model, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return "redirect:/login";
        }

        Long userId = userDetails.getId();
        UserProfile userProfile = userProfileService.getProfileByUserId(userId);
        User user = userService.getUserById(userId);

        if (userProfile == null || user == null) {
            return "redirect:/profile/create";
        }

        model.addAttribute("userProfile", userProfile);
        model.addAttribute("user", user);
        return "edit-profile"; // This will use your existing edit-profile.html template
    }

    // Learning History page
    @GetMapping("/learning-history")
    public String showLearningHistory(Model model, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return "redirect:/login";
        }

        Long userId = userDetails.getId();
        User user = userService.getUserById(userId);

        if (user == null) {
            return "redirect:/login";
        }

        // Get all course completions for the user
        List<CourseCompletion> completions = courseCompletionService.getCourseCompletionsForUser(user);
        
        // Enhance completions with course titles
        Map<Long, String> courseTitles = new HashMap<>();
        for (CourseCompletion completion : completions) {
            Long courseId = completion.getCourseId();
            try {
                Course course = courseService.getCourseById(courseId);
                if (course != null) {
                    courseTitles.put(courseId, course.getTitle());
                }
            } catch (Exception e) {
                courseTitles.put(courseId, "Unknown Course");
            }
        }
        
        // Get all courses in progress for the user
        List<CourseInProgress> coursesInProgress = courseInProgressService.getCoursesInProgressForCurrentUser();
        
        // Enhance courses in progress with course titles
        for (CourseInProgress inProgress : coursesInProgress) {
            Long courseId = inProgress.getCourseId();
            if (!courseTitles.containsKey(courseId)) {
                try {
                    Course course = courseService.getCourseById(courseId);
                    if (course != null) {
                        courseTitles.put(courseId, course.getTitle());
                    }
                } catch (Exception e) {
                    courseTitles.put(courseId, "Unknown Course");
                }
            }
        }
        
        // Add the user, completions, courses in progress, and titles to the model
        model.addAttribute("user", user);
        model.addAttribute("completions", completions);
        model.addAttribute("coursesInProgress", coursesInProgress);
        model.addAttribute("courseTitles", courseTitles);
        
        return "learning-history";
    }

}
