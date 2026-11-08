package com.olympiad.student.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import com.olympiad.student.repository.StudentRepository;

/**
 * Regression tests of the existing student endpoints, they must keep working
 * next to the enrollment feature.
 */
@SpringBootTest(properties = {
    "spring.security.oauth2.resourceserver.jwt.secret-key="
        + "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
    "course.service.base-url=http://course-service.test"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentControllerTest {

    private static final String STUDENT_ID = "student-1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentRepository studentRepository;

    @BeforeEach
    void cleanDatabase() {
        studentRepository.deleteAll();
    }

    @Test
    void createMyProfileStoresTheIdentityOfTheToken() throws Exception {
        mockMvc.perform(post("/api/students/me")
                        .with(student(STUDENT_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Ada Lovelace\","
                                + "\"grade\":\"8\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.identityUserId").value(STUDENT_ID))
                .andExpect(jsonPath("$.fullName").value("Ada Lovelace"));
    }

    @Test
    void createMyProfileRejectsADuplicate() throws Exception {
        createProfile();

        mockMvc.perform(post("/api/students/me")
                        .with(student(STUDENT_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Ada Lovelace\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void getMyProfileRequiresAToken() throws Exception {
        mockMvc.perform(get("/api/students/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void findAllStudentsIsRejectedForAStudent() throws Exception {
        createProfile();

        mockMvc.perform(get("/api/students").with(student(STUDENT_ID)))
                .andExpect(status().isForbidden());
    }

    @Test
    void findAllStudentsIsAllowedForAnAdministrator() throws Exception {
        createProfile();

        mockMvc.perform(get("/api/students").with(admin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    private void createProfile() throws Exception {
        mockMvc.perform(post("/api/students/me")
                        .with(student(STUDENT_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Ada Lovelace\","
                                + "\"grade\":\"8\"}"))
                .andExpect(status().isCreated());
    }

    private RequestPostProcessor student(String identityUserId) {
        return jwt()
                .jwt(builder -> builder.claim("userId", identityUserId))
                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT"));
    }

    private RequestPostProcessor admin() {
        return jwt()
                .jwt(builder -> builder.claim("userId", "admin-1"))
                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}
