package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.dto.UserDTO;
import com.fpt.website_prepme.model.dto.auth.AuthResponse;
import com.fpt.website_prepme.model.dto.auth.GoogleAuthRequest;
import com.fpt.website_prepme.model.dto.auth.LoginRequest;
import com.fpt.website_prepme.model.dto.auth.RegisterRequest;

public interface AuthService {
  AuthResponse register(RegisterRequest request);
  AuthResponse login(LoginRequest request);
  AuthResponse loginWithGoogle(GoogleAuthRequest request);
  UserDTO getMe();
}
