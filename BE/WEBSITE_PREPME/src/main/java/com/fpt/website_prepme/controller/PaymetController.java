package com.fpt.website_prepme.controller;

import com.fpt.website_prepme.model.request.MomoRequest;
import com.fpt.website_prepme.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymetController {

  private final PaymentService paymentService;

  //MOMO
  @PostMapping()
  public ResponseEntity<String> momoPayment(@RequestBody MomoRequest paymentRequest) {
    String response = paymentService.createPaymentRequest(paymentRequest.getAmount());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/order-status/{orderId}")
  public ResponseEntity<String> checkPaymentStatus(@PathVariable String orderId) {
    String response = paymentService.checkPaymentStatus(orderId);
    return ResponseEntity.ok(response);
  }
}
