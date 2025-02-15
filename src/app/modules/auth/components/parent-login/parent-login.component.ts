import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-parent-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './parent-login.component.html',
  styleUrls: ['./parent-login.component.scss']
})
export class ParentLoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  otpForm: FormGroup;
  showOtpInput = false;
  resendTimer = 30;
  canResendOtp = false;
  isListening = false;
  isLoading = false;
  errorMessage = '';
  loginMethod: 'mobile' | 'google' | 'facebook' | 'school' | 'voice' = 'mobile';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      schoolId: ['']
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnInit() {
    // Try to initialize WebOTP API
    this.initWebOTP();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.isListening) {
      this.stopVoiceRecognition();
    }
  }

  async initWebOTP() {
    if ('OTPCredential' in window) {
      try {
        const abortController = new AbortController();
        // Use the proper type for credential options
        const credential = await navigator.credentials.get({
          signal: abortController.signal,
          // @ts-ignore - WebOTP API is not fully typed yet
          otp: { transport: ['sms'] }
        }) as any;
        
        if (credential && credential.code) {
          this.otpForm.patchValue({ otp: credential.code });
        }
      } catch (err) {
        console.log('WebOTP API error:', err);
      }
    }
  }

  onLoginMethodChange(method: 'mobile' | 'google' | 'facebook' | 'school' | 'voice') {
    this.loginMethod = method;
    if (method === 'voice') {
      this.startVoiceRecognition();
    } else if (method === 'google') {
      this.loginWithGoogle();
    } else if (method === 'facebook') {
      this.loginWithFacebook();
    }
  }

  async startVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        if (transcript.includes('login to edupal')) {
          // Implement voice login logic
          console.log('Voice command recognized');
        }
      };

      recognition.start();
      this.isListening = true;
    }
  }

  stopVoiceRecognition() {
    // Implement stop voice recognition
    this.isListening = false;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      if (this.loginMethod === 'mobile') {
        const mobileNumber = this.loginForm.get('mobileNumber')?.value;
        this.authService.sendOtp(mobileNumber).subscribe({
          next: (success) => {
            if (success) {
              this.showOtpInput = true;
              this.startResendTimer();
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = 'Failed to send OTP. Please try again.';
            this.isLoading = false;
          }
        });
      } else if (this.loginMethod === 'school') {
        const schoolId = this.loginForm.get('schoolId')?.value;
        this.authService.verifySchoolId(schoolId).subscribe({
          next: (success) => {
            if (success) {
              this.router.navigate(['/dashboard']);
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = 'Invalid School ID. Please try again or contact admin.';
            this.isLoading = false;
          }
        });
      }
    }
  }

  async loginWithGoogle() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Google login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithFacebook() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.authService.loginWithFacebook();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Facebook login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  startResendTimer() {
    this.canResendOtp = false;
    this.resendTimer = 30;
    timer(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.resendTimer > 0) {
          this.resendTimer--;
        } else {
          this.canResendOtp = true;
        }
      });
  }

  resendOtp() {
    if (this.canResendOtp) {
      // Implement OTP resend logic
      this.startResendTimer();
    }
  }

  verifyOtp() {
    if (this.otpForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const mobileNumber = this.loginForm.get('mobileNumber')?.value;
      const otp = this.otpForm.get('otp')?.value;
      
      this.authService.verifyOtp(mobileNumber, otp).subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Invalid OTP. Please try again.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to verify OTP. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  resetPassword() {
    // Implement password reset logic
    console.log('Password reset requested');
  }

  contactSchoolAdmin() {
    // Implement school admin contact logic
    console.log('Contact school admin requested');
  }
}