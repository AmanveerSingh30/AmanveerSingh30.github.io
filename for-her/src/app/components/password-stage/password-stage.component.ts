import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-password-stage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-stage.component.html',
  styleUrls: ['./password-stage.component.scss']
})
export class PasswordStageComponent implements OnInit {
  @Output() passwordVerified = new EventEmitter<void>();
  name: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // This makes it harder for someone to discover the password by inspecting the code
  private readonly passwordHash: string = '3c8eb63e58137865ebe676a1bcf97bec069f574953217a2e1b24a4341b7be2db'; // Hash for '20032018until4ever'

  constructor() {}

  ngOnInit(): void {
    console.log('PasswordStageComponent initialized');
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Hash the input password and compare with stored hash
    this.hashPassword(this.password).then(hashedInput => {
      if (hashedInput === this.passwordHash) {
        console.log('Password verified successfully');

        // Send email with the entered name
        this.sendEmail();

        // After a short delay to show success animation
        setTimeout(() => {
          this.passwordVerified.emit();
          this.isLoading = false;
        }, 1000);      } else {
        console.log('Incorrect password');
        setTimeout(() => {
          this.errorMessage = 'Access denied. Please enter the correct password.';
          this.isLoading = false;
          this.password = '';
        }, 500);
      }
    });
  }

  // Convert string to SHA-256 hash
  private async hashPassword(text: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
  private sendEmail(): void {
    const userName = this.name.trim() || 'Guest';

    // Check if the application is running on localhost
    const isLocalhost = window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      console.log('Running on localhost - email sending skipped.');
      return; // Skip sending email on localhost
    }

    emailjs.send(
      'service_rlqs4xu',
      'template_da16nj4',
      {
        to_name: userName,
        message: `${userName} started the journey with correct password! 🎉`,
        user_name: userName // Adding user name as separate field for template
      },
      'mPTdzhE5izOpk9v7h'
    ).then((response) => {
      console.log('Email sent successfully!', response.status, response.text);
    }, (err) => {
      console.error('Failed to send email:', err);
    });
  }
}
