package com.example.groupproject60.repo;

import com.example.groupproject60.model.Badge;
import com.example.groupproject60.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUserOrderByEarnedAtDesc(User user);
}
