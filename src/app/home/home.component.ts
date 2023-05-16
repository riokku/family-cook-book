import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{

  introSequence: boolean = true;

  ngOnInit(): void {
    let introSequenceCheck = localStorage.getItem("hasSeenIntro");
    if(!introSequenceCheck){
      setTimeout(() => {
        this.introSequence = false;
      }, 3000);
    } else {
      this.introSequence = false;
    }

  }

}
