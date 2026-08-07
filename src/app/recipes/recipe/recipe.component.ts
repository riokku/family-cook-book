import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { SupaService } from 'src/app/shared/services/supa.service';

@Component({
    selector: 'app-recipe',
    templateUrl: './recipe.component.html',
    styleUrls: ['./recipe.component.scss'],
    standalone: false
})

export class RecipeComponent implements OnInit {

    recipe: Recipe;
    slug: string;
    isDoubled: boolean = false;
    isAdmin: boolean = false;

    constructor(
      private supaService: SupaService,
      private route: ActivatedRoute,
      private titleService: Title
    ){}

    ngOnInit(): void {
      this.route.params.subscribe(
        (params: Params) => {
           this.slug = params['slug'];
           this.recipe = this.supaService.getRecipe(this.slug);
        }
      );
      this.titleService.setTitle(`Gogo's Kitchen | ${this.recipe.name}`);
      this.supaService.checkAdminStatus().then(isAdmin => {
        this.isAdmin = isAdmin;
      });
    }

    toggleDouble(){
      this.isDoubled = !this.isDoubled;
    }

}
