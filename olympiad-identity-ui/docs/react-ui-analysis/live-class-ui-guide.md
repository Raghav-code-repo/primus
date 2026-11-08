# Live Class UI Guide

LiveClassRoomPage uses LiveKit (room connection/disconnection, camera/mic, participants, chat, screen share, moderation). Child components: classroom/* (VideoGrid, VideoTile, ChatPanel, ParticipantsPanel, ClassroomHeader, BottomToolbar, CountdownTimer, StudentQuestionPanel, TeacherQuestionPanel). Relationship: LiveClassRoomPage orchestrates room and renders children.

Confirmed details: see src/pages/LiveClassRoomPage.tsx and src/components/classroom/*. Assumptions: exact LiveKit hooks usage not enumerated.
