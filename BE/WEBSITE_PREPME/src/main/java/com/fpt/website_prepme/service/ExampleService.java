package com.fpt.website_prepme.service;

import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.model.response.PageResponse;
import com.fpt.website_prepme.mapper.ExampleMapper;
import com.fpt.website_prepme.model.entity.ExampleEntity;
import com.fpt.website_prepme.repository.ExampleRepository;
import com.fpt.website_prepme.model.dto.ExampleRequest;
import com.fpt.website_prepme.model.dto.ExampleResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExampleService {

    private final ExampleRepository exampleRepository;
    private final ExampleMapper exampleMapper;

    @Transactional
    public ExampleResponse create(ExampleRequest request) {
        if (exampleRepository.existsByCode(request.getCode())) {
            throw new AppException(ErrorCode.EXAMPLE_ALREADY_EXISTS,
                    "Code '%s' already exists".formatted(request.getCode()));
        }

        ExampleEntity entity = exampleMapper.toEntity(request);
        ExampleEntity saved = exampleRepository.save(entity);
        log.info("[Example] Created id={}, code={}", saved.getId(), saved.getCode());
        return exampleMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<ExampleResponse>> findAll(String keyword, Pageable pageable) {
        Page<ExampleResponse> page;

        if (keyword != null && !keyword.isBlank()) {
            page = exampleRepository.searchByKeyword(keyword.trim(), pageable)
                    .map(exampleMapper::toResponse);
        } else {
            page = exampleRepository.findAllByIsDeletedFalse(pageable)
                    .map(exampleMapper::toResponse);
        }

        return PageResponse.of(page);
    }

    @Transactional(readOnly = true)
    public ExampleResponse findById(Long id) {
        ExampleEntity entity = exampleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAMPLE_NOT_FOUND,
                        "Example not found with id: " + id));
        return exampleMapper.toResponse(entity);
    }

    @Transactional
    public ExampleResponse update(Long id, ExampleRequest request) {
        ExampleEntity entity = exampleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAMPLE_NOT_FOUND,
                        "Example not found with id: " + id));

        if (exampleRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new AppException(ErrorCode.EXAMPLE_ALREADY_EXISTS,
                    "Code '%s' already exists".formatted(request.getCode()));
        }

        exampleMapper.partialUpdate(request, entity);
        ExampleEntity saved = exampleRepository.save(entity);
        log.info("[Example] Updated id={}", saved.getId());
        return exampleMapper.toResponse(saved);
    }

    @Transactional
    public ExampleResponse patch(Long id, ExampleRequest request) {
        return update(id, request);
    }

    @Transactional
    public void delete(Long id) {
        ExampleEntity entity = exampleRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAMPLE_NOT_FOUND,
                        "Example not found with id: " + id));
        entity.softDelete();
        exampleRepository.save(entity);
        log.info("[Example] Soft-deleted id={}", id);
    }

    @Transactional
    public ExampleResponse restore(Long id) {
        ExampleEntity entity = exampleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAMPLE_NOT_FOUND,
                        "Example not found with id: " + id));
        entity.restore();
        ExampleEntity saved = exampleRepository.save(entity);
        log.info("[Example] Restored id={}", id);
        return exampleMapper.toResponse(saved);
    }
}
