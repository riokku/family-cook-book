import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { RecipeService } from '../../shared/services/recipe.service';
import { Ingredient } from 'src/app/shared/models/ingredient.model';
import { Step } from 'src/app/shared/models/step.model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})

export class RecipeEditComponent implements OnInit {

  slugInput: string;
  slugOutput: string;

  editRecipeForm: FormGroup;
  editedSlug: string;

  recipeName: string;
  recipeSlug: string;
  recipeDescription: string;
  recipeCookTime: string;
  recipeServingSize: string;
  recipeFeatured: boolean;
  recipeImagePath: string;
  recipeIngredientsArray: Ingredient[];
  recipeStepsArray: Step[];
  recipeTags: string[];

  ingredientAmountOptions: string[] = ["1/4", "1/2", "3/4", "1", "1 1/4", "1 1/2", "1 3/4", "2", "2 1/4", "2 1/2", "2 3/4", "3"];
  ingredientAmountTypeOptions: string[] = ["Cups", "Teaspoons (tsp)", "Tablespoons (tbsp)", "Fluid ounces (fl oz)", "Pints (pt)", "Quarts (qt)", "Milliliters (ml)", "Liters (l)", "Grams (g)", "Kilograms (kg)", "Ounces (oz)", "Pounds (lb)", "Count"];
  recipeTagOptions: string[] = ["Appetizers", "Beverages", "Breakfast", "Brunch", "Desserts", "Dinner", "Grilling", "Healthy", "Italian", "Mexican", "Salad", "Seafood", "Soup", "Vegan", "Vegetarian"];

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private router: Router,
  ) {}

  get recipeIngredientControls() {
    return (this.editRecipeForm.get('ingredients') as FormArray).controls;
  }

  get recipeStepsControls() {
    return (this.editRecipeForm.get('steps') as FormArray).controls;
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.editedSlug = params['slug'];
        this.initializeForm();
      }
    )
  }

  updateSlug(){
    this.slugOutput = this.slugInput.replaceAll(" ", "-").toLowerCase().trim();
  }

  private initializeForm(){

    const editingRecipe = this.recipeService.getRecipe(this.editedSlug);

    this.recipeName = editingRecipe.name;
    this.slugInput = editingRecipe.name;
    this.updateSlug();
    this.recipeSlug = editingRecipe.slug;
    this.recipeDescription = editingRecipe.description;
    this.recipeCookTime = editingRecipe.cookTime;
    this.recipeServingSize = editingRecipe.servingSize;
    this.recipeFeatured = editingRecipe.featured;
    this.recipeImagePath = editingRecipe.imagePath;
    this.recipeIngredientsArray = editingRecipe.ingredients;
    this.recipeStepsArray = editingRecipe.steps;
    this.recipeTags = editingRecipe.tags;

    console.log(this.recipeName);

    this.editRecipeForm = new FormGroup({
      'name': new FormControl(this.recipeName, Validators.required),
      'slug': new FormControl(this.recipeSlug, Validators.required),
      'description': new FormControl(this.recipeDescription, Validators.required),
      'cookTime': new FormControl(this.recipeCookTime, Validators.required),
      'servingSize': new FormControl(this.recipeServingSize, Validators.required),
      'featured': new FormControl(this.recipeFeatured),
      'imagePath': new FormControl(this.recipeImagePath, Validators.required),
      'ingredients': new FormArray(this.recipeIngredientsArray.map(ingredient => new FormGroup({
        'ingredientName': new FormControl(ingredient.ingredientName, Validators.required),
        'ingredientAmount': new FormControl(ingredient.ingredientAmount, Validators.required),
        'ingredientMeasurementType': new FormControl(ingredient.ingredientMeasurementType, Validators.required)
      }))),
      'steps':  new FormArray(this.recipeStepsArray.map(step => new FormGroup({
        'step': new FormControl(step.step, Validators.required)
      }))),
      'tags': new FormControl(this.recipeTags, Validators.required)
    });

  }

  onAddIngredient() {
    (<FormArray>this.editRecipeForm.get('ingredients')).push(
      new FormGroup({
        'ingredientName': new FormControl(null, Validators.required),
        'ingredientAmount': new FormControl(null, Validators.required),
        'ingredientMeasurementType': new FormControl(null, Validators.required)
      })
    );
  }

  onAddStep() {
    (<FormArray>this.editRecipeForm.get('steps')).push(
      new FormGroup({
        'step': new FormControl(null, Validators.required)
      })
    );
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.editRecipeForm.get('ingredients')).removeAt(index);
  }

  onDeleteStep(index: number) {
    (<FormArray>this.editRecipeForm.get('steps')).removeAt(index);
  }

  onSubmit() {
    this.recipeService.submitRecipe(this.editRecipeForm.value);
    this.editRecipeForm.reset();
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
