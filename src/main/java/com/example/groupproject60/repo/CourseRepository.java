package com.example.groupproject60.repo;

import com.example.groupproject60.model.Course;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends CrudRepository<Course, Long> {

    // Search courses by title or description
    @Query("SELECT c FROM Course c WHERE LOWER(c.title) LIKE LOWER(concat('%', :query, '%')) OR LOWER(c.description) LIKE LOWER(concat('%', :query, '%'))")
    List<Course> searchCourses(@Param("query") String query);

    // Find courses by category id
    @Query("SELECT c FROM Course c WHERE c.category.id = :categoryId")
    List<Course> findByCategoryId(@Param("categoryId") Long categoryId);

    // Find courses by level id
    @Query("SELECT c FROM Course c WHERE c.level.id = :levelId")
    List<Course> findByLevelId(@Param("levelId") Long levelId);

    // Find courses by both category id and level id
    @Query("SELECT c FROM Course c WHERE c.category.id = :categoryId AND c.level.id = :levelId")
    List<Course> findByCategoryIdAndLevelId(@Param("categoryId") Long categoryId, @Param("levelId") Long levelId);

    // Find courses by category name
    @Query("SELECT c FROM Course c WHERE c.category.name = :category")
    List<Course> findByCategoryName(@Param("category") String category);

    // Find courses by level name
    @Query("SELECT c FROM Course c WHERE c.level.name = :level")
    List<Course> findByLevelName(@Param("level") String level);

    // Find courses by both category name and level name
    @Query("SELECT c FROM Course c WHERE c.category.name = :category AND c.level.name = :level")
    List<Course> findByCategoryNameAndLevelName(@Param("category") String category, @Param("level") String level);

    // Combined search and filter
    @Query("SELECT c FROM Course c WHERE " +
            "(LOWER(c.title) LIKE LOWER(concat('%', :query, '%')) OR LOWER(c.description) LIKE LOWER(concat('%', :query, '%'))) " +
            "AND (:category IS NULL OR c.category.name = :category) " +
            "AND (:level IS NULL OR c.level.name = :level)")
    List<Course> searchAndFilterCourses(
            @Param("query") String query,
            @Param("category") String category,
            @Param("level") String level);

    @Query("SELECT c FROM Course c WHERE c.id = :courseId")
    Optional<Course> findCourseById(@Param("courseId") int courseId);

}
