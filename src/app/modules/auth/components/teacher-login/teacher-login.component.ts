import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type LoginMethodType = 'email' | 'school' | 'phone' | 'google';

@Component({
  selector: 'app-teacher-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './teacher-login.component.html',
  styleUrls: ['./teacher-login.component.scss'],
  // Change to Emulated for better CSS isolation
  encapsulation: ViewEncapsulation.Emulated
})
export class TeacherLoginComponent {
  loginForm: FormGroup;
  twoFactorForm: FormGroup;
  showTwoFactor = false;
  multiDeviceAlert = false;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  loginMethod: LoginMethodType = 'email';

  loginMethods = [
    { id: 'email' as const, label: 'Email' },
    { id: 'school' as const, label: 'School ID' },
    { id: 'phone' as const, label: 'Phone' },
    { id: 'google' as const, label: 'Google' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.email]],
      password: ['', [Validators.minLength(8)]],
      schoolId: [''],
      phone: ['']
    });

    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  goBack() {
    window.history.back();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        // Handle different login methods
        switch (this.loginMethod) {
          case 'email':
            this.handleEmailLogin();
            break;
          case 'school':
            this.handleSchoolLogin();
            break;
          case 'phone':
            this.handlePhoneLogin();
            break;
          case 'google':
            this.loginWithGoogle();
            break;
        }
      } catch (error) {
        this.errorMessage = 'Login failed. Please try again.';
        this.isLoading = false;
      }
    }
  }

  private handleEmailLogin() {
    // Implement email login logic
    setTimeout(() => {
      this.showTwoFactor = true;
      this.isLoading = false;
    }, 1000);
  }

  private handleSchoolLogin() {
    // Implement school login logic
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
      this.isLoading = false;
    }, 1000);
  }

  private handlePhoneLogin() {
    // Implement phone login logic
    setTimeout(() => {
      this.showTwoFactor = true;
      this.isLoading = false;
    }, 1000);
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

  verifyTwoFactor() {
    if (this.twoFactorForm.valid) {
      this.isLoading = true;
      // Simulate 2FA verification
      setTimeout(() => {
        this.multiDeviceAlert = true;
        this.isLoading = false;
      }, 1000);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  forgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }
}