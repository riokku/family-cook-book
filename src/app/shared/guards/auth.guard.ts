import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { SupaService } from "../services/supa.service";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class AuthGuard  {

  constructor(
    private router: Router,
    private SupaService: SupaService
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    return this.SupaService.checkAdminStatus().then(isAdmin => {
      if (isAdmin) return true;
      return this.router.createUrlTree(['/auth']);
    });
  }

}
