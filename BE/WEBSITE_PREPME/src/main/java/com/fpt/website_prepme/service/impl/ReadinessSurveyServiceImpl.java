package com.fpt.website_prepme.service.impl;

import com.fpt.website_prepme.enums.SkillType;
import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.dto.survey.SurveyRequest;
import com.fpt.website_prepme.model.dto.survey.UpdateGoalsRequest;
import com.fpt.website_prepme.model.dto.survey.UserGoalsResponse;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.repository.UserRepository;
import com.fpt.website_prepme.security.CustomUserDetails;
import com.fpt.website_prepme.service.ReadinessSurveyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadinessSurveyServiceImpl implements ReadinessSurveyService {

    private final UserRepository userRepository;

    // ── submitSurvey ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public UserGoalsResponse submitSurvey(SurveyRequest request) {
        UserEntity user = getCurrentUser();

        user.setIeltsTarget(request.getIeltsTarget());
        user.setCurrentLevel(request.getCurrentLevel());
        user.setWeakSkills(request.getWeakSkills().stream()
                .map(Enum::name).collect(Collectors.joining(",")));
        user.setSurveyCompleted(true);
        userRepository.save(user);

        log.info("[Survey] User {} hoàn thành khảo sát", user.getId());
        return buildResponse(user);
    }

    // ── getSurveyGoals ───────────────────────────────────────────────────────

    @Override
    public UserGoalsResponse getSurveyGoals() {
        return buildResponse(getCurrentUser());
    }

    // ── updateGoals ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public UserGoalsResponse updateGoals(UpdateGoalsRequest request) {
        UserEntity user = getCurrentUser();

        if (request.getIeltsTarget() != null)  user.setIeltsTarget(request.getIeltsTarget());
        if (request.getCurrentLevel() != null) user.setCurrentLevel(request.getCurrentLevel());
        if (request.getWeakSkills() != null && !request.getWeakSkills().isEmpty()) {
            user.setWeakSkills(request.getWeakSkills().stream()
                    .map(Enum::name).collect(Collectors.joining(",")));
        }
        userRepository.save(user);
        log.info("[Survey] User {} cập nhật mục tiêu", user.getId());
        return buildResponse(user);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private UserGoalsResponse buildResponse(UserEntity user) {
        return UserGoalsResponse.builder()
                .ieltsTarget(user.getIeltsTarget())
                .currentLevel(user.getCurrentLevel())
                .weakSkills(parseWeakSkills(user.getWeakSkills()))
                .surveyCompleted(user.isSurveyCompleted())
                .build();
    }

    private UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails ud = (CustomUserDetails) auth.getPrincipal();
        return userRepository.findById(ud.user().getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private List<SkillType> parseWeakSkills(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        return Arrays.stream(raw.split(","))
                .map(String::trim).filter(s -> !s.isEmpty())
                .map(SkillType::valueOf)
                .collect(Collectors.toList());
    }
}
