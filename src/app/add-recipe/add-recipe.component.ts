import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { RecipeService } from '../shared/services/recipe.service';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss']
})

export class AddRecipeComponent implements OnInit {

  recipeForm: FormGroup;

  constructor(private route: ActivatedRoute, private recipeService: RecipeService, private router: Router) {}

  get recipeControls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls
  }


  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(){
    let recipeName = '';
    let recipeDescription = '';
    let recipeCookTime;
    let recipeServingSize;
    let recipeFeatured;
    let recipeImagePath = '';
    let recipeIngredientsArray = new FormArray([]);

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'cookTime': new FormControl(recipeCookTime, Validators.required),
      'servingSize': new FormControl(recipeServingSize, Validators.required),
      'featured': new FormControl(recipeFeatured, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'ingredients': recipeIngredientsArray
    });

  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/)
        ]),
        'measurementType': new FormControl(null, Validators.required),
      })
    );
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  onSubmit() {
    alert('working')
    this.recipeService.submitRecipe(this.recipeForm.value);
    this.recipeForm.reset();
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
