package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.CourseDTO;
import com.gicm.student_management_system.dto.EnrollmentDTO;
import com.gicm.student_management_system.dto.TestDTO;
import com.gicm.student_management_system.entity.Course;
import com.gicm.student_management_system.entity.Enrollment;
import com.gicm.student_management_system.entity.Teacher;
import com.gicm.student_management_system.entity.Test;
import com.gicm.student_management_system.repository.CourseRepository;
import com.gicm.student_management_system.repository.EnrollmentRepository;
import com.gicm.student_management_system.repository.TestRepository;
import com.gicm.student_management_system.repository.TestResultRepository;
import com.gicm.student_management_system.repository.TeacherRepository;
import com.gicm.student_management_system.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TestRepository testRepository;
    private final TestResultRepository testResultRepository;

    private CourseDTO convertToDTO(Course course) {
        if (course == null) return null;
        return CourseDTO.builder()
                .courseId(course.getCourseId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .description(course.getDescription())
                .creditHours(course.getCreditHours())
                .teacherId(course.getTeacher() != null ? course.getTeacher().getTeacherId() : null)
                .teacherName(course.getTeacher() != null ? course.getTeacher().getName() : null)
                .isActive(course.getIsActive())
                .createdAt(course.getCreatedAt())
                .build();
    }

    private EnrollmentDTO convertToEnrollmentDTO(Enrollment enrollment) {
        if (enrollment == null) return null;
        return EnrollmentDTO.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getStudentName())
                .studentIdNumber(enrollment.getStudent().getStudentId())
                .courseId(enrollment.getCourse().getCourseId())
                .courseName(enrollment.getCourse().getCourseName())
                .semester(enrollment.getSemester())
                .status(enrollment.getStatus())
                .initiatedBy(enrollment.getInitiatedBy())
                .enrollmentRequestDate(enrollment.getEnrollmentRequestDate())
                .approvedAt(enrollment.getApprovedAt())
                .completedAt(enrollment.getCompletedAt())
                .build();
    }

    private TestDTO convertToTestDTO(Test test) {
        if (test == null) return null;
        return TestDTO.builder()
                .testId(test.getTestId())
                .courseId(test.getCourse().getCourseId())
                .courseName(test.getCourse().getCourseName())
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

    private Course convertToEntity(CourseDTO dto) {
        return convertToEntity(dto, null);
    }

    private Course convertToEntity(CourseDTO dto, Course existing) {
        Course course = (existing != null) ? existing : new Course();

        if (dto.getCourseCode() != null) course.setCourseCode(dto.getCourseCode());
        if (dto.getCourseName() != null) course.setCourseName(dto.getCourseName());
        if (dto.getDescription() != null) course.setDescription(dto.getDescription());
        if (dto.getCreditHours() != null) course.setCreditHours(dto.getCreditHours());
        if (dto.getIsActive() != null) course.setIsActive(dto.getIsActive());

        if (dto.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("教師が見つかりません: " + dto.getTeacherId()));
            course.setTeacher(teacher);
        } else {
            course.setTeacher(null);
        }

        return course;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getActiveCourses() {
        return courseRepository.findByIsActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CourseDTO> getCourseById(Long id) {
        return courseRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CourseDTO> getCourseByCode(String courseCode) {
        return courseRepository.findByCourseCode(courseCode)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional
    public CourseDTO createCourse(CourseDTO courseDTO) {
        if (courseRepository.existsByCourseCode(courseDTO.getCourseCode())) {
            throw new RuntimeException("このコースコードは既に使用されています");
        }

        Course course = convertToEntity(courseDTO);
        Course saved = courseRepository.save(course);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO courseDTO) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("コースが見つかりません: " + id));

        // Check course code uniqueness if changed
        if (!existing.getCourseCode().equals(courseDTO.getCourseCode()) &&
            courseRepository.existsByCourseCode(courseDTO.getCourseCode())) {
            throw new RuntimeException("このコースコードは既に使用されています");
        }

        Course updated = convertToEntity(courseDTO, existing);
        Course saved = courseRepository.save(updated);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("コースが見つかりません: " + id);
        }
        courseRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleCourseActive(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("コースが見つかりません: " + id));
        course.setIsActive(!course.getIsActive());
        courseRepository.save(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByTeacher(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("教師が見つかりません: " + teacherId));
        return courseRepository.findByTeacher(teacher).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> searchCourses(String search) {
        if (search == null || search.isEmpty()) {
            return getAllCourses();
        }
        return courseRepository.findByCourseNameContainingIgnoreCaseOrCourseCodeContainingIgnoreCase(search, search)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCourseCode(String courseCode) {
        return courseRepository.existsByCourseCode(courseCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getEnrollmentsByCourseId(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(this::convertToEnrollmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestDTO> getTestsByCourseId(Long courseId) {
        return testRepository.findByCourseId(courseId).stream()
                .map(this::convertToTestDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageScoreByCourseId(Long courseId) {
        return testResultRepository.findAverageScoreByCourseId(courseId);
    }
}