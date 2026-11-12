package com.example.groupproject60.repo;

import com.example.groupproject60.model.TetrisGame;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TetrisGameRepository extends JpaRepository<TetrisGame, Long> {
    List<TetrisGame> findByUserIdOrderByLevel(Long userId);
    TetrisGame findByUserIdAndLevel(Long userId, int level);

    /**
     * Find the top N players with their highest scores
     *
     * @param limit The number of top players to retrieve
     * @return A list of arrays containing [username, highScore]
     */
    @Query(value = "SELECT u.username, MAX(t.high_score) as high_score " +
            "FROM tetris_game t " +
            "JOIN user u ON t.user_id = u.id " +
            "GROUP BY u.username " +
            "ORDER BY high_score DESC " +
            "LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopPlayersByScore(@Param("limit") int limit);
}