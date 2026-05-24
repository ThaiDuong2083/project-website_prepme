package com.fpt.website_prepme.security.service;

import com.fpt.website_prepme.security.CustomUserDetails;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByPhone(identifier)
                .orElseGet(() -> userRepository.findByUsername(identifier)
                    .orElseGet(() -> userRepository.findByEmail(identifier)
                        .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với định danh: " + identifier))));
        return new CustomUserDetails(user);
    }
}
