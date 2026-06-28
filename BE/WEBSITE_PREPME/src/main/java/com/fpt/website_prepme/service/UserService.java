package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.dto.UserDTO;

public interface UserService {
    boolean checkPhone();
    UserDTO updatePhone(String phone);
    UserDTO incrementVisit();
    long getTotalVisits(java.time.LocalDate startDate, java.time.LocalDate endDate);

    org.springframework.data.domain.Page<com.fpt.website_prepme.model.dto.UserVisitResponseDTO> getAllVisits(
            java.time.LocalDate startDate, java.time.LocalDate endDate, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<com.fpt.website_prepme.model.dto.UserVisitResponseDTO> searchVisitsByUser(
            String phone, String email, String username,
            java.time.LocalDate startDate, java.time.LocalDate endDate, org.springframework.data.domain.Pageable pageable);
}
