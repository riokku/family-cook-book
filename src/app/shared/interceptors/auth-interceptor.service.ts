import { HttpHandler, HttpRequest, HttpInterceptor, HttpParams, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Observable, exhaustMap, take } from "rxjs";


@Injectable()

export class AuthInterceptorService implements HttpInterceptor{

  constructor(private AuthService: AuthService){}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return this.AuthService.user.pipe(
      take(1),
      exhaustMap(user => {
        console.log('Int WORKING YAY!');
        if(!user){
          console.log('Int did not find a user!')
          return next.handle(req);
        }
        const modifiedRequest = req.clone({
          params: new HttpParams().set('auth', user.token)
        });
        return next.handle(modifiedRequest);
      })
    )

  }

}
