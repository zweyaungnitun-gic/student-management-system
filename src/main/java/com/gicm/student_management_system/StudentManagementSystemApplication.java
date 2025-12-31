package com.gicm.student_management_system;

import com.gicm.student_management_system.service.DataMigrationService;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

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

	@Bean
	CommandLineRunner runDataMigration(DataMigrationService migrationService) {
		return args -> {
			System.out.println("Starting data migration for student records...");
			try {
				migrationService.migrateExistingData();
				System.out.println("Data migration completed successfully");
			} catch (Exception e) {
				System.err.println("Data migration failed: " + e.getMessage());
				e.printStackTrace();
			}
		};
	}
}