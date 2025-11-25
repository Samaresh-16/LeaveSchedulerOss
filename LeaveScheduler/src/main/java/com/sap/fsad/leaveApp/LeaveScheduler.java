package com.sap.fsad.leaveApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication(scanBasePackages = "com.sap.fsad.leaveApp")
@EnableScheduling
@EnableRetry
public class LeaveScheduler {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        System.setProperty("APP_JWT_SECRET", dotenv.get("APP_JWT_SECRET", System.getenv("APP_JWT_SECRET")));
        System.setProperty("SPRING_DATASOURCE_PASSWORD", dotenv.get("SPRING_DATASOURCE_PASSWORD", System.getenv("SPRING_DATASOURCE_PASSWORD")));
        System.setProperty("SPRING_DATASOURCE_USERNAME", dotenv.get("SPRING_DATASOURCE_USERNAME", System.getenv("SPRING_DATASOURCE_USERNAME")));
        System.setProperty("MYSQL_USERNAME", dotenv.get("MYSQL_USERNAME", System.getenv("MYSQL_USERNAME")));
        System.setProperty("MYSQL_PASSWORD", dotenv.get("MYSQL_PASSWORD", System.getenv("MYSQL_PASSWORD")));
        System.setProperty("MYSQL_URL", dotenv.get("MYSQL_URL", System.getenv("MYSQL_URL")));
        System.setProperty("SPRING_MAIL_USERNAME", dotenv.get("SPRING_MAIL_USERNAME", System.getenv("SPRING_MAIL_USERNAME")));
        System.setProperty("SPRING_MAIL_PASSWORD", dotenv.get("SPRING_MAIL_PASSWORD", System.getenv("SPRING_MAIL_PASSWORD")));
        
        SpringApplication.run(LeaveScheduler.class, args);
    }

}
