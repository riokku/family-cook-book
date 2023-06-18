import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { RecipeService } from '../../shared/services/recipe.service';
import { Ingredient } from 'src/app/shared/models/ingredient.model';
import { Step } from 'src/app/shared/models/step.model';
import { Recipe } from 'src/app/shared/models/recipe.model';

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
  editingRecipe: Recipe;

  recipeName: string;
  recipeSlug: string;
  recipeAuthor: string;
  link: string;
  recipeDescription: string;
  recipePrepTime: number;
  recipeCookTime: number;
  recipeChillTime: number;
  recipeTotalime: number;
  recipeServingSize: number;
  recipeFeatured: boolean;
  recipeImagePath: string;
  recipeIngredientsArray: Ingredient[];
  recipeStepsArray: Step[];
  recipeTags: string[];
  recipeCreated: Date;
  recipeNotes: string;

  ingredientAmountOptions: string[] = ["1/4", "1/2", "3/4", "1", "1 1/4", "1 1/2", "1 3/4", "2", "2 1/4", "2 1/2", "2 3/4", "3"];
  ingredientAmountTypeOptions: string[] = ["Cups", "Teaspoons (tsp)", "Tablespoons (tbsp)", "Fluid ounces (fl oz)", "Pints (pt)", "Quarts (qt)", "Milliliters (ml)", "Liters (l)", "Grams (g)", "Kilograms (kg)", "Ounces (oz)", "Pounds (lb)", "Count"];
  recipeTagOptions: string[] = ["Appetizer", "Dinner", "Cast iron", "Beverage", "Breakfast", "Dessert", "Cookies", "Grilling", "Italian", "Mexican", "Salad", "Seafood", "Soup"];

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

    this.editingRecipe = this.recipeService.getRecipe(this.editedSlug);

    console.log(this.editingRecipe.id);

    this.recipeName = this.editingRecipe.name;
    this.slugInput = this.editingRecipe.name;
    this.updateSlug();
    this.recipeSlug = this.editingRecipe.slug;
    this.recipeAuthor = this.editingRecipe.author;
    this.link = this.editingRecipe.link;
    this.recipeDescription = this.editingRecipe.description;
    this.recipePrepTime = this.editingRecipe.prepTime;
    this.recipeCookTime = this.editingRecipe.cookTime;
    this.recipeChillTime = this.editingRecipe.chillTime;
    this.recipeTotalime = this.editingRecipe.totalTime;
    this.recipeServingSize = this.editingRecipe.servingSize;
    this.recipeFeatured = this.editingRecipe.featured;
    this.recipeImagePath = this.editingRecipe.imagePath;
    this.recipeIngredientsArray = this.editingRecipe.ingredients;
    this.recipeStepsArray = this.editingRecipe.steps;
    this.recipeTags = this.editingRecipe.tags;
    this.recipeCreated = this.editingRecipe.created;
    this.recipeNotes = this.editingRecipe.notes;

    this.editRecipeForm = new FormGroup({
      'name': new FormControl(this.recipeName, Validators.required),
      'slug': new FormControl(this.recipeSlug, Validators.required),
      'author': new FormControl(this.recipeAuthor, Validators.required),
      'link': new FormControl(this.link),
      'description': new FormControl(this.recipeDescription, Validators.required),
      'prepTime': new FormControl(this.recipePrepTime),
      'cookTime': new FormControl(this.recipeCookTime),
      'chillTime': new FormControl(this.recipeChillTime),
      'totalTime': new FormControl(this.recipeTotalime, Validators.required),
      'servingSize': new FormControl(this.recipeServingSize, Validators.required),
      'featured': new FormControl(this.recipeFeatured),
      'imagePath': new FormControl(this.recipeImagePath),
      'ingredients': new FormArray(this.recipeIngredientsArray.map(ingredient => new FormGroup({
        'ingredientName': new FormControl(ingredient.ingredientName, Validators.required),
        'ingredientAmount': new FormControl(ingredient.ingredientAmount, Validators.required),
        'ingredientMeasurementType': new FormControl(ingredient.ingredientMeasurementType, Validators.required)
      }))),
      'steps':  new FormArray(this.recipeStepsArray.map(step => new FormGroup({
        'step': new FormControl(step.step, Validators.required)
      }))),
      'tags': new FormControl(this.recipeTags, Validators.required),
      'created': new FormControl(this.recipeCreated, Validators.required),
      'notes': new FormControl(this.recipeNotes)
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

  onSaveChanges() {
    this.recipeService.saveRecipeChanges(this.editRecipeForm.value, this.editingRecipe.id);
    this.editRecipeForm.reset();
    //this.router.navigate(['/admin']);
  }

  onCancel() {
    this.router.navigate(['/admin']);
  }
}
