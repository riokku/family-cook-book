import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Recipe } from '../shared/models/recipe.model';


import { RecipeService } from '../shared/services/recipe.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {

  recipes: any[] = [];

  constructor(private http: HttpClient, private recipeService: RecipeService) {}


  ngOnInit(): void {


    this.recipeService.fetchRecipes().subscribe((resRecipes) => {
      this.recipes = resRecipes;
    });

  }

  testRecipes: Recipe[] = [
    {
      name: "Pizza",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      imagePath: "https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F19%2F2014%2F07%2F10%2Fpepperoni-pizza-ck-x.jpg&q=60",
      ingredients: [
        {
          name: "Crust",
          amount: 1,
          measurementType: "Quantity"
        }
      ],
      cookTime: 30,
      servingSize: 6,
      featured: true
    },
    {
      name: "Doughnuts",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      imagePath: "https://idsb.tmgrup.com.tr/ly/uploads/images/2021/06/06/119434.jpeg",
      ingredients: [
        {
          name: "Flour",
          amount: 2,
          measurementType: "Cups"
        }
      ],
      cookTime: 45,
      servingSize: 8,
      featured: true
    },
    {
      name: "Salad",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      imagePath: "https://www.acouplecooks.com/wp-content/uploads/2019/05/Chopped-Salad-001_1.jpg",
      ingredients: [
        {
          name: "Lettuce",
          amount: 2,
          measurementType: "Heads"
        }
      ],
      cookTime: 15,
      servingSize: 2,
      featured: true
    },
    {
      name: "Pizza",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      imagePath: "https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F19%2F2014%2F07%2F10%2Fpepperoni-pizza-ck-x.jpg&q=60",
      ingredients: [
        {
          name: "Crust",
          amount: 1,
          measurementType: "Quantity"
        }
      ],
      cookTime: 30,
      servingSize: 6,
      featured: false
    },
    {
      name: "Doughnuts",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      imagePath: "https://idsb.tmgrup.com.tr/ly/uploads/images/2021/06/06/119434.jpeg",
      ingredients: [
        {
          name: "Flour",
          amount: 2,
          measurementType: "Cups"
        }
      ],
      cookTime: 45,
      servingSize: 8,
      featured: true
    },
    {
      name: "Salad",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      imagePath: "https://www.acouplecooks.com/wp-content/uploads/2019/05/Chopped-Salad-001_1.jpg",
      ingredients: [
        {
          name: "Lettuce",
          amount: 2,
          measurementType: "Heads"
        }
      ],
      cookTime: 15,
      servingSize: 2,
      featured: true
    }
  ]
}
