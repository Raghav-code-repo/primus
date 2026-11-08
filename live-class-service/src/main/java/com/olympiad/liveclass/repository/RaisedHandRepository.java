
package com.olympiad.liveclass.repository;

import com.olympiad.liveclass.entity.RaisedHand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RaisedHandRepository
        extends JpaRepository<RaisedHand, UUID> {

    List<RaisedHand> findByLiveClassIdOrderByRaisedAtAsc(
            UUID liveClassId);

    Optional<RaisedHand> findById(UUID id);
}
