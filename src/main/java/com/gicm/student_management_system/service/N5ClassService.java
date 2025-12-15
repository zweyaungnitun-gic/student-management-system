// package com.gicm.student_management_system.service;

// import com.gicm.student_management_system.dto.N5ClassDTO;
// import com.gicm.student_management_system.entity.N5Class;
// import com.gicm.student_management_system.entity.Student;
// import com.gicm.student_management_system.repository.N5ClassRepository;
// import com.gicm.student_management_system.repository.StudentRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import java.util.Optional;

// @Service
// @RequiredArgsConstructor
// public class N5ClassService {

//     private final N5ClassRepository n5ClassRepository;
//     private final StudentRepository studentRepository;

//     // --- Conversion Methods ---

//     private N5ClassDTO convertToDTO(N5Class n5Class) {
//         return N5ClassDTO.builder()
//                 .id(n5Class.getId())
//                 .studentId(n5Class.getStudent().getId())
//                 .n5ClassTeacher(n5Class.getN5ClassTeacher())
//                 .n5ClassAttendance(n5Class.getN5ClassAttendance())
//                 .n5ClassTestResult1(n5Class.getN5ClassTestResult1())
//                 .n5ClassTestResult2(n5Class.getN5ClassTestResult2())
//                 .n5ClassTestResult3(n5Class.getN5ClassTestResult3())
//                 .n5ClassTestResult4(n5Class.getN5ClassTestResult4())
//                 .n5ClassFeedback(n5Class.getN5ClassFeedback())
//                 .n5Class1Teacher(n5Class.getN5Class1Teacher())
//                 .n5Class1AttendanceRate(n5Class.getN5Class1AttendanceRate())
//                 .n5Class1TestResult(n5Class.getN5Class1TestResult())
//                 .n5Class1TeacherFeedback(n5Class.getN5Class1TeacherFeedback())
//                 .n5Class2Teacher(n5Class.getN5Class2Teacher())
//                 .n5Class2AttendanceRate(n5Class.getN5Class2AttendanceRate())
//                 .n5Class2TestResult(n5Class.getN5Class2TestResult())
//                 .n5Class2TeacherFeedback(n5Class.getN5Class2TeacherFeedback())
//                 .n5Class3Teacher(n5Class.getN5Class3Teacher())
//                 .n5Class3AttendanceRate(n5Class.getN5Class3AttendanceRate())
//                 .n5Class3TestResult(n5Class.getN5Class3TestResult())
//                 .n5Class3TeacherFeedback(n5Class.getN5Class3TeacherFeedback())
//                 .build();
//     }

//     private N5Class convertToEntity(N5ClassDTO dto, Student student) {
//         // Find existing entity if ID is present, or create a new one
//         N5Class n5Class = Optional.ofNullable(dto.getId())
//             .flatMap(n5ClassRepository::findById)
//             .orElse(new N5Class());

//         // Update fields from DTO
//         n5Class.setStudent(student); // Ensure the student is set/updated
//         n5Class.setN5ClassTeacher(dto.getN5ClassTeacher());
//         n5Class.setN5ClassAttendance(dto.getN5ClassAttendance());
//         n5Class.setN5ClassTestResult1(dto.getN5ClassTestResult1());
//         n5Class.setN5ClassTestResult2(dto.getN5ClassTestResult2());
//         n5Class.setN5ClassTestResult3(dto.getN5ClassTestResult3());
//         n5Class.setN5ClassTestResult4(dto.getN5ClassTestResult4());
//         n5Class.setN5ClassFeedback(dto.getN5ClassFeedback());
//         n5Class.setN5Class1Teacher(dto.getN5Class1Teacher());
//         n5Class.setN5Class1AttendanceRate(dto.getN5Class1AttendanceRate());
//         n5Class.setN5Class1TestResult(dto.getN5Class1TestResult());
//         n5Class.setN5Class1TeacherFeedback(dto.getN5Class1TeacherFeedback());
//         n5Class.setN5Class2Teacher(dto.getN5Class2Teacher());
//         n5Class.setN5Class2AttendanceRate(dto.getN5Class2AttendanceRate());
//         n5Class.setN5Class2TestResult(dto.getN5Class2TestResult());
//         n5Class.setN5Class2TeacherFeedback(dto.getN5Class2TeacherFeedback());
//         n5Class.setN5Class3Teacher(dto.getN5Class3Teacher());
//         n5Class.setN5Class3AttendanceRate(dto.getN5Class3AttendanceRate());
//         n5Class.setN5Class3TestResult(dto.getN5Class3TestResult());
//         n5Class.setN5Class3TeacherFeedback(dto.getN5Class3TeacherFeedback());

//         return n5Class;
//     }


//     // --- Service Methods ---

//     /**
//      * Gets the N5Class record for a student, or creates a new empty one and returns its DTO.
//      * Includes the studentId in the DTO.
//      */
//     public N5ClassDTO getOrCreateN5ClassDTO(Long studentId) {
//         N5Class n5Class = n5ClassRepository.findByStudentId(studentId)
//                 .orElseGet(() -> {
//                     // If no N5 class record exists, create a new empty one linked to the student
//                     Student student = studentRepository.findById(studentId)
//                             .orElseThrow(() -> new RuntimeException("Student not found"));
                    
//                     N5Class newClass = N5Class.builder()
//                             .student(student)
//                             .build();
//                     return n5ClassRepository.save(newClass);
//                 });
        
//         return convertToDTO(n5Class);
//     }

//     /**
//      * Saves or updates the N5Class record using the provided DTO.
//      */
//     @Transactional
//     public N5ClassDTO saveN5ClassDTO(Long studentId, N5ClassDTO n5ClassDTO) {
//         Student student = studentRepository.findById(studentId)
//                 .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

//         // Ensure the DTO is linked to the correct student (for safety, though controller should handle it)
//         n5ClassDTO.setStudentId(studentId); 

//         // Convert DTO to entity, preserving or setting the student relationship
//         N5Class n5Class = convertToEntity(n5ClassDTO, student);
        
//         N5Class savedClass = n5ClassRepository.save(n5Class);
        
//         return convertToDTO(savedClass);
//     }
// }


package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.N5ClassDTO;

public interface N5ClassService {

    N5ClassDTO getOrCreateN5ClassDTO(Long studentId);

    void saveN5ClassDTO(Long studentId, N5ClassDTO n5ClassDTO);
}