package com.fpt.website_prepme.service;

import com.fpt.website_prepme.model.dto.UserDTO;

public interface UserService {
    boolean checkPhone();
    UserDTO updatePhone(String phone);
    UserDTO incrementVisit();
}
