import { Component } from '@angular/core';
import { RecipeService } from './shared/services/recipe.service';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'family-cook-book';

  showSite: boolean = false;

  constructor(private recipeService: RecipeService, private AuthService: AuthService) {}

  ngOnInit(): void {
    this.recipeService.fetchRecipes().subscribe();
    this.AuthService.autoLogin();

    let introSequenceCheck = localStorage.getItem("hasSeenIntro");
    if(!introSequenceCheck){
      setTimeout(() => {
        this.showSite = true;
        localStorage.setItem("hasSeenIntro", "true")
      }, 3000);
    } else {
      this.showSite = true;
    }

  }


}
