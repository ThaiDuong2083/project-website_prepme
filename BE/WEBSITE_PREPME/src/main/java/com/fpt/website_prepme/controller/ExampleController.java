package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.response.ApiResponse;
import com.fpt.website_prepme.model.response.PageResponse;
import com.fpt.website_prepme.service.ExampleService;
import com.fpt.website_prepme.model.dto.ExampleRequest;
import com.fpt.website_prepme.model.dto.ExampleResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/examples")
@RequiredArgsConstructor
@Tag(name = "Example", description = "CRUD operations for Example resource")
@SecurityRequirement(name = "bearerAuth")
public class ExampleController {

    private final ExampleService exampleService;

    @GetMapping
    @Operation(summary = "Get all examples with pagination and optional keyword search")
    public ResponseEntity<ApiResponse<PageResponse<ExampleResponse>>> findAll(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") @Parameter(description = "0-based page number") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(exampleService.findAll(keyword, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get example by ID")
    public ResponseEntity<ApiResponse<ExampleResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(exampleService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Create new example")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExampleResponse>> create(
            @Valid @RequestBody ExampleRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.created(exampleService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Full update of example")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExampleResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ExampleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Updated successfully",
                exampleService.update(id, request)));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partial update of example")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExampleResponse>> patch(
            @PathVariable Long id,
            @RequestBody ExampleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Patched successfully",
                exampleService.patch(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete example")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        exampleService.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore soft-deleted example")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ExampleResponse>> restore(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Restored successfully",
                exampleService.restore(id)));
    }
}
