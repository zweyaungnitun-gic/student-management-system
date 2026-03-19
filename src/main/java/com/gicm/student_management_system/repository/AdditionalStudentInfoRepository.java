package com.gicm.student_management_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gicm.student_management_system.entity.AdditionalStudentInfo;

@Repository
public interface AdditionalStudentInfoRepository extends JpaRepository<AdditionalStudentInfo, Long> {
    boolean existsByCommonStudent_Id(Long commonStudentId);

    Optional<AdditionalStudentInfo> findByCommonStudent_Id(Long commonStudentId);

    List<AdditionalStudentInfo> findByAttendingClassRelatedStatus(String attendingClassRelatedStatus);
}