import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { RecipeService } from 'src/app/shared/services/recipe.service';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss']
})

export class RecipeComponent implements OnInit {

    recipe: Recipe;
    slug: string;
    isDoubled: boolean = false;

    constructor(
      private recipeService: RecipeService,
      private route: ActivatedRoute
    ){}

    ngOnInit(): void {
      const slug = this.route.params.subscribe(
        (params: Params) => {
           this.slug = params['slug'];
           this.recipe = this.recipeService.getRecipe(this.slug);
        }
      )
    }

    toggleDouble(){
      this.isDoubled = !this.isDoubled;
      console.log(this.isDoubled);
    }

}
