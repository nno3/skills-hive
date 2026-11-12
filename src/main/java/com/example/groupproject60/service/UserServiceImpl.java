package com.example.groupproject60.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.groupproject60.model.User;
import com.example.groupproject60.dto.UserDto;
import com.example.groupproject60.repo.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User save(UserDto userDto) {
        User user = new User(
                userDto.getUsername(),
                passwordEncoder.encode(userDto.getPassword()),
                userDto.getFirstname(),
                userDto.getLastname(),
                userDto.getEmail(),
                userDto.getSkillLevel(),
                userDto.getSecurityQuestion1(),
                userDto.getSecurityAnswer1(),
                userDto.getSecurityQuestion2(),
                userDto.getSecurityAnswer2()
        );

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User save(User user) {
        System.out.println("Saving user: " + user.getUsername());
        System.out.println("Password before encoding: " + user.getPassword());


        user.setPassword(passwordEncoder.encode(user.getPassword()));


        User savedUser = userRepository.save(user);
        System.out.println("User saved: " + savedUser);
        return savedUser;
    }
    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null); // Fetch user by ID
    }

    @Override
    @Transactional
    public User updateUser(User user) {
        System.out.println("Updating user: " + user.getUsername());
        return userRepository.save(user); // Update user information
    }

}