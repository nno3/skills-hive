package com.example.groupproject60.service;

import com.example.groupproject60.model.Bookmark;
import com.example.groupproject60.model.Course;
import com.example.groupproject60.model.User;
import com.example.groupproject60.repo.BookmarkRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookmarkService {
    private static final Logger logger = LoggerFactory.getLogger(BookmarkService.class);

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Transactional
    public Bookmark addBookmark(User user, Course course) {
        logger.info("Adding bookmark for user {} and course {}", user.getId(), course.getId());

        try {
            if (!bookmarkRepository.existsByUserAndCourse(user, course)) {
                Bookmark bookmark = new Bookmark();
                bookmark.setUser(user);
                bookmark.setCourse(course);
                Bookmark savedBookmark = bookmarkRepository.save(bookmark);
                logger.info("Successfully saved bookmark with ID: {}", savedBookmark.getId());
                return savedBookmark;
            } else {
                logger.info("Bookmark already exists");
                return null;
            }
        } catch (Exception e) {
            logger.error("Error saving bookmark", e);
            throw e;
        }
    }

    @Transactional
    public void removeBookmark(User user, Course course) {
        logger.info("Removing bookmark for user {} and course {}", user.getId(), course.getId());
        try {
            bookmarkRepository.deleteByUserAndCourse(user, course);
            logger.info("Successfully removed bookmark");
        } catch (Exception e) {
            logger.error("Error removing bookmark", e);
            throw e;
        }
    }

    public boolean isBookmarked(User user, Course course) {
        boolean exists = bookmarkRepository.existsByUserAndCourse(user, course);
        logger.info("Checking if bookmark exists for user {} and course {}: {}",
                user.getId(), course.getId(), exists);
        return exists;
    }

    public List<Bookmark> getUserBookmarks(User user) {
        logger.info("Getting bookmarks for user {}", user.getId());
        List<Bookmark> bookmarks = bookmarkRepository.findByUser(user);
        logger.info("Found {} bookmarks", bookmarks.size());
        return bookmarks;
    }
}