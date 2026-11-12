package com.example.groupproject60.controller;

import com.example.groupproject60.dto.LeaderboardEntry;
import com.example.groupproject60.model.User;
import com.example.groupproject60.repo.UserRepository;
import com.example.groupproject60.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;
import java.util.List;

@Controller
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @Autowired
    private UserRepository userRepository;

    // Overall leaderboard endpoint
    @GetMapping("/leaderboard")
    public String leaderboard(Model model, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName());
        List<LeaderboardEntry> leaderboard = leaderboardService.getLeaderboard();
        model.addAttribute("leaderboard", leaderboard);
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("friendMode", false);  // indicates overall view
        return "leaderboard";
    }

    // Friends-only leaderboard endpoint
    @GetMapping("/leaderboard/friends")
    public String friendsLeaderboard(Model model, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName());
        List<LeaderboardEntry> friendsLeaderboard = leaderboardService.getFriendsLeaderboard(currentUser);
        model.addAttribute("leaderboard", friendsLeaderboard);
        model.addAttribute("currentUser", currentUser);
        model.addAttribute("friendMode", true);  // indicates friends view
        return "leaderboard";
    }
}
