import { Injectable } from '@angular/core';
import { GoogleAuthProvider } from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from "@angular/common/http";
import { map, tap } from "rxjs";

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  constructor(public angularFireAuth: AngularFireAuth, private http: HttpClient) {}

  googleSignIn(){
    return this.angularFireAuth.signInWithPopup(new GoogleAuthProvider).then(res => {
      localStorage.setItem('loggedInUserID', JSON.stringify(res.user?.uid));
    }, err => {
      console.log(err.message);
    })
  }

  getApprovedUsersList(){
    return fetch('https://family-cook-book-b02f5-default-rtdb.firebaseio.com/approved-users.json')
    .then(response => response.json())
    .then(data => {
      if(localStorage.getItem('loggedInUserID') == JSON.stringify(data.uid)){
        localStorage.setItem("userApproved", "true");
      } else {
        console.log('Not an approved user.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

}
