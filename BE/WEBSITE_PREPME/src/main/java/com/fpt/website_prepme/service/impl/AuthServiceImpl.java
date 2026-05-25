package com.fpt.website_prepme.service.impl;

import com.fpt.website_prepme.enums.AuthProvider;
import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.dto.auth.AuthResponse;
import com.fpt.website_prepme.model.dto.auth.GoogleAuthRequest;
import com.fpt.website_prepme.model.dto.auth.LoginRequest;
import com.fpt.website_prepme.model.dto.auth.RegisterRequest;
import com.fpt.website_prepme.security.CustomUserDetails;
import com.fpt.website_prepme.model.dto.UserDTO;
import com.fpt.website_prepme.security.JwtUtil;
import com.fpt.website_prepme.model.entity.RoleEntity;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.repository.RoleRepository;
import com.fpt.website_prepme.repository.UserRepository;
import com.fpt.website_prepme.service.AuthService;
import com.fpt.website_prepme.utils.AppConstant;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        String username = generateUsername(request.getPhone());
        UserEntity user = UserEntity.builder()
                .username(username)
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .provider(AuthProvider.LOCAL)
                .roles(new HashSet<>(Set.of(getOrCreateUserRole())))
                .build();
        userRepository.save(user);
        log.info("[Auth] Đăng ký LOCAL thành công - phone={}", request.getPhone());
        return buildAuthResponse(user);
    }


    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getPhone(), request.getPassword())
        );

        UserEntity user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        log.info("[Auth] Đăng nhập LOCAL thành công - userId={}", user.getId());
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        GoogleIdToken.Payload payload = verifyGoogleToken(request.getIdToken());
        String googleId  = payload.getSubject();
        String email     = payload.getEmail();
        String fullName  = (String) payload.get("name");
        String avatarUrl = (String) payload.get("picture");

        UserEntity user = userRepository.findByGoogleId(googleId).orElse(null);
        if (user == null && email != null) {
            user = userRepository.findByEmail(email)
                    .map(u -> linkGoogle(u, googleId, avatarUrl))
                    .orElse(null);
        }

        if (user == null) {
            user = createGoogleUser(googleId, email, fullName, avatarUrl);
        }
        log.info("[Auth] Đăng nhập GOOGLE thành công - userId={}", user.getId());
        return buildAuthResponse(user);
    }

    public UserDTO getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return UserDTO.toEntity(userDetails.user());
    }


    private GoogleIdToken.Payload verifyGoogleToken(String idTokenStr) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenStr);
            if (idToken == null) {
                throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }
            return idToken.getPayload();

        } catch (AppException e) {
            throw e;
        } catch (GeneralSecurityException | IOException e) {
            log.error("[Auth] Verify Google token thất bại: {}", e.getMessage());
            throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED, e);
        }
    }

    private UserEntity linkGoogle(UserEntity user, String googleId, String avatarUrl) {
        user.setGoogleId(googleId);
        if (user.getAvatarUrl() == null && avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        return userRepository.save(user);
    }

    private UserEntity createGoogleUser(String googleId, String email,
                                        String fullName, String avatarUrl) {
        String username = email != null
                ? generateUsernameFromEmail(email)
                : "google_" + googleId.substring(0, 8);

        UserEntity user = UserEntity.builder()
                .username(username)
                .email(email)
                .googleId(googleId)
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .provider(AuthProvider.GOOGLE)
                .roles(new HashSet<>(Set.of(getOrCreateUserRole())))
                .build();

        return userRepository.save(user);
    }

    private RoleEntity getOrCreateUserRole() {
        return roleRepository.findByName(AppConstant.ROLE_USER).orElseGet(() ->
                roleRepository.save(
                    RoleEntity.builder()
                        .name(AppConstant.ROLE_USER)
                        .description("Người dùng tiêu chuẩn")
                        .build()));
    }

    private AuthResponse buildAuthResponse(UserEntity user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken  = jwtUtil.generateAccessToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .expiresIn(accessTokenExpiration / 1000)
                .build();
    }

    private String generateUsername(String phone) {
        String suffix = phone.replaceAll("\\D", "");
        suffix = suffix.length() >= 5 ? suffix.substring(suffix.length() - 5) : suffix;
        String base = "user_" + suffix;
        String candidate = base;
        int i = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + "_" + i++;
        }
        return candidate;
    }

    private String generateUsernameFromEmail(String email) {
        String local = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_").toLowerCase();
        String candidate = local;
        int i = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = local + "_" + i++;
        }
        return candidate;
    }
}
