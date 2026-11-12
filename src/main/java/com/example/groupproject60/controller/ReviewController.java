package com.example.groupproject60.controller;

import com.example.groupproject60.dto.ReviewDTO;
import com.example.groupproject60.model.CustomUserDetails;
import com.example.groupproject60.model.Review;
import com.example.groupproject60.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses/{courseId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Get all reviews for a specific course
    @GetMapping
    public ResponseEntity<List<Review>> getReviewsByCourseId(@PathVariable int courseId) {
        List<Review> reviews = reviewService.getReviewsByCourseId(courseId);
        return ResponseEntity.ok(reviews);
    }

    // Add a new review
    @PostMapping
    public ResponseEntity<?> addReview(@PathVariable int courseId, @RequestBody ReviewDTO reviewDTO, Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long userId = userDetails.getId(); // Get the user ID from the authenticated user

            // Check if the user has already reviewed this course
            Optional<Review> existingReview = reviewService.findUserReviewForCourse(userId, (long) courseId);
            
            if (existingReview.isPresent()) {
                // Update the existing review instead of creating a new one
                Review review = existingReview.get();
                review.setComment(reviewDTO.getComment());
                review.setRating(reviewDTO.getRating());
                review.setUpdatedAt(LocalDateTime.now());
                
                Review updatedReview = reviewService.updateReview(review.getId(), review);
                return ResponseEntity.ok(updatedReview);
            } else {
                // Create a new review
                Review review = new Review();
                review.setCourseId((long) courseId); // Cast to Long if courseId is int
                review.setUserId(userId); // Use the authenticated user's ID
                review.setComment(reviewDTO.getComment());
                review.setRating(reviewDTO.getRating());
                review.setCreatedAt(LocalDateTime.now());
                review.setUpdatedAt(LocalDateTime.now());

                Review savedReview = reviewService.addReview(review);
                return ResponseEntity.ok(savedReview);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to submit review: " + e.getMessage());
        }
    }

    // Update an existing review
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(@PathVariable int courseId, @PathVariable int reviewId, @RequestBody ReviewDTO reviewDTO, Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long userId = userDetails.getId(); // Get the user ID from the authenticated user

            Review existingReview = reviewService.getReviewById(reviewId);
            if (existingReview == null || !existingReview.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You are not authorized to update this review.");
            }

            Review review = new Review();
            review.setId(reviewId);
            review.setUserId(userId);
            review.setCourseId((long) courseId); // Use the courseId from the path variable
            review.setComment(reviewDTO.getComment());
            review.setRating(reviewDTO.getRating());
            review.setUpdatedAt(LocalDateTime.now());

            Review updatedReview = reviewService.updateReview(reviewId, review);
            return ResponseEntity.ok(updatedReview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update review: " + e.getMessage());
        }
    }

    // Delete a review
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable int courseId, @PathVariable int reviewId, Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long userId = userDetails.getId(); // Get the user ID from the authenticated user

            Review existingReview = reviewService.getReviewById(reviewId);
            if (existingReview == null || !existingReview.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You are not authorized to delete this review.");
            }

            reviewService.deleteReview(reviewId);
            return ResponseEntity.ok("Review deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete review: " + e.getMessage());
        }
    }

    // Get a specific review by ID
    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReviewById(@PathVariable int courseId, @PathVariable int reviewId) {
        try {
            Review review = reviewService.getReviewById(reviewId);
            if (review == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Review not found.");
            }
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch review: " + e.getMessage());
        }
    }
    @GetMapping("/count")
    public ResponseEntity<?> getReviewCountByCourseId(@PathVariable int courseId) {
        try {
            int reviewCount = reviewService.getReviewCountByCourseId(courseId);
            return ResponseEntity.ok(reviewCount); // Return the count directly
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to fetch review count: " + e.getMessage());
        }
    }


}