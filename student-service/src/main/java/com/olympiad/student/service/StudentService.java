package com.olympiad.student.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.olympiad.student.dto.StudentCreateRequest;
import com.olympiad.student.dto.StudentProfileRequest;
import com.olympiad.student.dto.StudentUpdateRequest;
import com.olympiad.student.entity.Student;
import com.olympiad.student.repository.StudentRepository;

@Service
@Transactional
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    /**
     * Admin provision: create a profile for a specific identity user.
     * The {@code identityUserId} is provided by the trusted admin caller.
     */
    public Student createFromAdminRequest(StudentCreateRequest request) {
        String identityUserId = request.identityUserId();
        ensureNoDuplicate(identityUserId);

        Student student = new Student();
        student.setIdentityUserId(identityUserId);
        student.setFullName(request.fullName());
        student.setGrade(request.grade());
        student.setSchoolName(request.schoolName());
        student.setPhone(request.phone());

        return saveWithDuplicateHandling(student);
    }

    /**
     * Self-registration: create a profile for the caller's identity from the JWT.
     * The {@code identityUserId} is derived by the controller from the
     * validated token and never from the request body.
     */
    public Student createForIdentityUser(String identityUserId, StudentProfileRequest request) {
        ensureIdentityUserIdPresent(identityUserId);
        ensureNoDuplicate(identityUserId);

        Student student = new Student();
        student.setIdentityUserId(identityUserId);
        student.setFullName(request.fullName());
        student.setGrade(request.grade());
        student.setSchoolName(request.schoolName());
        student.setPhone(request.phone());

        return saveWithDuplicateHandling(student);
    }

    @Deprecated
    public Student create(Student student) {
        if (student.getIdentityUserId() == null || student.getIdentityUserId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "identityUserId is required to create a student profile");
        }
        ensureNoDuplicate(student.getIdentityUserId());
        return saveWithDuplicateHandling(student);
    }

    @Transactional(readOnly = true)
    public List<Student> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Student findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Student not found"));
    }

    public Student update(Long id, StudentUpdateRequest request) {
        Student existing = findById(id);

        if (request.fullName() != null) {
            existing.setFullName(request.fullName());
        }
        if (request.grade() != null) {
            existing.setGrade(request.grade());
        }
        if (request.schoolName() != null) {
            existing.setSchoolName(request.schoolName());
        }
        if (request.phone() != null) {
            existing.setPhone(request.phone());
        }

        return repository.save(existing);
    }

    public void delete(Long id) {
        Student existing = findById(id);
        repository.delete(existing);
    }

    @Transactional(readOnly = true)
    public Student findByIdentityUserId(String identityUserId) {
        ensureIdentityUserIdPresent(identityUserId);
        return repository.findByIdentityUserId(identityUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Student profile not found"));
    }

    public Student updateByIdentityUserId(String identityUserId, StudentUpdateRequest updateRequest) {
        ensureIdentityUserIdPresent(identityUserId);
        Student existing = findByIdentityUserId(identityUserId);

        if (updateRequest.fullName() != null) {
            existing.setFullName(updateRequest.fullName());
        }
        if (updateRequest.grade() != null) {
            existing.setGrade(updateRequest.grade());
        }
        if (updateRequest.schoolName() != null) {
            existing.setSchoolName(updateRequest.schoolName());
        }
        if (updateRequest.phone() != null) {
            existing.setPhone(updateRequest.phone());
        }

        return repository.save(existing);
    }

    private void ensureIdentityUserIdPresent(String identityUserId) {
        if (identityUserId == null || identityUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Missing identity claim (userId)");
        }
    }

    private void ensureNoDuplicate(String identityUserId) {
        if (repository.existsByIdentityUserId(identityUserId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A student profile already exists for this identity");
        }
    }

    private Student saveWithDuplicateHandling(Student student) {
        try {
            return repository.save(student);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A student profile already exists for this identity", ex);
        }
    }
}