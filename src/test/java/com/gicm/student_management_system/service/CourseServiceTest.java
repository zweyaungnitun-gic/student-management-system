package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.CourseDTO;
import com.gicm.student_management_system.entity.Course;
import com.gicm.student_management_system.entity.Teacher;
import com.gicm.student_management_system.repository.CourseRepository;
import com.gicm.student_management_system.repository.EnrollmentRepository;
import com.gicm.student_management_system.repository.TeacherRepository;
import com.gicm.student_management_system.repository.TestRepository;
import com.gicm.student_management_system.repository.TestResultRepository;
import com.gicm.student_management_system.serviceimpl.CourseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private TestRepository testRepository;

    @Mock
    private TestResultRepository testResultRepository;

    @InjectMocks
    private CourseServiceImpl courseService;

    private Course course;
    private CourseDTO courseDTO;
    private Teacher teacher;

    @BeforeEach
    void setUp() {
        teacher = Teacher.builder()
                .teacherId(1L)
                .teacherCode("TCH001")
                .name("山田 太郎")
                .email("yamada.taro@gic.ac.jp")
                .build();

        course = Course.builder()
                .courseId(1L)
                .courseCode("CS101")
                .courseName("Javaプログラミング基礎")
                .description("Javaの基本文法とオブジェクト指向")
                .creditHours(3)
                .teacher(teacher)
                .isActive(true)
                .createdAt(OffsetDateTime.now())
                .build();

        courseDTO = CourseDTO.builder()
                .courseId(1L)
                .courseCode("CS101")
                .courseName("Javaプログラミング基礎")
                .description("Javaの基本文法とオブジェクト指向")
                .creditHours(3)
                .teacherId(1L)
                .teacherName("山田 太郎")
                .isActive(true)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Test
    void getAllCourses_ShouldReturnAllCourses() {

        List<Course> courses = Arrays.asList(course);
        when(courseRepository.findAll()).thenReturn(courses);

        List<CourseDTO> result = courseService.getAllCourses();

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCourseName()).isEqualTo("Javaプログラミング基礎");
        verify(courseRepository, times(1)).findAll();
    }

    @Test
    void getActiveCourses_ShouldReturnOnlyActiveCourses() {

        List<Course> activeCourses = Arrays.asList(course);
        when(courseRepository.findByIsActiveTrue()).thenReturn(activeCourses);

        List<CourseDTO> result = courseService.getActiveCourses();

        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getIsActive()).isTrue();
    }

    @Test
    void getCourseById_ShouldReturnCourse_WhenExists() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        Optional<CourseDTO> result = courseService.getCourseById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getCourseCode()).isEqualTo("CS101");
        assertThat(result.get().getCourseName()).isEqualTo("Javaプログラミング基礎");
    }

    @Test
    void getCourseById_ShouldReturnEmpty_WhenNotExists() {

        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<CourseDTO> result = courseService.getCourseById(99L);

        assertThat(result).isEmpty();
    }

    @Test
    void getCourseByCode_ShouldReturnCourse_WhenExists() {

        when(courseRepository.findByCourseCode("CS101")).thenReturn(Optional.of(course));

        Optional<CourseDTO> result = courseService.getCourseByCode("CS101");

        assertThat(result).isPresent();
        assertThat(result.get().getCourseCode()).isEqualTo("CS101");
    }

    @Test
    void createCourse_ShouldSaveAndReturnCourse() {
        // Given
        CourseDTO newCourse = CourseDTO.builder()
                .courseCode("CS201")
                .courseName("データベース設計")
                .description("SQLとデータベース設計")
                .creditHours(4)
                .teacherId(1L)
                .build();

        Course savedCourse = Course.builder()
                .courseId(2L)
                .courseCode("CS201")
                .courseName("データベース設計")
                .description("SQLとデータベース設計")
                .creditHours(4)
                .teacher(teacher)
                .isActive(true)
                .build();

        when(courseRepository.existsByCourseCode("CS201")).thenReturn(false);
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        CourseDTO result = courseService.createCourse(newCourse);

        assertThat(result).isNotNull();
        assertThat(result.getCourseCode()).isEqualTo("CS201");
        assertThat(result.getCourseName()).isEqualTo("データベース設計");
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    void createCourse_ShouldThrowException_WhenCourseCodeExists() {

        CourseDTO duplicateCourse = CourseDTO.builder()
                .courseCode("CS101")
                .courseName("Duplicate Course")
                .build();

        when(courseRepository.existsByCourseCode("CS101")).thenReturn(true);

        assertThatThrownBy(() -> courseService.createCourse(duplicateCourse))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("このコースコードは既に使用されています");
    }

    @Test
    void updateCourse_ShouldUpdateAndReturnCourse() {

        CourseDTO updateDTO = CourseDTO.builder()
                .courseCode("CS101")
                .courseName("Javaプログラミング応用")
                .description("応用的なJavaプログラミング")
                .creditHours(4)
                .teacherId(1L)
                .isActive(true)
                .build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(courseRepository.save(any(Course.class))).thenReturn(course);

        CourseDTO result = courseService.updateCourse(1L, updateDTO);

        assertThat(result).isNotNull();
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    void updateCourse_ShouldThrowException_WhenCourseCodeExists() {

        CourseDTO updateDTO = CourseDTO.builder()
                .courseCode("CS102")
                .courseName("Different Course")
                .build();

        Course existingCourse = Course.builder()
                .courseId(1L)
                .courseCode("CS101")
                .build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(existingCourse));
        when(courseRepository.existsByCourseCode("CS102")).thenReturn(true);

        assertThatThrownBy(() -> courseService.updateCourse(1L, updateDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("このコースコードは既に使用されています");
    }

    @Test
    void deactivateCourse_ShouldSetIsActiveToFalse() {

        Course activeCourse = Course.builder()
                .courseId(1L)
                .courseCode("CS101")
                .isActive(true)
                .build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(activeCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(activeCourse);

        courseService.deactivateCourse(1L);

        assertThat(activeCourse.getIsActive()).isFalse();
        verify(courseRepository, times(1)).save(activeCourse);
    }

    @Test
    void activateCourse_ShouldSetIsActiveToTrue() {

        Course inactiveCourse = Course.builder()
                .courseId(1L)
                .courseCode("CS101")
                .isActive(false)
                .build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(inactiveCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(inactiveCourse);

        courseService.activateCourse(1L);

        assertThat(inactiveCourse.getIsActive()).isTrue();
        verify(courseRepository, times(1)).save(inactiveCourse);
    }

    @Test
    void searchCourses_ShouldReturnMatchingCourses() {

        List<Course> courses = Arrays.asList(course);
        when(courseRepository.findByCourseNameContainingIgnoreCaseOrCourseCodeContainingIgnoreCase("Java", "Java"))
                .thenReturn(courses);

        List<CourseDTO> result = courseService.searchCourses("Java");

        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getCourseName()).contains("Java");
    }

    @Test
    void existsByCourseCode_ShouldReturnTrue_WhenCourseCodeExists() {

        when(courseRepository.existsByCourseCode("CS101")).thenReturn(true);

        boolean result = courseService.existsByCourseCode("CS101");

        assertThat(result).isTrue();
    }

    @Test
    void getCoursesByTeacher_ShouldReturnTeacherCourses() {

        List<Course> courses = Arrays.asList(course);
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(courseRepository.findByTeacher(teacher)).thenReturn(courses);
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        List<CourseDTO> result = courseService.getCoursesByTeacher(1L);

        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getTeacherId()).isEqualTo(1L);
    }
}