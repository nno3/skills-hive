package com.example.groupproject60.controller;

import com.example.groupproject60.model.Bookmark;
import com.example.groupproject60.model.Course;
import com.example.groupproject60.model.CustomUserDetails;
import com.example.groupproject60.model.User;
import com.example.groupproject60.service.BookmarkService;
import com.example.groupproject60.service.CourseService;
import com.example.groupproject60.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Controller
public class BookmarkController {

    private static final Logger logger = LoggerFactory.getLogger(BookmarkController.class);

    @Autowired
    private BookmarkService bookmarkService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    // Display bookmarks page
    @GetMapping("/bookmarks.html")
    public String showBookmarks(Model model, @AuthenticationPrincipal CustomUserDetails userDetails) {
        logger.debug("Accessing bookmarks page");

        if (userDetails == null) {
            logger.warn("User not authenticated, redirecting to login");
            return "redirect:/login";
        }

        try {
            User user = userService.getUserById(userDetails.getId());
            List<Bookmark> bookmarks = bookmarkService.getUserBookmarks(user);
            logger.debug("Found {} bookmarks for user {}", bookmarks.size(), user.getId());

            model.addAttribute("bookmarkedCourses", bookmarks);
            return "bookmarks";
        } catch (Exception e) {
            logger.error("Error loading bookmarks", e);
            model.addAttribute("error", "Failed to load bookmarks");
            return "error";
        }
    }

    // Toggle bookmark status
    @PostMapping("/toggle-bookmark")
    @ResponseBody
    public String toggleBookmark(@RequestParam Long courseId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        logger.debug("Toggle bookmark request received for course: {}", courseId);

        if (userDetails == null) {
            logger.warn("User not authenticated");
            return "error";
        }

        try {
            User user = userService.getUserById(userDetails.getId());
            Course course = courseService.getCourseById(courseId);

            if (course == null) {
                logger.warn("Course not found: {}", courseId);
                return "error";
            }

            boolean exists = bookmarkService.isBookmarked(user, course);
            logger.debug("Bookmark exists: {}", exists);

            if (exists) {
                bookmarkService.removeBookmark(user, course);
                logger.debug("Bookmark removed");
                return "removed";
            } else {
                bookmarkService.addBookmark(user, course);
                logger.debug("Bookmark added");
                return "added";
            }
        } catch (Exception e) {
            logger.error("Error toggling bookmark", e);
            return "error";
        }
    }

    // Get bookmarks preview
    @GetMapping("/get-bookmarks-preview")
    @ResponseBody
    public List<Bookmark> getBookmarksPreview(@AuthenticationPrincipal CustomUserDetails userDetails) {
        logger.debug("Getting bookmarks preview");

        if (userDetails == null) {
            logger.warn("User not authenticated");
            return new ArrayList<>();
        }

        try {
            User user = userService.getUserById(userDetails.getId());
            List<Bookmark> bookmarks = bookmarkService.getUserBookmarks(user);
            logger.debug("Found {} bookmarks for preview", bookmarks.size());
            return bookmarks;
        } catch (Exception e) {
            logger.error("Error getting bookmarks preview", e);
            return new ArrayList<>();
        }
    }

    // Check if a course is bookmarked
    @GetMapping("/check-bookmark")
    @ResponseBody
    public String checkBookmark(@RequestParam Long courseId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        logger.debug("Checking bookmark status for course: {}", courseId);

        if (userDetails == null) {
            logger.warn("User not authenticated");
            return "false";
        }

        try {
            User user = userService.getUserById(userDetails.getId());
            Course course = courseService.getCourseById(courseId);
            boolean isBookmarked = bookmarkService.isBookmarked(user, course);
            logger.debug("Course {} is bookmarked: {}", courseId, isBookmarked);
            return isBookmarked ? "true" : "false";
        } catch (Exception e) {
            logger.error("Error checking bookmark status", e);
            return "false";
        }
    }

    // Get all bookmarks
    @GetMapping("/get-bookmarks")
    @ResponseBody
    public List<Bookmark> getBookmarks(@AuthenticationPrincipal CustomUserDetails userDetails) {
        logger.debug("Getting all bookmarks");

        if (userDetails == null) {
            logger.warn("User not authenticated");
            return new ArrayList<>();
        }

        try {
            User user = userService.getUserById(userDetails.getId());
            List<Bookmark> bookmarks = bookmarkService.getUserBookmarks(user);
            logger.debug("Found {} bookmarks", bookmarks.size());
            return bookmarks;
        } catch (Exception e) {
            logger.error("Error getting bookmarks", e);
            return new ArrayList<>();
        }
    }
}