package com.example.groupproject60.repo;

import com.example.groupproject60.model.Bookmark;
import com.example.groupproject60.model.User;
import com.example.groupproject60.model.Course;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookmarkRepository extends CrudRepository<Bookmark, Long> {

    // Find bookmarks for a specific user
    List<Bookmark> findByUser(User user);

    // Check if a user has bookmarked a specific course
    boolean existsByUserAndCourse(User user, Course course);

    // Delete a bookmark for a user and course
    void deleteByUserAndCourse(User user, Course course);
}
