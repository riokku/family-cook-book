import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { SupaService } from '../shared/services/supa.service';

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

  constructor(
    private supaService: SupaService,
    private router: Router
  ){}

  async ngOnInit() {
    let loggedInUser = await this.supaService.getLoggedInUser();
    if(loggedInUser){
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }

  }

  onSwitchMode(){
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm){

    if(!form.valid){
      return;
    }


    this.isLoading = true;

    const email = form.value.email;
    const password = form.value.password;

    if(this.isLoginMode){
      this.supaService.signIn(email, password).then((res) => {
        if(res.data.user.role === "authenticated"){
         this.isLoading = false;
         this.isLoggedIn = true;
         this.router.navigate(['/admin']);
        } else {
          this.isLoading = false;
          this.isLoggedIn = true;
          this.router.navigate(['/recipes']);
        }
      }).catch((err) => {
        console.log(err);
      });
    } else {
      this.supaService.signUp(email, password).then((res) => {
        console.log(res);
        if(res.data.user.role === "authenticated"){
          this.isLoading = false;
        }
      }).catch((err) => {
        console.log(err);
      });
    }

    form.reset();

  }

  logout(){
    this.supaService.logout();
    this.isLoggedIn = false;
  }

}
