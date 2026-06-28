package com.fpt.website_prepme.service.impl;

import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.dto.UserDTO;
import com.fpt.website_prepme.model.dto.UserVisitResponseDTO;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.model.entity.UserVisitEntity;
import com.fpt.website_prepme.repository.UserRepository;
import com.fpt.website_prepme.repository.UserVisitRepository;
import com.fpt.website_prepme.security.CustomUserDetails;
import com.fpt.website_prepme.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserVisitRepository userVisitRepository;

    private UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userRepository.findById(userDetails.user().getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    public boolean checkPhone() {
        UserEntity user = getCurrentUser();
        return user.getPhone() != null && !user.getPhone().trim().isEmpty();
    }

    @Override
    @Transactional
    public UserDTO updatePhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            throw new AppException(ErrorCode.PHONE_REQUIRED);
        }

        UserEntity currentUser = getCurrentUser();

        // If phone is already the same as current, just return
        if (phone.trim().equals(currentUser.getPhone())) {
            return UserDTO.toEntity(currentUser);
        }

        // Check if phone number is already registered by another user
        if (userRepository.existsByPhone(phone.trim())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        currentUser.setPhone(phone.trim());
        UserEntity savedUser = userRepository.save(currentUser);
        log.info("[UserService] Updated phone number for userId={} to {}", savedUser.getId(), phone);
        return UserDTO.toEntity(savedUser);
     }

    @Override
    @Transactional
    public UserDTO incrementVisit() {
        UserEntity currentUser = getCurrentUser();

        // Log individual visit
        UserVisitEntity visit = UserVisitEntity.builder()
                .user(currentUser)
                .build();
        userVisitRepository.save(visit);

        // Increment aggregate counter
        currentUser.setVisitCount(currentUser.getVisitCount() + 1);
        UserEntity savedUser = userRepository.save(currentUser);
        log.info("[UserService] Incremented visit count for userId={} to {}", savedUser.getId(), savedUser.getVisitCount());
        return UserDTO.toEntity(savedUser);
    }

    private UserVisitResponseDTO toResponseDTO(UserVisitEntity visit) {
        UserEntity user = visit.getUser();
        return UserVisitResponseDTO.builder()
                .id(visit.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .createdAt(visit.getCreatedAt())
                .build();
    }

    private LocalDateTime getStartDateTime(LocalDate startDate) {
        return startDate != null ? startDate.atStartOfDay() : null;
    }

    private LocalDateTime getEndDateTime(LocalDate endDate) {
        return endDate != null ? endDate.atTime(LocalTime.MAX) : null;
    }

    @Override
    public long getTotalVisits(LocalDate startDate, LocalDate endDate) {
        return userVisitRepository.countAllVisits(getStartDateTime(startDate), getEndDateTime(endDate));
    }

    @Override
    public org.springframework.data.domain.Page<UserVisitResponseDTO> getAllVisits(
            LocalDate startDate, LocalDate endDate, org.springframework.data.domain.Pageable pageable) {
        return userVisitRepository.findAllVisits(getStartDateTime(startDate), getEndDateTime(endDate), pageable)
                .map(this::toResponseDTO);
    }

    @Override
    public org.springframework.data.domain.Page<UserVisitResponseDTO> searchVisitsByUser(
            String phone, String email, String username,
            LocalDate startDate, LocalDate endDate, org.springframework.data.domain.Pageable pageable) {

        String p = (phone != null && !phone.trim().isEmpty()) ? phone.trim() : null;
        String e = (email != null && !email.trim().isEmpty()) ? email.trim() : null;
        String u = (username != null && !username.trim().isEmpty()) ? username.trim() : null;

        return userVisitRepository.findVisitsByUser(p, e, u, getStartDateTime(startDate), getEndDateTime(endDate), pageable)
                .map(this::toResponseDTO);
    }
}
