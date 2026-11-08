
package com.olympiad.liveclass.repository;

import com.olympiad.liveclass.entity.LiveClassAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface LiveClassAssignmentRepository
        extends JpaRepository<LiveClassAssignment, UUID> {

    List<LiveClassAssignment> findByStudentIdOrderByAssignedAtDesc(
            UUID studentId);

    boolean existsByLiveClassIdAndStudentId(
            UUID liveClassId, UUID studentId);

    @Query("SELECT lca.liveClassId FROM LiveClassAssignment lca WHERE lca.studentId = ?1")
    List<UUID> findLiveClassIdByStudentId(UUID studentId);
}
