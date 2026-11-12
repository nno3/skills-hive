//package com.example.groupproject60.dto;
//
//public class LeaderboardEntry {
//    private String username;
//    private Double totalMinutes;  // Now using Double
//
//    public LeaderboardEntry(String username, Double totalMinutes) {
//        this.username = username;
//        this.totalMinutes = totalMinutes;
//    }
//
//    // Getters and setters
//    public String getUsername() {
//        return username;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public Double getTotalMinutes() {
//        return totalMinutes;
//    }
//
//    public void setTotalMinutes(Double totalMinutes) {
//        this.totalMinutes = totalMinutes;
//    }
//
//    // A computed getter to format the time in "X hours Y minutes"
//    public String getFormattedTime() {
//        if (totalMinutes == null) {
//            return "";
//        }
//        long minutes = totalMinutes.longValue(); // Truncate the double to long minutes
//        long hours = minutes / 60;
//        long remainingMinutes = minutes % 60;
//        return hours + " hours " + remainingMinutes + " minutes";
//    }
//}
package com.example.groupproject60.dto;

public class LeaderboardEntry {
    private String username;
    private Double totalMinutes;

    public LeaderboardEntry(String username, Double totalMinutes) {
        this.username = username;
        this.totalMinutes = totalMinutes;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Double getTotalMinutes() {
        return totalMinutes;
    }

    public void setTotalMinutes(Double totalMinutes) {
        this.totalMinutes = totalMinutes;
    }

    public String getFormattedTime() {
        if (totalMinutes == null) {
            return "";
        }
        long minutes = totalMinutes.longValue();
        long hours = minutes / 60;
        long remainingMinutes = minutes % 60;
        return hours + " hours " + remainingMinutes + " minutes";
    }
}

