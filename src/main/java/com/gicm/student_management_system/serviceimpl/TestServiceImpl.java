package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.TestDTO;
import com.gicm.student_management_system.entity.Test;
import com.gicm.student_management_system.entity.Course;
import com.gicm.student_management_system.entity.Teacher;
import com.gicm.student_management_system.repository.TestRepository;
import com.gicm.student_management_system.repository.CourseRepository;
import com.gicm.student_management_system.repository.TeacherRepository;
import com.gicm.student_management_system.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestServiceImpl implements TestService {

    private final TestRepository testRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    private TestDTO convertToDTO(Test test) {
        if (test == null) return null;
        return TestDTO.builder()
                .testId(test.getTestId())
                .courseId(test.getCourse() != null ? test.getCourse().getCourseId() : null)
                .courseName(test.getCourse() != null ? test.getCourse().getCourseName() : null)
                .courseCode(test.getCourse() != null ? test.getCourse().getCourseCode() : null)
                .testName(test.getTestName())
                .description(test.getDescription())
                .totalMarks(test.getTotalMarks())
                .passingMarks(test.getPassingMarks())
                .testDate(test.getTestDate())
                .durationMinutes(test.getDurationMinutes())
                .createdById(test.getCreatedBy() != null ? test.getCreatedBy().getTeacherId() : null)
                .createdByName(test.getCreatedBy() != null ? test.getCreatedBy().getName() : null)
                .createdAt(test.getCreatedAt())
                .build();
    }

    private Test convertToEntity(TestDTO dto) {
        return convertToEntity(dto, null);
    }

    private Test convertToEntity(TestDTO dto, Test existing) {
        Test test = (existing != null) ? existing : new Test();

        if (dto.getTestName() != null) test.setTestName(dto.getTestName());
        if (dto.getDescription() != null) test.setDescription(dto.getDescription());
        if (dto.getTotalMarks() != null) test.setTotalMarks(dto.getTotalMarks());
        if (dto.getPassingMarks() != null) test.setPassingMarks(dto.getPassingMarks());
        if (dto.getTestDate() != null) test.setTestDate(dto.getTestDate());
        if (dto.getDurationMinutes() != null) test.setDurationMinutes(dto.getDurationMinutes());

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("コースが見つかりません: " + dto.getCourseId()));
            test.setCourse(course);
        }

        if (dto.getCreatedById() != null && existing == null) {
            Teacher teacher = teacherRepository.findById(dto.getCreatedById())
                    .orElseThrow(() -> new RuntimeException("教師が見つかりません: " + dto.getCreatedById()));
            test.setCreatedBy(teacher);
        }

        if (existing == null) {
            test.setCreatedAt(LocalDateTime.now());
        }

        return test;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestDTO> getAllTests() {
        return testRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestDTO> getTestsByCourse(Long courseId) {
        return testRepository.findByCourseId(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestDTO> getTestsByTeacher(Long teacherId) {
        return testRepository.findByCreatedBy(teacherId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TestDTO> getTestById(Long id) {
        return testRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional
    public TestDTO createTest(TestDTO testDTO) {
        if (testDTO.getTestName() != null && testDTO.getCourseId() != null) {
            if (testRepository.existsByTestNameAndCourseCourseId(testDTO.getTestName(), testDTO.getCourseId())) {
                throw new RuntimeException("このコースには同名のテストが既に存在します");
            }
        }

        Test test = convertToEntity(testDTO);
        Test saved = testRepository.save(test);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public TestDTO updateTest(Long id, TestDTO testDTO) {
        Test existing = testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("テストが見つかりません: " + id));

        // Check for duplicate test name in same course if changed
        if (testDTO.getTestName() != null && !existing.getTestName().equals(testDTO.getTestName()) &&
                testDTO.getCourseId() != null && testDTO.getCourseId().equals(existing.getCourse().getCourseId())) {
            if (testRepository.existsByTestNameAndCourseCourseId(testDTO.getTestName(), testDTO.getCourseId())) {
                throw new RuntimeException("このコースには同名のテストが既に存在します");
            }
        }

        Test updated = convertToEntity(testDTO, existing);
        Test saved = testRepository.save(updated);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteTest(Long id) {
        if (!testRepository.existsById(id)) {
            throw new RuntimeException("テストが見つかりません: " + id);
        }
        testRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestDTO> searchTests(String search) {
        if (search == null || search.isEmpty()) {
            return getAllTests();
        }
        return testRepository.searchTests(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByTestNameAndCourse(String testName, Long courseId) {
        return testRepository.existsByTestNameAndCourseCourseId(testName, courseId);
    }
}