package com.gicm.student_management_system.Registration;

import com.gicm.student_management_system.controller.RegistrationController;
import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.service.RegisterStudentService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class RegistrationControllerTest {

    @Test
    void getRegister_returnsRegisterView_anonymousAllowed() throws Exception {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get("/register"))
                .andExpect(status().isOk())
                .andExpect(view().name("register/register"));
    }

    @Test
    void getRegister_withSessionStudentData_exposesStudentDataToModel() throws Exception {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        MockHttpSession session = new MockHttpSession();
        StudentRegistrationDTO dto = new StudentRegistrationDTO();
        dto.setEnglishName("Test Name");
        session.setAttribute("studentData", dto);

        mockMvc.perform(get("/register").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("register/register"))
                .andExpect(model().attributeExists("studentData"));
    }

    @Test
    void getSecondPage_returnsSecondPageView() throws Exception {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get("/register/second-page"))
                .andExpect(status().isOk())
                .andExpect(view().name("register/second-page"));
    }

    @Test
    void getSecondPage_withSession_exposesStudentDataToModel() throws Exception {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        MockHttpSession session = new MockHttpSession();
        StudentRegistrationDTO dto = new StudentRegistrationDTO();
        dto.setEnglishName("Second Page Name");
        session.setAttribute("studentData", dto);

        mockMvc.perform(get("/register/second-page").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("register/second-page"))
                .andExpect(model().attributeExists("studentData"));
    }

    @Test
    void getThirdPage_returnsThirdPageView() throws Exception {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get("/register/third-page"))
                .andExpect(status().isOk())
                .andExpect(view().name("register/third-page"));
    }

    @Test
    void getThirdPage_withSession_exposesStudentDataToModel() throws Exception {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        MockHttpSession session = new MockHttpSession();
        StudentRegistrationDTO dto = new StudentRegistrationDTO();
        dto.setEnglishName("Third Page Name");
        session.setAttribute("studentData", dto);

        mockMvc.perform(get("/register/third-page").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("register/third-page"))
                .andExpect(model().attributeExists("studentData"));
    }

    @Test
    void getCheckPage_withoutSession_redirectsToRegister() throws Exception {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get("/register/check-page"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/register"));
    }

    @Test
    void getCheckPage_withSession_returnsCheckPageAndModel() throws Exception {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        MockHttpSession session = new MockHttpSession();
        StudentRegistrationDTO dto = new StudentRegistrationDTO();
        dto.setEnglishName("Check Name");
        session.setAttribute("studentData", dto);

        mockMvc.perform(get("/register/check-page").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("register/check-page"))
                .andExpect(model().attributeExists("studentData"));
    }

    @Test
    void getSuccess_withSession_returnsSuccessViewAndModel() throws Exception {
        RegisterStudentService mockService = mock(RegisterStudentService.class);
        RegistrationController controller = new RegistrationController(mockService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("registeredStudentId", "STU123");
        session.setAttribute("registeredStudentName", "Saved Student");

        mockMvc.perform(get("/register/success").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("register/success"))
                .andExpect(model().attributeExists("studentId"))
                .andExpect(model().attributeExists("studentName"));
    }
}
