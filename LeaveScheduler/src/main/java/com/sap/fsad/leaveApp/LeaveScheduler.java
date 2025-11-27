package com.sap.fsad.leaveApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication(scanBasePackages = "com.sap.fsad.leaveApp")
@EnableScheduling
@EnableRetry
@EnableAspectJAutoProxy
@EnableAsync
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
public class LeaveScheduler {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        // JWT Secret
        System.setProperty("APP_JWT_SECRET", dotenv.get("APP_JWT_SECRET", System.getenv("APP_JWT_SECRET")));
        // H2 Database
        System.setProperty("SPRING_DATASOURCE_PASSWORD",
                dotenv.get("SPRING_DATASOURCE_PASSWORD", System.getenv("SPRING_DATASOURCE_PASSWORD")));
        System.setProperty("SPRING_DATASOURCE_USERNAME",
                dotenv.get("SPRING_DATASOURCE_USERNAME", System.getenv("SPRING_DATASOURCE_USERNAME")));
        // MySQL Database
        System.setProperty("MYSQL_USERNAME", dotenv.get("MYSQL_USERNAME", System.getenv("MYSQL_USERNAME")));
        System.setProperty("MYSQL_PASSWORD", dotenv.get("MYSQL_PASSWORD", System.getenv("MYSQL_PASSWORD")));
        System.setProperty("MYSQL_URL", dotenv.get("MYSQL_URL", System.getenv("MYSQL_URL")));
        // Mail Server Credentials
        System.setProperty("SPRING_MAIL_USERNAME",
                dotenv.get("SPRING_MAIL_USERNAME", System.getenv("SPRING_MAIL_USERNAME")));
        System.setProperty("SPRING_MAIL_PASSWORD",
                dotenv.get("SPRING_MAIL_PASSWORD", System.getenv("SPRING_MAIL_PASSWORD")));
        // Papertrail Logging
        System.setProperty("SWO_HOST", dotenv.get("SWO_HOST", System.getenv("SWO_HOST")));
        System.setProperty("SWO_PORT", dotenv.get("SWO_PORT", System.getenv("SWO_PORT")));
        System.setProperty("SWO_TOKEN", dotenv.get("SWO_TOKEN", System.getenv("SWO_TOKEN")));
        System.setProperty("APP_NAME", dotenv.get("APP_NAME", System.getenv("APP_NAME")));
        // Frontend URI
        System.setProperty("FRONTEND_BASE_URI", dotenv.get("FRONTEND_BASE_URI", System.getenv("FRONTEND_BASE_URI")));

        SpringApplication.run(LeaveScheduler.class, args);
    }

}
