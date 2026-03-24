package com.gicm.student_management_system.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.gicm.student_management_system.dto.AdditionalStudentInfoDTO;
import com.gicm.student_management_system.dto.StudentCreateWizardDTO;
import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.AdditionalStudentInfo;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.AdditionalStudentInfoRepository;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.validation.BasicInfoGroup;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/students/create")
@SessionAttributes("studentCreateWizard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentCreateController {

    private final StudentService studentService;
    private final AdditionalStudentInfoRepository additionalStudentInfoRepository;

    @ModelAttribute("studentCreateWizard")
    public StudentCreateWizardDTO studentCreateWizard() {
        return StudentCreateWizardDTO.builder()
                .student(new StudentDTO())
                .additional(new AdditionalStudentInfoDTO())
                .build();
    }

    @GetMapping("/step1")
    public String showStep1(@ModelAttribute("studentCreateWizard") StudentCreateWizardDTO wizard) {
        if (wizard.getStudent() == null) {
            wizard.setStudent(new StudentDTO());
        }
        return "register/register";
    }

    @PostMapping("/step1")
    public String submitStep1(
            @Validated(BasicInfoGroup.class) @ModelAttribute("studentCreateWizard") StudentCreateWizardDTO wizard,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return "register/register";
        }
        return "redirect:/admin/students/create/second-page";
    }

    @PostMapping("/second-page")
    public String submitSecondPage(
            @ModelAttribute("studentCreateWizard") StudentCreateWizardDTO wizard,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            SessionStatus sessionStatus,
            Model model) {

        if (bindingResult.hasErrors()) {
            return "register/second-page";
        }

        StudentDTO created = studentService.createStudent(wizard.getStudent());
        Student student = studentService.findById(created.getId())
                .orElseThrow(() -> new RuntimeException("Student not found after create: " + created.getId()));

        if (!additionalStudentInfoRepository.existsByCommonStudent_Id(student.getId())) {
            AdditionalStudentInfoDTO add = wizard.getAdditional();
            AdditionalStudentInfo entity = AdditionalStudentInfo.builder()
                    .commonStudent(student)
                    .nameInJapanese(add.getNameInJapanese())
                    .passportNumber(add.getPassportNumber())
                    .currentJapanLevel(add.getCurrentJapanLevel())
                    .japanTravelExperience(add.getJapanTravelExperience())
                    .coeApplicationExperience(add.getCoeApplicationExperience())
                    .passedHighestJlptLevel(add.getPassedHighestJlptLevel())
                    .secondaryPhone(add.getSecondaryPhone())
                    .fatherName(add.getFatherName())
                    .desiredJobType(add.getDesiredJobType())
                    .otherDesiredJobType(add.getOtherDesiredJobType())
                    .isSmoking(add.getIsSmoking())
                    .isAlcoholDrink(add.getIsAlcoholDrink())
                    .haveTatto(add.getHaveTatto())
                    .hostelPreference(add.getHostelPreference())
                    .memoNotes(add.getMemoNotes())
                    .attendingClassRelatedStatus(add.getAttendingClassRelatedStatus())
                    .contactViber(add.getContactViber())
                    .schedulePaymentTutionDate(add.getSchedulePaymentTutionDate())
                    .actualTutionPaymentDate(add.getActualTutionPaymentDate())
                    .otherReligion(add.getOtherReligion())
                    .build();
            additionalStudentInfoRepository.save(entity);
        }

        sessionStatus.setComplete();
        redirectAttributes.addFlashAttribute("success", "生徒が作成されました。生徒ID: " + created.getStudentId());
        return "redirect:/students";
    }
}

