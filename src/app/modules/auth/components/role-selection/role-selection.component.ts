import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selection.component.html',
  styleUrls: ['./role-selection.component.scss']
})
export class RoleSelectionComponent {
  selectedLanguage = 'English';
  isVoiceEnabled = false;
  
  constructor(private router: Router) {}

  selectRole(role: 'parent' | 'teacher') {
    localStorage.setItem('selectedRole', role);
    if (role === 'parent') {
      this.router.navigate(['/auth/parent-login']);
    } else {
      this.router.navigate(['/auth/teacher-login']);
    }
  }

  toggleLanguageSelect() {
    this.selectedLanguage = this.selectedLanguage === 'English' ? 'Hindi' : 'English';
  }

  toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    console.log(`Voice ${this.isVoiceEnabled ? 'enabled' : 'disabled'}`);
  }

  openHelp() {
    console.log('Help requested');
  }
}