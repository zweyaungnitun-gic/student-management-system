package com.gicm.student_management_system.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.MessageSource;
import org.springframework.test.context.ActiveProfiles;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
public class LocalizationConfigTest {

    @Autowired
    private MessageSource messageSource;

    @Test
    public void testEnglishMessages() {
        String title = messageSource.getMessage("app.title", null, Locale.ENGLISH);
        assertEquals("Student Management System", title);
        
        String welcome = messageSource.getMessage("app.welcome", null, Locale.ENGLISH);
        assertEquals("Welcome", welcome);
    }

    @Test
    public void testJapaneseMessages() {
        String title = messageSource.getMessage("app.title", null, Locale.JAPANESE);
        assertEquals("学生管理システム", title);
        
        String welcome = messageSource.getMessage("app.welcome", null, Locale.JAPANESE);
        assertEquals("ようこそ", welcome);
    }

    @Test
    public void testMessageWithParameter() {
        String message = messageSource.getMessage("student.create.success", new Object[]{"STU001"}, Locale.ENGLISH);
        assertEquals("Student created successfully. Student ID: STU001", message);
    }

    @Test
    public void testMessageWithParameterJapanese() {
        String message = messageSource.getMessage("student.create.success", new Object[]{"STU001"}, Locale.JAPANESE);
        assertEquals("学生が作成されました。学生ID: STU001", message);
    }

    @Test
    public void testMessageSourceExists() {
        assertNotNull(messageSource);
    }
}
