package com.fpt.website_prepme.service.impl;

import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.dto.UserDTO;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.repository.UserRepository;
import com.fpt.website_prepme.security.CustomUserDetails;
import com.fpt.website_prepme.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

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
}
