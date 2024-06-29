import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SupaService } from '../shared/services/supa.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{

  userAuthenticated: boolean = false;
  userIsAdmin: boolean = false;
  authSubscription: Subscription | undefined;

  constructor(
    private SupaService: SupaService,
    private changeRef: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.authSubscription = this.SupaService.authState$.subscribe((session) => {
      this.checkAdminStatus();
    });
  }

  closeNavOnClick() {
    let element: HTMLElement = document.getElementsByClassName("navbar-toggler")[0] as HTMLElement;
    if (element.getAttribute("aria-expanded") == "true" ) {
        element.click();
    }
  }

  checkAdminStatus(){
    this.SupaService.checkAdminStatus().then((result: boolean) => {
      if(result){
        this.userIsAdmin = true;
        this.changeRef.detectChanges();
      } else {
        this.userIsAdmin = false;
        this.changeRef.detectChanges();
      }
    });
  }

}
