package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.TeacherDTO;
import com.gicm.student_management_system.entity.Course;
import com.gicm.student_management_system.entity.Teacher;
import com.gicm.student_management_system.repository.CourseRepository;
import com.gicm.student_management_system.repository.TeacherRepository;
import com.gicm.student_management_system.serviceimpl.TeacherServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private TeacherIdGeneratorService teacherIdGeneratorService;

    @InjectMocks
    private TeacherServiceImpl teacherService;

    private Teacher teacher;
    private TeacherDTO teacherDTO;

    @BeforeEach
    void setUp() {
        teacher = Teacher.builder()
                .teacherId(1L)
                .teacherCode("TCH001")
                .name("山田 太郎")
                .email("yamada.taro@gic.ac.jp")
                .department("情報工学科")
                .createdAt(OffsetDateTime.now())
                .build();

        teacherDTO = TeacherDTO.builder()
                .teacherId(1L)
                .teacherCode("TCH001")
                .name("山田 太郎")
                .email("yamada.taro@gic.ac.jp")
                .department("情報工学科")
                .createdAt(OffsetDateTime.now())
                .build();
    }

    // ========== DELETE TEACHER TESTS ==========

    @Test
    void deleteTeacher_ShouldSoftDelete_WhenNoCoursesAssigned() {
        // Given - Teacher has no courses
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(courseRepository.findByTeacher(teacher)).thenReturn(Collections.emptyList());
        when(teacherRepository.save(any(Teacher.class))).thenReturn(teacher);

        teacherService.deleteTeacher(1L);

        verify(teacherRepository, times(1)).findById(1L);
        verify(courseRepository, times(1)).findByTeacher(teacher);
        verify(teacherRepository, times(1)).save(teacher);
    }

    @Test
    void deleteTeacher_ShouldSoftDeleteAndThrowException_WhenCoursesAssigned() {
        // Given - Teacher has courses assigned
        Course course1 = Course.builder()
                .courseId(1L)
                .courseName("Javaプログラミング基礎")
                .teacher(teacher)
                .build();
        Course course2 = Course.builder()
                .courseId(2L)
                .courseName("データベース設計")
                .teacher(teacher)
                .build();
        List<Course> courses = Arrays.asList(course1, course2);

        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(courseRepository.findByTeacher(teacher)).thenReturn(courses);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(teacher);

        assertThatThrownBy(() -> teacherService.deleteTeacher(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("この教師は以下のコースに割り当てられているため削除できません")
                .hasMessageContaining("Javaプログラミング基礎")
                .hasMessageContaining("データベース設計");
        
        verify(teacherRepository, times(1)).findById(1L);
        verify(courseRepository, times(1)).findByTeacher(teacher);
        verify(teacherRepository, times(1)).save(teacher);
    }

    @Test
    void deleteTeacher_ShouldThrowException_WhenTeacherNotFound() {

        when(teacherRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teacherService.deleteTeacher(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("教師が見つかりません: 99");
        
        verify(teacherRepository, times(1)).findById(99L);
        verify(courseRepository, never()).findByTeacher(any());
        verify(teacherRepository, never()).save(any());
    }

    // ========== DEACTIVATE TEACHER TESTS ==========

    @Test
    void deactivateTeacher_ShouldSetInactiveAndDeactivateCourses() {

        Course course1 = Course.builder()
                .courseId(1L)
                .courseName("Javaプログラミング基礎")
                .teacher(teacher)
                .isActive(true)
                .build();
        Course course2 = Course.builder()
                .courseId(2L)
                .courseName("データベース設計")
                .teacher(teacher)
                .isActive(true)
                .build();
        List<Course> courses = Arrays.asList(course1, course2);

        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(courseRepository.findByTeacher(teacher)).thenReturn(courses);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(teacher);
        when(courseRepository.save(any(Course.class))).thenReturn(course1, course2);

        teacherService.deactivateTeacher(1L);

        verify(teacherRepository, times(1)).findById(1L);
        verify(courseRepository, times(1)).findByTeacher(teacher);
        verify(teacherRepository, times(1)).save(teacher);
        verify(courseRepository, times(2)).save(any(Course.class));
        
        assertThat(course1.getIsActive()).isFalse();
        assertThat(course2.getIsActive()).isFalse();
    }

    @Test
    void deactivateTeacher_ShouldSetInactive_WhenNoCourses() {
        // Given - Teacher has no courses
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(courseRepository.findByTeacher(teacher)).thenReturn(Collections.emptyList());
        when(teacherRepository.save(any(Teacher.class))).thenReturn(teacher);

        teacherService.deactivateTeacher(1L);

        verify(teacherRepository, times(1)).findById(1L);
        verify(courseRepository, times(1)).findByTeacher(teacher);
        verify(teacherRepository, times(1)).save(teacher);
        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    void deactivateTeacher_ShouldThrowException_WhenTeacherNotFound() {

        when(teacherRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teacherService.deactivateTeacher(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("教師が見つかりません: 99");
        
        verify(teacherRepository, times(1)).findById(99L);
        verify(courseRepository, never()).findByTeacher(any());
        verify(teacherRepository, never()).save(any());
    }

    // ========== ACTIVATE TEACHER TESTS ==========

    @Test
    void activateTeacher_ShouldSetActive() {
        teacher.setIsActive(false);
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(teacherRepository.save(any(Teacher.class))).thenReturn(teacher);

        teacherService.activateTeacher(1L);

        verify(teacherRepository, times(1)).findById(1L);
        verify(teacherRepository, times(1)).save(teacher);
        assertThat(teacher.getIsActive()).isTrue();
    }

    @Test
    void activateTeacher_ShouldThrowException_WhenTeacherNotFound() {
        when(teacherRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teacherService.activateTeacher(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("教師が見つかりません: 99");
        
        verify(teacherRepository, times(1)).findById(99L);
        verify(teacherRepository, never()).save(any());
    }

    // ========== OTHER TESTS ==========

    @Test
    void getAllTeachers_ShouldReturnAllTeachers() {

        List<Teacher> teachers = Arrays.asList(teacher);
        when(teacherRepository.findAll()).thenReturn(teachers);

        List<TeacherDTO> result = teacherService.getAllTeachers();

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("山田 太郎");
        verify(teacherRepository, times(1)).findAll();
    }

    @Test
    void getTeacherById_ShouldReturnTeacher_WhenExists() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        Optional<TeacherDTO> result = teacherService.getTeacherById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("山田 太郎");
    }

    @Test
    void getTeacherById_ShouldReturnEmpty_WhenNotExists() {
        when(teacherRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<TeacherDTO> result = teacherService.getTeacherById(99L);

        assertThat(result).isEmpty();
    }

    @Test
    void createTeacher_ShouldSaveAndReturnTeacher() {

        TeacherDTO newTeacher = TeacherDTO.builder()
                .name("佐藤 花子")
                .email("sato.hanako@gic.ac.jp")
                .department("日本語学科")
                .build();

        Teacher savedTeacher = Teacher.builder()
                .teacherId(2L)
                .teacherCode("TCH002")
                .name("佐藤 花子")
                .email("sato.hanako@gic.ac.jp")
                .department("日本語学科")
                .createdAt(OffsetDateTime.now())
                .build();

        when(teacherRepository.existsByEmail("sato.hanako@gic.ac.jp")).thenReturn(false);
        when(teacherIdGeneratorService.generateTeacherId()).thenReturn("TCH002");
        when(teacherRepository.save(any(Teacher.class))).thenReturn(savedTeacher);

        TeacherDTO result = teacherService.createTeacher(newTeacher);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("佐藤 花子");
        assertThat(result.getTeacherCode()).isEqualTo("TCH002");
        verify(teacherRepository, times(1)).save(any(Teacher.class));
    }

    @Test
    void createTeacher_ShouldThrowException_WhenEmailExists() {

        TeacherDTO existingTeacher = TeacherDTO.builder()
                .name("山田 太郎")
                .email("yamada.taro@gic.ac.jp")
                .build();

        when(teacherRepository.existsByEmail("yamada.taro@gic.ac.jp")).thenReturn(true);

        assertThatThrownBy(() -> teacherService.createTeacher(existingTeacher))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("このメールアドレスは既に登録されています");
        
        verify(teacherRepository, never()).save(any());
    }
}