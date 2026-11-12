package com.example.groupproject60.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.ArrayList;
import java.util.List;

@Service
public class SimpleChatbotService {
    private static final Logger logger = LoggerFactory.getLogger(SimpleChatbotService.class);

    private final Map<Pattern, String> responses = new HashMap<>();
    private final List<ChatbotQuestion> questions = new ArrayList<>();

    @PostConstruct
    public void init() {
        logger.info("Initializing Simple Chatbot Service");

        // Initialize with response patterns
        initializeResponses();

        logger.info("Simple Chatbot Service initialized with {} question patterns", responses.size());
    }

    public String processMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "I didn't receive a message. How can I help you?";
        }

        String lowerCaseMessage = message.toLowerCase().trim();

        // Check each pattern for a match
        for (Map.Entry<Pattern, String> entry : responses.entrySet()) {
            if (entry.getKey().matcher(lowerCaseMessage).find()) {
                return entry.getValue();
            }
        }

        // Fallback response
        return "I'm not sure how to help with that. Try asking about courses, bookmarks, your profile, or other platform features.";
    }

    private void initializeResponses() {
        // Greetings
        addResponse("\\b(hi|hello|hey|greetings)\\b",
                "Hello! How can I assist you with your learning today?");

        // Course-related questions
        addResponse("\\b(what|which|show me|list|find).+\\b(courses?|lessons?|class(es)?)\\b",
                "We have a variety of courses available. You can browse them on the <a href='/course'>courses page</a> or use specific filters to find what interests you.");

        // Update the beginner courses response specifically
        addResponse("\\b(beginner).+\\b(courses?|lessons?|class(es)?)\\b",
                "##course_recommendation##I'll show you some recommended beginner courses.");

        // Update the recommendation response
        addResponse("\\b(recommend|suggest|find).+\\b(course)\\b",
                "##course_recommendation##I'd be happy to recommend courses for you! I can suggest courses based on your interests and skill level.");

        // Add pattern for "best courses for me"
        addResponse("\\b(best).+\\b(courses?).+\\b(for me)\\b",
                "##course_recommendation##I'd love to recommend the best courses for you! Let me ask you a few questions to personalize my recommendations.");

        // Add a direct pattern for "show me my bookmarks" with a special response
        addResponse("\\b(show|see|view).+\\b(my)\\b.+\\b(bookmarks?)\\b",
                "##show_bookmarks##Let me show you your bookmarked courses.");

        // Add patterns for specific categories - only include the requested ones
        addResponse("\\b(AI|artificial intelligence|machine learning).+\\b(courses?)\\b",
                "##course_recommendation##I'll show you some recommended AI and machine learning courses.");

        addResponse("\\b(cybersecurity|security).+\\b(courses?)\\b",
                "##course_recommendation##I'll show you some recommended cybersecurity courses.");

        addResponse("\\b(cloud|aws|azure).+\\b(courses?)\\b",
                "##course_recommendation##I'll show you some recommended cloud computing courses.");

        addResponse("\\b(data science|data analysis).+\\b(courses?)\\b",
                "##course_recommendation##I'll show you some recommended data science courses.");

        // Remove Web and Mobile Development categories

        // Add patterns for specific levels
        addResponse("\\b(beginner).+\\b(courses?)\\b",
                "##course_recommendation##I'll show you some recommended beginner courses.");

        addResponse("\\b(intermediate).+\\b(courses?)\\b",
                "##course_recommendation##I'll show you some recommended intermediate courses.");

        addResponse("\\b(advanced).+\\b(courses?)\\b",
                "##course_recommendation##I'll show you some recommended advanced courses.");

        // Rest of existing responses
        addResponse("\\b(start|begin|join|enroll).+\\b(course|class)\\b",
                "To start a course, simply click the 'Start Learning' button on any course card on the <a href='/dashboard'>dashboard</a> or <a href='/course'>courses page</a>.");

        addResponse("\\b(complete|finish|mark.+complete).+\\b(course|class)\\b",
                "When you finish a course, you can mark it as complete. You'll be prompted to enter how long you spent on it. Completed courses will appear in your learning history on your <a href='/profile'>profile page</a>.");

        addResponse("\\b(track|progress)\\b",
                "Your progress is tracked automatically. You can view your current progress in the 'Courses in Progress' section on your <a href='/dashboard'>dashboard</a>. Your complete learning history is available on your <a href='/profile'>profile page</a>.");

        // Bookmarks - improving all bookmark-related responses and fixing links
        addResponse("\\b(how).+\\b(bookmark)\\b",
                "You can bookmark courses by clicking the bookmark icon (📌) on any course card. The icon will turn gold when bookmarked. Your bookmarks are accessible from the sidebar menu under <a href='/bookmark'>Bookmarks</a>.");

        addResponse("\\b(find|where).+\\b(bookmarks?)\\b",
                "Your bookmarks are accessible from the sidebar menu. Click on <a href='/bookmark'>Bookmarks</a> to view all your saved courses.");

        addResponse("\\b(show|view|see).+\\b(bookmarks?)\\b",
                "##show_bookmarks##To view your bookmarked courses, click on <a href='/bookmark'>Bookmarks</a> in the sidebar menu. You can also hover over the bookmark icon in the sidebar to see a quick preview.");

        addResponse("\\b(remove|delete|undo).+\\b(bookmark)\\b",
                "To remove a bookmark, simply click the bookmark icon (📌) again on any bookmarked course. The icon will change from gold back to its original color.");

        addResponse("\\b(bookmark|save|favorite)\\b",
                "You can bookmark courses by clicking the bookmark icon (📌) on any course card. View your bookmarks by clicking on <a href='/bookmark'>Bookmarks</a> in the sidebar or hovering over the bookmark icon in the sidebar to see a quick preview.");

        // Profile-related questions
        addResponse("\\b(profile|account|settings)\\b",
                "You can update your profile by clicking on your profile picture in the top right and selecting 'Edit Profile' or by visiting your <a href='/profile'>profile page</a>. There you can update your personal information, preferences, and see your learning history.");

        addResponse("\\b(edit|change|update).+\\b(profile|information|details|bio)\\b",
                "To edit your profile, go to the <a href='/profile'>profile page</a> and click the 'Edit Profile' button. You can update your personal information, add a bio, change your profile picture, and select your interests.");

        // Learning history
        addResponse("\\b(history|completed|finished)\\b",
                "Your learning history, including completed courses and time spent, is available on your <a href='/profile'>profile page</a>. You can sort your timeline by newest or oldest first to track your learning journey.");

        // Friends related questions
        addResponse("\\b(friend|connect|social)\\b",
                "You can connect with friends on our platform! Visit the <a href='/friends'>Friends</a> page to find, add, and interact with other learners. You can also see your friends' activities and learning progress.");

        addResponse("\\b(add|request|find).+\\b(friend)\\b",
                "To add a friend, go to the <a href='/friends'>Friends</a> page and use the search feature to find users. Click the '+' button next to their name to send a friend request.");

        // Leaderboard related questions
        addResponse("\\b(leaderboard|rank|standing|score)\\b",
                "Check out the <a href='/leaderboard'>Leaderboard</a> to see how you rank among other learners. Earn points by completing courses and achievements to climb the rankings!");

        addResponse("\\b(point|score|earn).+\\b(leaderboard)\\b",
                "You earn points for the leaderboard by completing courses, earning achievements, and playing HexaHive. The more you learn, the higher you'll rank!");

        // HexaHive game related questions
        addResponse("\\b(game|hexahive|play)\\b",
                "Take a break from learning with our <a href='/hexahive'>HexaHive</a> game! It's a fun way to test your skills and earn bonus points that count toward your leaderboard ranking.");

        addResponse("\\b(how).+\\b(play|hexahive)\\b",
                "To play HexaHive, go to the <a href='/hexahive'>HexaHive page</a> and click 'Start Game'. The goal is to connect the hexagons to score points. Each game has a time limit, so play quickly!");

        // Certificate questions
        addResponse("\\b(certificate|certification|diploma)\\b",
                "Upon completing a course, you'll receive a certificate that you can download from your <a href='/profile'>profile page</a> under the 'Certificates' section. You can share these certificates on your professional networks.");

        // Achievements
        addResponse("\\b(achievement|badge|reward)\\b",
                "You can earn achievements and badges by completing courses, reaching milestones, and participating in platform activities. View your earned badges on your <a href='/profile'>profile page</a>.");

        // How to use chatbot
        addResponse("\\b(chatbot|assistant|bot|you)\\b",
                "I'm your learning assistant! You can ask me questions about courses, navigation, features, or get recommendations. Try clicking the suggestion chips below or ask something like 'recommend AI courses' or 'how do I track my progress?'");

        // Logout
        addResponse("\\b(logout|sign out|exit)\\b",
                "To log out, click on the 'Log Out' option at the bottom of the sidebar menu, or you can directly go to <a href='/logout'>this link</a>.");

        // Course difficulty
        addResponse("\\b(difficulty|hard|easy|level)\\b",
                "Our courses are categorized into three difficulty levels: Beginner, Intermediate, and Advanced. You can filter courses by difficulty level on the <a href='/course'>courses page</a> to find content that matches your skill level.");

        // Course duration
        addResponse("\\b(duration|time|hours|long)\\b",
                "Course durations vary depending on the content. Each course displays its estimated completion time on the course details page. You can track the time you've spent learning on your <a href='/profile'>profile page</a>.");

        // Course categories - updated to only include the requested ones
        addResponse("\\b(categor|topic|subject)\\b",
                "We offer courses in various categories including AI, Cybersecurity, Cloud Computing, and Data Science. Browse all categories on the <a href='/course'>courses page</a>.");

        // Course reviews
        addResponse("\\b(review|rating|star|feedback)\\b",
                "You can read course reviews by clicking on the reviews button on any course card. After completing a course, you can also leave your own review to help other learners.");

        // Account questions
        addResponse("\\b(password|reset|forgot|change password)\\b",
                "To change your password, go to <a href='/profile'>your profile</a> and click on 'Security Settings'. If you've forgotten your password, use the 'Forgot Password' link on the login page.");

        // Mobile access
        addResponse("\\b(mobile|phone|app|tablet)\\b",
                "Our platform is fully responsive and works on mobile devices. Simply access the website from your mobile browser to learn on the go!");

        // Notifications
        addResponse("\\b(notification|alert|update)\\b",
                "You can manage your notification settings in your <a href='/profile'>profile page</a> under 'Notification Preferences'. We'll send you updates about new courses, friend activities, and achievements.");

        // Pricing/payment
        addResponse("\\b(free|cost|price|payment|pay|subscription)\\b",
                "All courses on our platform are currently free for registered users. Simply sign up and start learning right away!");

        // Help with courses
        addResponse("\\b(stuck|confused|help).+\\b(course|learning)\\b",
                "If you're stuck on a course, check the discussion section on the course page where you can ask questions. You can also reach out to other learners on the <a href='/friends'>Friends</a> page.");

        // Technical issues
        addResponse("\\b(bug|error|problem|issue|not working)\\b",
                "If you're experiencing technical issues, try refreshing the page or clearing your browser cache. If the problem persists, please contact our support team at support@synthetvb.com.");

        // Privacy
        addResponse("\\b(privacy|data|information).+\\b(protect|secure|safe)\\b",
                "We take your privacy seriously. Your personal information and learning data are secured and never shared with third parties without your consent. View our privacy policy for more details.");
    }

    private void addResponse(String regex, String response) {
        responses.put(Pattern.compile(regex, Pattern.CASE_INSENSITIVE), response);
    }

    public List<ChatbotQuestion> getAllQuestions() {
        return questions;
    }

    public void addNewQuestion(String pattern, String response) {
        addResponse(pattern, response);
        logger.info("Added new question pattern: {}", pattern);
    }

    // Inner class to represent a chatbot Q&A pair
    public static class ChatbotQuestion {
        private final String pattern;
        private final String response;

        public ChatbotQuestion(String pattern, String response) {
            this.pattern = pattern;
            this.response = response;
        }

        public String getPattern() {
            return pattern;
        }

        public String getResponse() {
            return response;
        }
    }
}