import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthResponseData, AuthService } from '../shared/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit{

  isLoginMode: boolean = true;
  isLoading: boolean = false;
  error: string;
  isLoggedIn: boolean;

  constructor(private authService: AuthService, private router: Router){}


  ngOnInit(): void {
    this.isLoggedIn = this.authService.user ? false : true;
    console.log(this.isLoggedIn);
  }

  onSwitchMode(){
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm){
    if(!form.valid){
      return;
    }

    const email = form.value.email;
    const password = form.value.password;

    this.isLoading = true;

    let authObservable: Observable<AuthResponseData>;

    if(this.isLoginMode){
      authObservable = this.authService.login(email, password);
    } else {
      authObservable = this.authService.signUp(email, password);
    }

    authObservable.subscribe(resData => {
      console.log(resData);
      this.isLoading = false;
      this.router.navigate(['/admin']);
    }, errorMessage => {
      console.log(errorMessage);
      this.error = errorMessage;
      this.isLoading = false;
    })
    form.reset();
  }

  logout(){
    this.authService.logout();
    this.isLoggedIn = false;
  }

}
