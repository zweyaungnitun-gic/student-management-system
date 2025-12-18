package com.gicm.student_management_system.Registration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gicm.student_management_system.controller.RegistrationController;
import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.service.RegisterStudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class FieldValidationTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setValidator(validator)
                .build();

        objectMapper = new ObjectMapper();
    }

    // ==================== FIRST PAGE VALIDATION TESTS ====================

    @ParameterizedTest
    @CsvSource({
        "englishName, null, englishName",
        "englishName, 小林, englishName",
        "katakanaName, null, katakanaName",
        "katakanaName, Mg Mg, katakanaName",
        "dob, null, dob",
        "dob, 01-01-2000, dob",
        "gender, null, gender",
        "currentAddress, null, currentAddress",
        "hometownAddress, null, hometownAddress",
        "phoneNumber, null, phoneNumber",
        "phoneNumber, 123456, phoneNumber",
        "guardianPhoneNumber, null, guardianPhoneNumber",
        "guardianPhoneNumber, 123456, guardianPhoneNumber",
    })
    void testFirstPageValidation(String fieldName, String invalidValue, String expectedErrorField) throws Exception {
        StudentRegistrationDTO dto = createValidFirstPageDto();
        setFieldValue(dto, fieldName, invalidValue);
        
        mockMvc.perform(post("/register/save-step1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.errors." + expectedErrorField).exists());
    }

    @Test
    void testFirstPageValidationSuccess() throws Exception {
        testValidationSuccess("/register/save-step1", createValidFirstPageDto());
    }

    // ==================== SECOND PAGE VALIDATION TESTS ====================

    @ParameterizedTest
    @CsvSource({
        "fatherName, null, fatherName",
        "fatherName, Father123, fatherName",
        "nationalIdNumber, null, nationalIdNumber",
        "nationalIdNumber, 123456, nationalIdNumber"
    })
    void testSecondPageValidation(String fieldName, String invalidValue, String expectedErrorField) throws Exception {
        StudentRegistrationDTO dto = createValidSecondPageDto();
        setFieldValue(dto, fieldName, invalidValue);
        
        mockMvc.perform(post("/register/save-step2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.errors." + expectedErrorField).exists());
    }

    // ==================== THIRD PAGE VALIDATION TESTS ====================

    @ParameterizedTest
    @CsvSource({
        "tuitionPaymentDate, 01-01-2025, tuitionPaymentDate"
    })
    void testThirdPageValidation(String fieldName, String invalidValue, String expectedErrorField) throws Exception {
        StudentRegistrationDTO dto = createValidThirdPageDto();
        setFieldValue(dto, fieldName, invalidValue);
        
        mockMvc.perform(post("/register/save-step3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.errors." + expectedErrorField).exists());
    }

    // ==================== HELPER METHODS ====================

    private void setFieldValue(StudentRegistrationDTO dto, String fieldName, String value) {
        String actualValue = "null".equals(value) ? null : value;
        
        switch (fieldName) {
            case "englishName" -> dto.setEnglishName(actualValue);
            case "katakanaName" -> dto.setKatakanaName(actualValue);
            case "dob" -> dto.setDob(actualValue);
            case "gender" -> dto.setGender(actualValue);
            case "currentAddress" -> dto.setCurrentAddress(actualValue);
            case "hometownAddress" -> dto.setHometownAddress(actualValue);
            case "phoneNumber" -> dto.setPhoneNumber(actualValue);
            case "guardianPhoneNumber" -> dto.setGuardianPhoneNumber(actualValue);
            case "fatherName" -> dto.setFatherName(actualValue);
            case "nationalIdNumber" -> dto.setNationalIdNumber(actualValue);
            case "tuitionPaymentDate" -> dto.setTuitionPaymentDate(actualValue);
        }
    }

    private void testValidationSuccess(String endpoint, StudentRegistrationDTO dto) throws Exception {
        mockMvc.perform(post(endpoint)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
    }

    private StudentRegistrationDTO createValidFirstPageDto() {
        StudentRegistrationDTO dto = new StudentRegistrationDTO();
        dto.setEnglishName("John Doe");
        dto.setKatakanaName("ジョン ドウ");
        dto.setDob("2000-01-01");
        dto.setGender("男性");
        dto.setCurrentAddress("Tokyo, Japan");
        dto.setHometownAddress("Osaka, Japan");
        dto.setPhoneNumber("09123456789");
        dto.setGuardianPhoneNumber("09987654321");
        return dto;
    }

    private StudentRegistrationDTO createValidSecondPageDto() {
        StudentRegistrationDTO dto = new StudentRegistrationDTO();
        dto.setFatherName("Father Name");
        dto.setNationalIdNumber("12/ThaPhaYa(N)123456");
        dto.setJlptLevel("N5");
        dto.setDesiredOccupation("Engineer");
        dto.setJapanTravelExperience("No");
        dto.setCoeApplicationExperience("No");
        return dto;
    }

    private StudentRegistrationDTO createValidThirdPageDto() {
        StudentRegistrationDTO dto = new StudentRegistrationDTO();
        dto.setReligion("Buddhist");
        dto.setSmoking("No");
        dto.setAlcohol("No");
        dto.setTattoo("No");
        dto.setTuitionPaymentDate("2025-01-01");
        dto.setWantDorm("Yes");
        return dto;
    }
}
