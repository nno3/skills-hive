use co2302db;
CREATE TABLE category (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(255) NOT NULL
);
CREATE TABLE level (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(255) NOT NULL
);
CREATE TABLE course (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        url VARCHAR(255),
                        thumbnail VARCHAR(255),
                        category_id BIGINT,
                        level_id BIGINT,
                        FOREIGN KEY (category_id) REFERENCES category(id),
                        FOREIGN KEY (level_id) REFERENCES level(id)
);
INSERT INTO category (id, name) VALUES
                                    (1, 'AI'),
                                    (2, 'Data Science'),
                                    (3, 'Cloud Computing'),
                                    (4, 'Cybersecurity');

INSERT INTO level (id, name) VALUES
                                 (1, 'Beginner'),
                                 (2, 'Intermediate'),
                                 (3, 'Advanced');

INSERT INTO course (id, title, description, category_id, level_id, url, thumbnail) VALUES

                                                                                       (1, 'Artificial Intelligence Fundamentals', 'Learn the basics of Artificial Intelligence.', 1, 1, 'https://skills.yourlearning.ibm.com/activity/PLAN-7913EE1DB030', 'photos/AI.jpg'),
                                                                                       (2, 'Machine Learning with Python', 'Learn Machine Learning using Python.', 1, 2, 'https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:BDU+ML0101EN+V4?planId=PLAN-7A12E1671674&sectionId=SECTION-A&planIdFromParentTab=PLAN-7A12E1671674&sectionIdFromParentTab=SECTION-A&planIdForChildTab=PLAN-7A12E1671674', 'photos/mL_2.avif'),
                                                                                       (3, 'Natural Language Processing and Computer Vision', 'Introduction to NLP techniques and Computer Vision', 1, 2, 'https://skills.yourlearning.ibm.com/activity/MDL-214', 'photos/nlp.jpg'),
                                                                                       (4, 'Deep Learning Basics with TensorFlow', 'Introduction to Deep Learning.', 1, 2, 'https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:BIGDATAUNIVERSITY+ML0120EN+V2', 'photos/ML_2.jpeg'),
                                                                                       (5, 'Machine Learning and Deep Learning', 'Explore the logic behind computers’ ability to learn.', 1, 3, 'https://skills.yourlearning.ibm.com/activity/MDL-212', 'photos/reinforcement.jpg'),
                                                                                       (6, 'Data Science Fundamentals', 'Master the fundamentals of Data Science.', 2, 1, 'https://skills.yourlearning.ibm.com/activity/PLAN-BC0FAEE8E439?channelId=CNL_LCB_1592251313526', 'photos/data.avif'),
                                                                                       (7, 'Advanced Google Analytics', 'Learn how data gets collected and processed into readable reports', 2, 3, 'https://skills.yourlearning.ibm.com/activity/URL-E74983239450', 'photos/Advanced_dataAnalysis.jpg'),
                                                                                       (8, 'Big Data 101', 'Learn the Big Data big picture and you will learn the terminology used in Big Data discussions.', 2, 3, 'https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:COGNITIVECLASS+BD0101EN+V2', 'photos/big_data.jpg'),
                                                                                       (9, 'Data Visualization with R', 'Learn how to visualize data effectively.', 2, 2, 'https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:COGNITIVECLASS+DV0151EN+V1', 'photos/data3.jpg'),
                                                                                       (10, 'Python for Data Science', 'Introduction to learn Python for data science.', 2, 3, 'https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:COGNITIVECLASS+PY0101EN+V3', 'photos/predictitive_data.jpg'),
                                                                                       (11, 'An Introduction to Cloud Computing', 'Understand the basics of Cloud Computing.', 3, 1, 'https://skills.yourlearning.ibm.com/activity/ILB-KXWDNYZPPMZV1QPP', 'photos/CC_15.jpg'),
                                                                                       (12, 'Introduction to IBM Storage and Cloud', 'Get started IBM Storage and Cloud.', 3, 1, 'https://skills.yourlearning.ibm.com/activity/ISG-DL08015G?channelId=CNL_LCB_1567186797371&channelNavigation=true', 'photos/cccc.jpg'),
                                                                                       (13, 'Explore Emerging Tech', 'Learn about Emerging Tech.', 3, 1, 'https://skills.yourlearning.ibm.com/activity/PLAN-EB2D3DA31CF9?channelId=CNL_LCB_1567186797371&channelNavigation=true', 'photos/cloude_computing.jpg'),
                                                                                       (14, 'IBM Cloud Essentials V3', 'Get started with IBM Cloud Essentials V3.', 3, 1, 'https://skills.yourlearning.ibm.com/activity/SN-COURSE-V1:IBMDEVELOPERSKILLSNETWORK+CC0103EN+V3?channelId=CNL_LCB_1567186797371&channelNavigation=true', 'photos/CCC.jpg'),
                                                                                       (15, 'Cloud Security', 'Learn the basics of Cloud Security.', 3, 2, 'https://skills.yourlearning.ibm.com/activity/URL-JI8IKPJICSM?channelId=CNL_LCB_1567186797371&channelNavigation=true', 'photos/K_20.avif'),
                                                                                       (16, 'Cybersecurity Fundamentals', 'Learn the basics of cybersecurity.', 4, 1, 'https://skills.yourlearning.ibm.com/activity/PLAN-FA511CDFAF48', 'photos/Cyber.jpg'),
                                                                                       (17, 'Cyber Investigator', 'An Interactive Cybersecurity Experience.', 4, 2, 'https://skills.yourlearning.ibm.com/activity/PLAN-A273AA80C96E', 'photos/Cyber2.jpg'),
                                                                                       (18, 'Ethical Hacking Basics', 'Introduction to ethical hacking techniques.', 4, 1, 'https://skills.yourlearning.ibm.com/activity/URL-2VSNN7UIXN8', 'photos/Cyber3.jpg'),
                                                                                       (19, 'Cybersecurity for Businesses', 'Learn how to secure business systems.', 4, 3, 'https://skills.yourlearning.ibm.com/activity/URL-DK-ZQQ-BFY4', 'photos/Ai_bussiness.jpg'),
                                                                                       (20, 'Generative AI in Cybersecurity', 'Learn how to use Generative AI in Cybersecurity.', 4, 2, 'https://skills.yourlearning.ibm.com/activity/ISG-SLA7240', 'photos/data_mining.jpg');


ALTER TABLE course_completion DROP COLUMN course_id;
DROP TABLE course_completion;
drop database co2302db;
create database co2302db;
use co2302db;










