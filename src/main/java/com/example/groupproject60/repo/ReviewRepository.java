package com.example.groupproject60.repo;

import com.example.groupproject60.model.Review;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends CrudRepository<Review, Integer> {
    List<Review> findByCourseId(int courseId);
    int countByCourseId(int courseId); // Count reviews by course ID
    Optional<Review> findByUserIdAndCourseId(Long userId, Long courseId); // Find a review by userId and courseId
}