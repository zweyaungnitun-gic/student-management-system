package com.gicm.student_management_system;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudentManagementSystemApplication {

	public static void main(String[] args) {
		// Load .env file if it exists
		try {
			Dotenv dotenv = Dotenv.configure()
					.ignoreIfMissing()
					.load();
			// Set system properties from .env file
			dotenv.entries().forEach(entry -> {
				System.setProperty(entry.getKey(), entry.getValue());
			});
		} catch (Exception e) {
			// .env file is optional, continue without it
			System.out.println("Note: .env file not found or could not be loaded. Using system environment variables.");
		}
		
		SpringApplication.run(StudentManagementSystemApplication.class, args);
	}

}
