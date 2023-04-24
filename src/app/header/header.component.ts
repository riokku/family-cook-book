import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  closeNavOnClick() {
    let element: HTMLElement = document.getElementsByClassName("navbar-toggler")[0] as HTMLElement;
    if (element.getAttribute('aria-expanded') == 'true' ) {
        element.click();
    }
  }

}
