package com.olympiad.liveclass.dto;

import com.olympiad.liveclass.entity.LiveClass;
import com.olympiad.liveclass.enums.LiveClassStatus;

import java.time.Instant;
import java.util.UUID;

public record LiveClassResponse(
        UUID id,
        UUID courseId,
        UUID teacherId,
        String title,
        String description,
        Instant scheduledStart,
        Instant scheduledEnd,
        LiveClassStatus status,
        String livekitRoomName,
        String roomName
) {
    public static LiveClassResponse from(LiveClass liveClass) {
        return new LiveClassResponse(
                liveClass.getId(),
                liveClass.getCourseId(),
                liveClass.getTeacherId(),
                liveClass.getTitle(),
                liveClass.getDescription(),
                liveClass.getScheduledStart(),
                liveClass.getScheduledEnd(),
                liveClass.getStatus(),
                liveClass.getRoomName(),
                liveClass.getRoomName()
        );
    }
}
