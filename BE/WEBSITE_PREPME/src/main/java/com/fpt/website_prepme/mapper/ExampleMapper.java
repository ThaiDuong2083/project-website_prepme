package com.fpt.website_prepme.mapper;

import com.fpt.website_prepme.model.entity.ExampleEntity;
import com.fpt.website_prepme.model.dto.ExampleRequest;
import com.fpt.website_prepme.model.dto.ExampleResponse;
import org.mapstruct.*;
import org.mapstruct.Builder;

import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS,
        builder = @Builder(disableBuilder = true)
)
public interface ExampleMapper {

    ExampleResponse toResponse(ExampleEntity example);

    List<ExampleResponse> toResponseList(List<ExampleEntity> examples);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)

    @Mapping(target = "status", defaultExpression = "java(com.fpt.website_prepme.model.entity.ExampleEntity.ExampleStatus.ACTIVE)")
    ExampleEntity toEntity(ExampleRequest request);


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)

    void partialUpdate(ExampleRequest request, @MappingTarget ExampleEntity example);
}
