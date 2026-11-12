package com.example.groupproject60.service;

import com.example.groupproject60.model.TetrisGame;
import com.example.groupproject60.model.User;
import com.example.groupproject60.repo.TetrisGameRepository;
import com.example.groupproject60.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TetrisGameService {

    @Autowired
    private TetrisGameRepository tetrisGameRepository;

    @Autowired
    private CourseCompletionService courseCompletionService;

    @Autowired
    private UserRepository userRepository;

    public List<TetrisGame> getUserLevels(Long userId) {
        return tetrisGameRepository.findByUserIdOrderByLevel(userId);
    }

    public boolean checkLevelAccess(Long userId, int level) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        double totalHours = courseCompletionService.calculateTotalHoursCompleted(user);
        int requiredHours = (level - 1) * 10; // 0, 10, 20, 30 hours required
        return totalHours >= requiredHours;
    }

//    public boolean updateHighScore(Long userId, int level, int score) {
//        TetrisGame game = tetrisGameRepository.findByUserIdAndLevel(userId, level);
//        if (game == null) {
//            // Create a new game record if it doesn't exist
//            User user = userRepository.findById(userId)
//                    .orElseThrow(() -> new RuntimeException("User not found"));
//            game = new TetrisGame(user, level, (level - 1) * 10);
//            game.setHighScore(score);
//            tetrisGameRepository.save(game);
//            return true;
//        } else if (score > game.getHighScore()) {
//            game.setHighScore(score);
//            tetrisGameRepository.save(game);
//            return true;
//        }
//        return false;
//    }

    public boolean updateHighScore(Long userId, int level, int score) {
        TetrisGame game = tetrisGameRepository.findByUserIdAndLevel(userId, level);
        if (game == null) {
            // Create a new game record if it doesn't exist
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            game = new TetrisGame(user, level, (level - 1) * 10);
            game.setHighScore(score);
            tetrisGameRepository.save(game);
            System.out.println("New game record created for user: " + userId + ", level: " + level + ", score: " + score);
            return true;
        } else if (score > game.getHighScore()) {
            game.setHighScore(score);
            tetrisGameRepository.save(game);
            System.out.println("High score updated for user: " + userId + ", level: " + level + ", new score: " + score);
            return true;
        }
        System.out.println("Score not updated for user: " + userId + ", level: " + level + ", current score: " + game.getHighScore());
        return false;
    }

    public TetrisGame getUserGameForLevel(Long userId, int level) {
        TetrisGame game = tetrisGameRepository.findByUserIdAndLevel(userId, level);
        if (game == null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            game = new TetrisGame(user, level, (level - 1) * 10);
            game = tetrisGameRepository.save(game);
        }
        return game;
    }

    private void initializeUserGameRecords(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Initialize records for all 4 levels with 0 scores
        for (int level = 1; level <= 4; level++) {
            TetrisGame game = new TetrisGame(user, level, (level - 1) * 10);
            tetrisGameRepository.save(game);
        }
    }

    /**
     * Get the highest score for a user across all levels.
     *
     * @param userId The ID of the user.
     * @return The highest score achieved by the user.
     */
    public int getHighestScore(Long userId) {
        List<TetrisGame> games = tetrisGameRepository.findByUserIdOrderByLevel(userId);
        if (games.isEmpty()) {
            // Initialize game records for new user
            initializeUserGameRecords(userId);
            return 0;
        }
        return games.stream()
                .mapToInt(TetrisGame::getHighScore)
                .max()
                .orElse(0);
    }

    /**
     * Updates the score for a specific level, but compares against the overall highest score.
     * This ensures that the same highest score is maintained across all levels.
     *
     * @param userId The ID of the user.
     * @param level The level being played.
     * @param score The new score achieved.
     * @return true if the score was updated, false otherwise.
     */
    public boolean updateOverallHighScore(Long userId, int level, int score) {
        // Get the user's current overall highest score
        int currentHighestScore = getHighestScore(userId);
        
        // If the new score is higher than the current highest score
        if (score > currentHighestScore) {
            // Update the score for the current level
            TetrisGame game = getUserGameForLevel(userId, level);
            game.setHighScore(score);
            tetrisGameRepository.save(game);
            
            // Also update all other levels to have the same highest score
            List<TetrisGame> allGames = tetrisGameRepository.findByUserIdOrderByLevel(userId);
            for (TetrisGame otherGame : allGames) {
                if (otherGame.getLevel() != level) {
                    otherGame.setHighScore(score);
                    tetrisGameRepository.save(otherGame);
                }
            }
            
            return true;
        } else {
            // Still update the current level if it's lower than the overall high score
            TetrisGame game = getUserGameForLevel(userId, level);
            if (game.getHighScore() < currentHighestScore) {
                game.setHighScore(currentHighestScore);
                tetrisGameRepository.save(game);
                return true;
            }
        }
        
        return false;
    }
}