package com.fpt.website_prepme.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "files")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileEntity extends BaseEntity {

  private String title;

  @Column(nullable = false)
  private String fileName;

  @Column(nullable = false)
  private String url;

  @Column(nullable = false)
  private LocalDateTime uploadedAt;

  private String publicId;

  private String type;

  private String category;
}
