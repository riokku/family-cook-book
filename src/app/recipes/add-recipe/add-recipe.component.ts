import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { RecipeService } from '../../shared/services/recipe.service';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss']
})

export class AddRecipeComponent implements OnInit {

  slugInput: string;
  slugOutput: string;

  recipeForm: FormGroup;

  ingredientAmountOptions: string[] = ["1/4", "1/2", "3/4", "1", "1 1/4", "1 1/2", "1 3/4", "2", "2 1/4", "2 1/2", "2 3/4", "3"];
  ingredientAmountTypeOptions: string[] = ["Cups", "Teaspoons (tsp)", "Tablespoons (tbsp)", "Fluid ounces (fl oz)", "Pints (pt)", "Quarts (qt)", "Milliliters (ml)", "Liters (l)", "Grams (g)", "Kilograms (kg)", "Ounces (oz)", "Pounds (lb)", "Count"];
  recipeTagOptions: string[] = ["Appetizers", "Beverages", "Breakfast", "Brunch", "Desserts", "Dinner", "Grilling", "Healthy", "Italian", "Mexican", "Salad", "Seafood", "Soup", "Vegan", "Vegetarian"];

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private router: Router,
  ) {}

  get recipeIngredientControls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  get recipeStepsControls() {
    return (this.recipeForm.get('steps') as FormArray).controls;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  updateSlug(){
    this.slugOutput = this.slugInput.replaceAll(" ", "-").toLowerCase().trim();
  }

  private initializeForm(){
    let recipeName = '';
    let recipeSlug = '';
    let recipeDescription = '';
    let recipeCookTime;
    let recipeServingSize;
    let recipeFeatured;
    let recipeImagePath = '';
    let recipeIngredientsArray = new FormArray([]);
    let recipeStepsArray = new FormArray([]);
    let recipeTags: string[] = [];

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'slug': new FormControl(recipeSlug, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'cookTime': new FormControl(recipeCookTime, Validators.required),
      'servingSize': new FormControl(recipeServingSize, Validators.required),
      'featured': new FormControl(recipeFeatured),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'ingredients': recipeIngredientsArray,
      'steps': recipeStepsArray,
      'tags': new FormControl(recipeTags, Validators.required)
    });

  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        'ingredientName': new FormControl(null, Validators.required),
        'ingredientAmount': new FormControl(null, Validators.required),
        'ingredientMeasurementType': new FormControl(null, Validators.required)
      })
    );
  }

  onAddStep() {
    (<FormArray>this.recipeForm.get('steps')).push(
      new FormGroup({
        'step': new FormControl(null, Validators.required)
      })
    );
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  onDeleteStep(index: number) {
    (<FormArray>this.recipeForm.get('steps')).removeAt(index);
  }

  onSubmit() {
    this.recipeService.submitRecipe(this.recipeForm.value);
    this.recipeForm.reset();
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
