
package com.olympiad.liveclass.controller;

import com.olympiad.liveclass.dto.CreateLiveClassRequest;
import com.olympiad.liveclass.dto.JoinLiveClassResponse;
import com.olympiad.liveclass.dto.LiveKitTokenResponse;
import com.olympiad.liveclass.dto.RaisedHandResponse;
import com.olympiad.liveclass.dto.UpdateLiveClassRequest;
import com.olympiad.liveclass.entity.LiveClass;
import com.olympiad.liveclass.security.LiveClassPrincipal;
import com.olympiad.liveclass.service.LiveClassService;
import com.olympiad.liveclass.service.LiveKitService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/live-classes")
public class LiveClassController {

    private final LiveClassService service;
    private final LiveKitService liveKitService;

    public LiveClassController(LiveClassService service, LiveKitService liveKitService) {
        this.service = service;
        this.liveKitService = liveKitService;
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_CREATE')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LiveClass create(
            @Valid @RequestBody CreateLiveClassRequest request,
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        return service.create(request, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_READ')")
    @GetMapping
    public List<LiveClass> getAll(
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        return service.getVisibleClasses(principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_READ')")
    @GetMapping("/{id}")
    public LiveClass getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        return service.getVisibleById(id, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_UPDATE')")
    @PutMapping("/{id}")
    public LiveClass update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLiveClassRequest request,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        return service.update(id, request, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_CANCEL')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(
            @PathVariable UUID id,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        service.cancel(id, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_CANCEL')")
    @PostMapping("/{id}/cancel")
    public LiveClass cancelPost(
            @PathVariable UUID id,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        return service.cancel(id, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_JOIN')")
    @PostMapping("/{id}/join")
    public JoinLiveClassResponse joinClass(
            @PathVariable UUID id,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        return service.joinClass(id, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_JOIN')")
    @PostMapping("/{id}/token")
    public LiveKitTokenResponse getLiveKitToken(
            @PathVariable UUID id,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        return liveKitService.generateToken(id, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_JOIN')")
    @GetMapping("/{id}/token")
    public LiveKitTokenResponse getLiveKitTokenGet(
            @PathVariable UUID id,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        return liveKitService.generateToken(id, principal);
    }

    /* ---------- Raised hands ---------- */

    @PreAuthorize("hasAuthority('LIVE_CLASS_JOIN')")
    @PostMapping("/{id}/raise-hand")
    public RaisedHandResponse raiseHand(
            @PathVariable UUID id,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        return service.raiseHand(id, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_JOIN')")
    @PostMapping("/{id}/lower-hand")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void lowerHand(
            @PathVariable UUID id,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        service.lowerHand(id, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_JOIN')")
    @GetMapping("/{id}/raise-hands")
    public List<RaisedHandResponse> listRaisedHands(
            @PathVariable UUID id,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        return service.listRaisedHands(id, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_JOIN')")
    @PostMapping("/{id}/raise-hands/{userId}/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void acceptRaisedHand(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        service.acceptRaisedHand(id, userId, principal);
    }

    @PreAuthorize("hasAuthority('LIVE_CLASS_JOIN')")
    @PostMapping("/{id}/raise-hands/{userId}/lower")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void lowerRaisedHand(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal LiveClassPrincipal principal) {
        service.lowerRaisedHand(id, userId, principal);
    }
}
