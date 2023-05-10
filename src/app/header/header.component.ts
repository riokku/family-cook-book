import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{

  userAuthenticated: boolean = false;

  constructor(private AuthService: AuthService){}

  ngOnInit(): void {
    this.AuthService.user.subscribe(user => {
      this.userAuthenticated = !!user
    })
  }

  closeNavOnClick() {
    let element: HTMLElement = document.getElementsByClassName("navbar-toggler")[0] as HTMLElement;
    if (element.getAttribute("aria-expanded") == "true" ) {
        element.click();
    }
  }

}
