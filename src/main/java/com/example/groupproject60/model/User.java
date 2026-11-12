//package com.example.groupproject60.model;
//
//import jakarta.persistence.*;
//import org.springframework.security.core.GrantedAuthority;
//
//import java.util.Collection;
//import java.util.Collections;
//
//@Entity
//@Table(name = "users")
//public class User {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO)
//    private Long id;
//
//    @Column(unique = true)
//    private String username;
//    private String password;
//    private String firstname;
//    private String lastname;
//    private String email;  // New field for email
//    private String skillLevel;  // New field for skill level
//
//    // Security questions and answers
//    private String securityQuestion1;
//    private String securityAnswer1;
//    private String securityQuestion2;
//    private String securityAnswer2;
//
//    //public User() {}
//    // One-to-One relationship with UserProfile
//    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
//    private UserProfile userProfile;
//
//    public User() {
//        // JPA requires a default constructor
//    }
//
//    // Updated constructor to accept security questions and answers
//    public User(String username, String password, String firstname, String lastname, String email, String skillLevel, String securityQuestion1, String securityAnswer1, String securityQuestion2, String securityAnswer2) {
//        this.username = username;
//        this.password = password;
//        this.firstname = firstname;
//        this.lastname = lastname;
//        this.email = email;
//        this.skillLevel = skillLevel;
//        this.securityQuestion1 = securityQuestion1;
//        this.securityAnswer1 = securityAnswer1;
//        this.securityQuestion2 = securityQuestion2;
//        this.securityAnswer2 = securityAnswer2;
//    }
//
//
//    // Getters and Setters for new fields
//    public String getSecurityQuestion1() {
//        return securityQuestion1;
//    }
//
//    public void setSecurityQuestion1(String securityQuestion1) {
//        this.securityQuestion1 = securityQuestion1;
//    }
//
//    public String getSecurityAnswer1() {
//        return securityAnswer1;
//    }
//
//    public void setSecurityAnswer1(String securityAnswer1) {
//        this.securityAnswer1 = securityAnswer1;
//    }
//
//    public String getSecurityQuestion2() {
//        return securityQuestion2;
//    }
//
//    public void setSecurityQuestion2(String securityQuestion2) {
//        this.securityQuestion2 = securityQuestion2;
//    }
//
//    public String getSecurityAnswer2() {
//        return securityAnswer2;
//    }
//
//    public void setSecurityAnswer2(String securityAnswer2) {
//        this.securityAnswer2 = securityAnswer2;
//    }
//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public String getUsername() {
//        return username;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public String getPassword() {
//        return password;
//    }
//
//    public void setPassword(String password) {
//        this.password = password;
//    }
//
//    public String getFirstname() {
//        return firstname;
//    }
//
//    public void setFirstname(String firstname) {
//        this.firstname = firstname;
//    }
//
//    public String getLastname() {
//        return lastname;
//    }
//
//    public void setLastname(String lastname) {
//        this.lastname = lastname;
//    }
//
//    public String getEmail() {
//        return email;
//    }
//
//    public void setEmail(String email) {
//        this.email = email;
//    }
//
//    public String getSkillLevel() {
//        return skillLevel;
//    }
//
//    public void setSkillLevel(String skillLevel) {
//        this.skillLevel = skillLevel;
//    }
//
//
//    @Override
//    public String toString() {
//        return "User [id=" + id + ", username=" + username + ", password=" + password + ", firstname=" + firstname + ", lastname=" + lastname + ", email=" + email + ", skillLevel=" + skillLevel + "]";
//    }
//}
//

package com.example.groupproject60.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)
    private String username;
    private String password;
    private String firstname;
    private String lastname;
    private String email;
    private String skillLevel;

    // Security questions and answers
    private String securityQuestion1;
    private String securityAnswer1;
    private String securityQuestion2;
    private String securityAnswer2;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile userProfile;

    // Default constructor
    public User() {}

    // Constructor with fields
    public User(String username, String password, String firstname, String lastname, String email, String skillLevel, String securityQuestion1, String securityAnswer1, String securityQuestion2, String securityAnswer2) {
        this.username = username;
        this.password = password;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.skillLevel = skillLevel;
        this.securityQuestion1 = securityQuestion1;
        this.securityAnswer1 = securityAnswer1;
        this.securityQuestion2 = securityQuestion2;
        this.securityAnswer2 = securityAnswer2;
    }

    // Implement UserDetails methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList(); // No roles/authorities for now
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Account never expires
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Account is never locked
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Credentials never expire
    }

    @Override
    public boolean isEnabled() {
        return true; // Account is always enabled
    }


    // Getters and setters (omitted for brevity)

    public String getSecurityQuestion1() {
        return securityQuestion1;
    }

    public void setSecurityQuestion1(String securityQuestion1) {
        this.securityQuestion1 = securityQuestion1;
    }

    public String getSecurityAnswer1() {
        return securityAnswer1;
    }

    public void setSecurityAnswer1(String securityAnswer1) {
        this.securityAnswer1 = securityAnswer1;
    }

    public String getSecurityQuestion2() {
        return securityQuestion2;
    }

    public void setSecurityQuestion2(String securityQuestion2) {
        this.securityQuestion2 = securityQuestion2;
    }

    public String getSecurityAnswer2() {
        return securityAnswer2;
    }

    public void setSecurityAnswer2(String securityAnswer2) {
        this.securityAnswer2 = securityAnswer2;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    @Override
    public String toString() {
        return "User [id=" + id + ", username=" + username + ", password=" + password + ", firstname=" + firstname + ", lastname=" + lastname + ", email=" + email + ", skillLevel=" + skillLevel + "]";
  }
}
