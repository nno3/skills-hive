package com.example.groupproject60;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
@SpringBootApplication
public class GroupProject60Application {
    public static void main(String[] args) {
        SpringApplication.run(GroupProject60Application.class, args);
        System.out.println("Hello World!");
    }
}
