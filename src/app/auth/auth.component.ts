import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SupaService } from '../shared/services/supa.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    standalone: false
})
export class AuthComponent implements OnInit {

  isLoginMode = true;
  isLoading = false;
  error: string | null = null;
  signUpSuccess = false;
  isLoggedIn = false;

  constructor(
    private supaService: SupaService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = await this.supaService.getLoggedInUser();
    this.isLoggedIn = !!user;
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
    this.signUpSuccess = false;
  }

  async onSubmit(form: NgForm) {
    if (!form.valid) return;

    this.isLoading = true;
    this.error = null;

    const { email, password } = form.value;

    if (this.isLoginMode) {
      const { data, error } = await this.supaService.signIn(email, password);
      this.isLoading = false;

      if (error) {
        this.error = this.friendlyError(error.message);
        return;
      }

      form.reset();
      this.isLoggedIn = true;
      const isAdmin = await this.supaService.checkAdminStatus();
      this.router.navigate([isAdmin ? '/admin' : '/recipes']);

    } else {
      const { data, error } = await this.supaService.signUp(email, password);
      this.isLoading = false;

      if (error) {
        this.error = this.friendlyError(error.message);
        return;
      }

      form.reset();
      this.signUpSuccess = true;
    }
  }

  private friendlyError(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Please confirm your email address before signing in.';
    }
    if (lower.includes('user already registered') || lower.includes('already been registered')) {
      return 'An account with this email already exists. Try logging in instead.';
    }
    if (lower.includes('password should be at least') || lower.includes('weak password')) {
      return 'Password must be at least 6 characters.';
    }
    if (lower.includes('unable to validate email') || lower.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (lower.includes('rate limit') || lower.includes('too many requests')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    return message;
  }

  logout() {
    this.supaService.logout();
    this.isLoggedIn = false;
  }
}
