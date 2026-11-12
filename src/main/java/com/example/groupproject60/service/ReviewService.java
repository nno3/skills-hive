package com.example.groupproject60.service;

import com.example.groupproject60.model.Review;
import com.example.groupproject60.repo.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    // Add a new review
    public Review addReview(Review review) {
        return reviewRepository.save(review);
    }

    // Update an existing review
    public Review updateReview(int reviewId, Review review) {
        Review existingReview = reviewRepository.findById(reviewId).orElse(null);
        if (existingReview != null) {
            existingReview.setComment(review.getComment());
            existingReview.setRating(review.getRating());
            existingReview.setUpdatedAt(review.getUpdatedAt());
            return reviewRepository.save(existingReview);
        }
        return null;
    }

    // Delete a review
    public void deleteReview(int reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    // Get all reviews for a specific course
    public List<Review> getReviewsByCourseId(int courseId) {
        // Get all reviews for this course and ensure they are distinct
        List<Review> reviews = reviewRepository.findByCourseId(courseId);
        
        // Use a stream to filter out duplicates by review ID
        return reviews.stream()
            .distinct() // Uses equals and hashCode for distinctness
            .collect(Collectors.toList());
    }

    // Get a specific review by ID
    public Review getReviewById(int reviewId) {
        return reviewRepository.findById(reviewId).orElse(null);
    }
    
    public int getReviewCountByCourseId(int courseId) {
        return reviewRepository.countByCourseId(courseId);
    }
    
    // Check if a user has already reviewed a course
    public Optional<Review> findUserReviewForCourse(Long userId, Long courseId) {
        return reviewRepository.findByUserIdAndCourseId(userId, courseId);
    }
}