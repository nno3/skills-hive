package com.example.groupproject60.repo;

import com.example.groupproject60.dto.LeaderboardEntry;
import com.example.groupproject60.model.CourseCompletion;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaderboardRepository extends CrudRepository<CourseCompletion, Long> {

    @Query("SELECT new com.example.groupproject60.dto.LeaderboardEntry(" +
            "cc.user.username, " +
            "SUM((cc.durationHours * 60) + cc.durationMinutes)" + ") " +
            "FROM CourseCompletion cc " +
            "GROUP BY cc.user.username " +
            "ORDER BY SUM((cc.durationHours * 60) + cc.durationMinutes) DESC")
    List<LeaderboardEntry> getLeaderboard();
}

