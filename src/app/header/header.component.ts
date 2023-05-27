import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{

  userAuthenticated: boolean = false;
  userIsAdmin: boolean = false;

  constructor(private AuthService: AuthService){}

  ngOnInit(): void {
    this.AuthService.user.subscribe(user => {
      this.userAuthenticated = !!user
    })

    this.checkAdminStatus();

  }

  closeNavOnClick() {
    let element: HTMLElement = document.getElementsByClassName("navbar-toggler")[0] as HTMLElement;
    if (element.getAttribute("aria-expanded") == "true" ) {
        element.click();
    }
  }

  checkAdminStatus(){
    this.AuthService.fetchData().then((result: boolean) => {
      if(result){
        this.userIsAdmin = true;
        console.log(this.userIsAdmin);
      }
    });
  }

}
