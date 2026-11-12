package com.example.groupproject60.controller;

import com.example.groupproject60.model.User;
import com.example.groupproject60.model.TetrisGame;
import com.example.groupproject60.service.CourseCompletionService;
import com.example.groupproject60.service.TetrisGameService;
import com.example.groupproject60.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

@Controller
@RequestMapping("/hexahive")
public class TetrisGameController {

    @Autowired
    private TetrisGameService tetrisGameService;

    @Autowired
    private CourseCompletionService courseCompletionService;

    @Autowired
    private UserService userService;

    @GetMapping
    public String showGame(Model model, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());

        // Calculate total hours completed
        double totalHours = courseCompletionService.calculateTotalHoursCompleted(user);

        // Calculate highest level unlocked (1 level per 10 hours)
        int highestLevel = Math.min(4, (int)(totalHours / 10) + 1);

        // Get user's highest score across all levels
        int highestScore = tetrisGameService.getHighestScore(user.getId());

        // Add attributes to model
        model.addAttribute("totalHours", String.format("%.1f", totalHours));
        model.addAttribute("highestLevel", highestLevel);
        model.addAttribute("highestScore", highestScore);
        model.addAttribute("gameStarted", false);

        return "game/hexahive";
    }

    @GetMapping("/play/{level}")
    public String playGame(@PathVariable int level,
                           Model model,
                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        double totalHours = courseCompletionService.calculateTotalHoursCompleted(user);
        int highestLevel = Math.min(4, (int)(totalHours / 10) + 1);

        if (level > highestLevel) {
            return "redirect:/hexahive?error=locked";
        }

        // Get the user's overall highest score instead of level-specific
        int highScore = tetrisGameService.getHighestScore(user.getId());

        model.addAttribute("totalHours", String.format("%.1f", totalHours));
        model.addAttribute("highestLevel", highestLevel);
        model.addAttribute("currentLevel", level);
        model.addAttribute("highestScore", highScore);
        model.addAttribute("gameStarted", true);

        return "game/hexahive";
    }

    @PostMapping("/score")
    @ResponseBody
    public boolean updateScore(@RequestParam int level,
                               @RequestParam int score,
                               @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        // Update high score, but compare against overall high score
        return tetrisGameService.updateOverallHighScore(user.getId(), level, score);
    }

    @PostMapping("/highscore")
    @ResponseBody
    public boolean saveHighScore(@RequestBody Map<String, Integer> payload,
                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        int score = payload.get("score");
        int level = payload.getOrDefault("level", 1);
        // Update high score, but compare against overall high score
        return tetrisGameService.updateOverallHighScore(user.getId(), level, score);
    }

    @GetMapping("/highscore")
    @ResponseBody
    public Map<String, Integer> getHighScore(@RequestParam(required = false) Integer level,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        // Always return the overall highest score, regardless of level
        int highScore = tetrisGameService.getHighestScore(user.getId());
        return Collections.singletonMap("highScore", highScore);
    }

    @GetMapping("/score")
    @ResponseBody
    public Map<String, Integer> getOverallHighScore(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByUsername(userDetails.getUsername());
        int highScore = tetrisGameService.getHighestScore(user.getId());
        return Collections.singletonMap("highScore", highScore);
    }
}