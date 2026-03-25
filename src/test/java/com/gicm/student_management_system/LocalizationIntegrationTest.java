package com.gicm.student_management_system;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.MessageSource;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class LocalizationIntegrationTest {

    @Autowired
    private MessageSource messageSource;

    @Test
    public void testEnglishLocalization() {
        // Test app title
        String appTitle = messageSource.getMessage("app.title", null, Locale.ENGLISH);
        assertEquals("Student Management System", appTitle);

        // Test navigation
        String dashboard = messageSource.getMessage("nav.dashboard", null, Locale.ENGLISH);
        assertEquals("Dashboard", dashboard);

        // Test student management
        String studentId = messageSource.getMessage("student.id", null, Locale.ENGLISH);
        assertEquals("Student ID", studentId);

        // Test filters
        String selectAll = messageSource.getMessage("filter.select.all", null, Locale.ENGLISH);
        assertEquals("Select All", selectAll);
    }

    @Test
    public void testJapaneseLocalization() {
        // Test app title
        String appTitle = messageSource.getMessage("app.title", null, Locale.JAPANESE);
        assertEquals("学生管理システム", appTitle);

        // Test navigation
        String dashboard = messageSource.getMessage("nav.dashboard", null, Locale.JAPANESE);
        assertEquals("ダッシュボード", dashboard);

        // Test student management
        String studentId = messageSource.getMessage("student.id", null, Locale.JAPANESE);
        assertEquals("学生ID", studentId);

        // Test filters
        String selectAll = messageSource.getMessage("filter.select.all", null, Locale.JAPANESE);
        assertEquals("全て選択", selectAll);
    }

    @Test
    public void testParameterizedMessages() {
        // Test English parameterized message
        String messageEn = messageSource.getMessage("student.create.success", new Object[]{"STU001"}, Locale.ENGLISH);
        assertEquals("Student created successfully. Student ID: STU001", messageEn);

        // Test Japanese parameterized message
        String messageJa = messageSource.getMessage("student.create.success", new Object[]{"STU001"}, Locale.JAPANESE);
        assertEquals("学生が作成されました。学生ID: STU001", messageJa);
    }

    @Test
    public void testMessageSourceConfiguration() {
        assertNotNull(messageSource);
        
        // Test that message source can handle missing keys gracefully
        String missingKey = messageSource.getMessage("nonexistent.key", new Object[]{"Default Value"}, Locale.ENGLISH);
        assertEquals("Default Value", missingKey);
    }
}
