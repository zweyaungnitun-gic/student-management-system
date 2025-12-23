package com.gicm.student_management_system.Registration;
import com.gicm.student_management_system.controller.HomeController;

import com.gicm.student_management_system.controller.RegistrationController;
import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.service.RegisterStudentService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

public class ButtonTest {
	// Helper methods for JSON payloads
	private String getFirstPageJson() {
		return "{" +
				"\"englishName\":\"John Doe\"," +
				"\"katakanaName\":\"ジョンドウ\"," +
				"\"dob\":\"2000-01-01\"," +
				"\"gender\":\"男性\"," +
				"\"currentAddress\":\"Yangon\"," +
				"\"hometownAddress\":\"Mandalay\"," +
				"\"phoneNumber\":\"09123456789\"," +
				"\"guardianPhoneNumber\":\"09123456780\"," +
				"\"fatherName\":\"Father Name\"," +
				"\"passportNumber\":\"MA123456\"," +
				"\"nationalIdNumber\":\"12/ThaPhaYa(N)111111\"," +
				"\"jlptLevel\":\"N5\"," +
				"\"desiredOccupation\":\"Engineer\"," +
				"\"otherOccupation\":\"\"," +
				"\"japanTravelExperience\":true," +
				"\"coeApplicationExperience\":false" +
				"}";
	}

	private String getSecondPageJson() {
		return "{" +
				"\"fatherName\":\"Father Name\"," +
				"\"passportNumber\":\"MA123456\"," +
				"\"nationalIdNumber\":\"12/ThaPhaYa(N)111111\"," +
				"\"jlptLevel\":\"N5\"," +
				"\"desiredOccupation\":\"Engineer\"," +
				"\"otherOccupation\":\"\"," +
				"\"japanTravelExperience\":true," +
				"\"coeApplicationExperience\":false" +
				"}";
	}

	private String getThirdPageJson() {
		return "{" +
				"\"religion\":\"仏教\"," +
				"\"otherReligion\":\"\"," +
				"\"smoking\":false," +
				"\"alcohol\":true," +
				"\"tattoo\":false," +
				"\"tuitionPaymentDate\":\"2025-01-01\"," +
				"\"wantDorm\":true," +
				"\"otherMemo\":\"Test memo\"" +
				"}";
	}

	private MockMvc buildMockMvc(RegisterStudentService mockService) {
		RegistrationController registrationController = new RegistrationController(mockService);
		HomeController homeController = new HomeController();
		return MockMvcBuilders.standaloneSetup(registrationController, homeController).build();
	}

	private MockHttpSession buildSessionWithStudentData() {
		MockHttpSession session = new MockHttpSession();
		StudentRegistrationDTO dto = new StudentRegistrationDTO();
		dto.setEnglishName("John Doe");
		dto.setKatakanaName("ジョンドウ");
		dto.setDob("2000-01-01");
		dto.setGender("男性");
		dto.setCurrentAddress("Yangon");
		dto.setHometownAddress("Mandalay");
		dto.setPhoneNumber("09123456789");
		dto.setGuardianPhoneNumber("09123456780");
		dto.setFatherName("Father Name");
		dto.setPassportNumber("MA123456");
		dto.setNationalIdNumber("12/ThaPhaYa(N)111111");
		dto.setJlptLevel("N5");
		dto.setDesiredOccupation("Engineer");
		dto.setOtherOccupation("");
		dto.setJapanTravelExperience(false);
		dto.setCoeApplicationExperience(false);
		dto.setReligion("仏教");
		dto.setSmoking(false);
		dto.setAlcohol(false);
		dto.setTattoo(false);
		dto.setTuitionPaymentDate("2025-01-01");
		dto.setWantDorm(true);
		dto.setOtherMemo("Test memo");
		session.setAttribute("studentData", dto);
		return session;
	}

	@Test
	void successPageNewRegistrationButton_navigatesToRegister() throws Exception {
		RegisterStudentService mockService = mock(RegisterStudentService.class);
		MockMvc mockMvc = buildMockMvc(mockService);

		MockHttpSession session = new MockHttpSession();
		session.setAttribute("registeredStudentId", "STU001");
		session.setAttribute("registeredStudentName", "John Doe");

		mockMvc.perform(get("/register/success").session(session))
				.andExpect(status().isOk());
		mockMvc.perform(get("/register").session(session))
				.andExpect(status().isOk());
	}

	@Test
	void successPageHomeButton_navigatesToHome() throws Exception {
		RegisterStudentService mockService = mock(RegisterStudentService.class);
		RegistrationController registrationController = new RegistrationController(mockService);
		HomeController homeController = new HomeController();
		MockMvc mockMvc = MockMvcBuilders.standaloneSetup(registrationController, homeController).build();

		// Simulate clicking 'ホーム' (home) button
		mockMvc.perform(get("/")).andExpect(status().isOk());
	}

	@Test
	    void checkPageChangeButton_navigatesBackToRegister() throws Exception {
		RegisterStudentService mockService = mock(RegisterStudentService.class);
		RegistrationController controller = new RegistrationController(mockService);
		MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

		MockHttpSession session = new MockHttpSession();
		// Simulate session with completed data
		StudentRegistrationDTO dto = new StudentRegistrationDTO();
		dto.setEnglishName("John Doe");
		session.setAttribute("studentData", dto);

		// Simulate GET /register/check-page
		mockMvc.perform(get("/register/check-page").session(session))
			.andExpect(status().isOk());

		// Simulate clicking '変更' (change) which navigates to /register
		mockMvc.perform(get("/register").session(session))
			.andExpect(status().isOk());
	    }

	@Test
	void checkPageSubmitButton_savesAndRedirectsToSuccess() throws Exception {
		RegisterStudentService mockService = mock(RegisterStudentService.class);
		RegistrationController controller = new RegistrationController(mockService);
		MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

		// Mock the service to return a valid Student
		com.gicm.student_management_system.entity.Student student = new com.gicm.student_management_system.entity.Student();
		student.setStudentId("STU001");
		student.setStudentName("John Doe");
		when(mockService.registerStudent(any())).thenReturn(student);

		MockHttpSession session = new MockHttpSession();
		// Simulate session with completed data
		StudentRegistrationDTO dto = new StudentRegistrationDTO();
		dto.setEnglishName("John Doe");
		dto.setKatakanaName("ジョンドウ");
		dto.setDob("2000-01-01");
		dto.setGender("男性");
		dto.setCurrentAddress("Yangon");
		dto.setHometownAddress("Mandalay");
		dto.setPhoneNumber("09123456789");
		dto.setGuardianPhoneNumber("09123456780");
		dto.setFatherName("Father Name");
		dto.setPassportNumber("MA123456");
		dto.setNationalIdNumber("12/ThaPhaYa(N)111111");
		dto.setJlptLevel("N5");
		dto.setDesiredOccupation("Engineer");
		dto.setOtherOccupation("");
		dto.setJapanTravelExperience(false);
		dto.setCoeApplicationExperience(false);
		dto.setReligion("仏教");
		dto.setSmoking(false);
		dto.setAlcohol(false);
		dto.setTattoo(false);
		dto.setTuitionPaymentDate("2025-01-01");
		dto.setWantDorm(true);
		dto.setOtherMemo("Test memo");
		session.setAttribute("studentData", dto);

		// Simulate POST /register/submit-final
		mockMvc.perform(post("/register/submit-final")
				.session(session))
				.andExpect(status().isOk());
	}

	@Test
	void registerButton_savesDataInSession_andNavigates() throws Exception {
		RegisterStudentService mockService = mock(RegisterStudentService.class);
		MockMvc mockMvc = buildMockMvc(mockService);
		MockHttpSession session = new MockHttpSession();
		String json = getFirstPageJson();
		mockMvc.perform(post("/register/save-step1")
			.contentType(MediaType.APPLICATION_JSON)
			.content(json)
			.session(session))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("success"));
		StudentRegistrationDTO dto = (StudentRegistrationDTO) session.getAttribute("studentData");
		assert dto != null;
		assert "John Doe".equals(dto.getEnglishName());
		assert "ジョンドウ".equals(dto.getKatakanaName());
		assert "2000-01-01".equals(dto.getDob());
		assert "男性".equals(dto.getGender());
		assert "Yangon".equals(dto.getCurrentAddress());
		assert "Mandalay".equals(dto.getHometownAddress());
		assert "09123456789".equals(dto.getPhoneNumber());
		assert "09123456780".equals(dto.getGuardianPhoneNumber());
	    }

	    @Test
	    void secondPageButton_savesDataInSession_andNavigates() throws Exception {
		RegisterStudentService mockService = mock(RegisterStudentService.class);
		MockMvc mockMvc = buildMockMvc(mockService);
		MockHttpSession session = buildSessionWithStudentData();
		String json = getSecondPageJson();
		mockMvc.perform(post("/register/save-step2")
			.contentType(MediaType.APPLICATION_JSON)
			.content(json)
			.session(session))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("success"));
		StudentRegistrationDTO dto = (StudentRegistrationDTO) session.getAttribute("studentData");
		assert dto != null;
		assert "Father Name".equals(dto.getFatherName());
		assert "MA123456".equals(dto.getPassportNumber());
		assert "12/ThaPhaYa(N)111111".equals(dto.getNationalIdNumber());
		assert "N5".equals(dto.getJlptLevel());
		assert "Engineer".equals(dto.getDesiredOccupation());
	    }

	    @Test
	    void thirdPageButton_savesDataInSession_andNavigates() throws Exception {
		RegisterStudentService mockService = mock(RegisterStudentService.class);
		MockMvc mockMvc = buildMockMvc(mockService);
		MockHttpSession session = buildSessionWithStudentData();
		String json = getThirdPageJson();
		mockMvc.perform(post("/register/save-step3")
			.contentType(MediaType.APPLICATION_JSON)
			.content(json)
			.session(session))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("success"));
		StudentRegistrationDTO dto = (StudentRegistrationDTO) session.getAttribute("studentData");
		assert dto != null;
		assert "仏教".equals(dto.getReligion());
		assert !dto.getSmoking();
		assert "2025-01-01".equals(dto.getTuitionPaymentDate());
		assert dto.getWantDorm();
		assert "Test memo".equals(dto.getOtherMemo());
	    }

	    @Test
	    void secondPageBackButton_savesDataInSession_andNavigatesBack() throws Exception {
		RegisterStudentService mockService = mock(RegisterStudentService.class);
		MockMvc mockMvc = buildMockMvc(mockService);
		MockHttpSession session = buildSessionWithStudentData();
		String json = getSecondPageJson();
		mockMvc.perform(post("/register/save-step2")
			.contentType(MediaType.APPLICATION_JSON)
			.content(json)
			.session(session))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("success"));
		mockMvc.perform(post("/register/save-step2")
			.contentType(MediaType.APPLICATION_JSON)
			.content(json)
			.session(session));
		StudentRegistrationDTO dto = (StudentRegistrationDTO) session.getAttribute("studentData");
		assert dto != null;
		assert "Father Name".equals(dto.getFatherName());
	    }

	    @Test
	    void thirdPageBackButton_savesDataInSession_andNavigatesBack() throws Exception {
		RegisterStudentService mockService = mock(RegisterStudentService.class);
		MockMvc mockMvc = buildMockMvc(mockService);
		MockHttpSession session = buildSessionWithStudentData();
		String json = getThirdPageJson();
		mockMvc.perform(post("/register/save-step3")
			.contentType(MediaType.APPLICATION_JSON)
			.content(json)
			.session(session))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("success"));
		mockMvc.perform(post("/register/save-step3")
			.contentType(MediaType.APPLICATION_JSON)
			.content(json)
			.session(session));
		StudentRegistrationDTO dto = (StudentRegistrationDTO) session.getAttribute("studentData");
		assert dto != null;
		assert "仏教".equals(dto.getReligion());
	    }
}
