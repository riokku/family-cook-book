import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { RecipeService } from '../../shared/services/recipe.service';
import { SupaService } from 'src/app/shared/services/supa.service';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss']
})

export class AddRecipeComponent implements OnInit {

  slugInput: string;
  slugOutput: string;

  recipeCreatedDate: Date;
  recipeForm: FormGroup;

  latestRecipeName: string;

  ingredientAmountOptions: string[] = ["1/4", "1/2", "3/4", "1", "1 1/4", "1 1/2", "1 3/4", "2", "2 1/4", "2 1/2", "2 3/4", "3", "3 1/4", "3 1/2", "3 3/4", "4", "4 1/4", "4 1/2", "4 3/4", "5", "5 1/4", "5 1/2", "5 3/4", "6", "6 1/4", "6 1/2", "6 3/4", "7", "7 1/4", "7 1/2", "7 3/4", "8", "8 1/4", "8 1/2", "8 3/4"];
  ingredientAmountTypeOptions: string[] = ["Cups", "Teaspoons (tsp)", "Tablespoons (tbsp)", "Fluid ounces (fl oz)", "Pints (pt)", "Quarts (qt)", "Milliliters (ml)", "Liters (l)", "Grams (g)", "Kilograms (kg)", "Ounces (oz)", "Pounds (lb)", "Count"];
  recipeTagOptions: string[] = ["Appetizer", "Dinner", "Cast iron", "Beverage", "Breakfast", "Dessert", "Cookies", "Grilling", "Italian", "Mexican", "Salad", "Seafood", "Soup"];

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private supaService: SupaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    console.log(this.recipeForm);

  }

  private initializeForm(){
    let recipeName = '';
    let recipeSlug = '';
    let recipeAuthor = '';
    let link = '';
    let recipeDescription = '';
    let recipePrepTime;
    let recipeCookTime;
    let recipeChillTime;
    let recipeTotalTime;
    let recipeServingSize;
    let recipeFeatured;
    let recipeImagePath = '';
    let recipeIngredientsGroupArray = new FormArray([this.createIngredientGroup()]);
    let recipeStepsArray = new FormArray([]);
    let recipeTags: string[] = [];
    this.recipeCreatedDate = new Date();
    let recipeNotes: string;

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'slug': new FormControl(recipeSlug, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'author': new FormControl(recipeAuthor, Validators.required),
      'link': new FormControl(link),
      'prep_time': new FormControl(recipePrepTime),
      'cook_time': new FormControl(recipeCookTime),
      'chill_time': new FormControl(recipeChillTime),
      'total_time': new FormControl(recipeTotalTime, Validators.required),
      'serving_size': new FormControl(recipeServingSize, Validators.required),
      'featured': new FormControl(recipeFeatured),
      'image_path': new FormControl(recipeImagePath),
      'ingredient_groups': recipeIngredientsGroupArray,
      'steps': recipeStepsArray,
      'tags': new FormControl(recipeTags, Validators.required),
      'created': new FormControl(this.recipeCreatedDate, Validators.required),
      'notes': new FormControl(recipeNotes)
    });
  }

  //Create slug used for URL

  updateSlug(){
    this.slugOutput = this.slugInput.replaceAll(" ", "-").toLowerCase().trim();
  }

  //Add/remove steps

  get recipeStepsControls() {
    return (this.recipeForm.get('steps') as FormArray).controls;
  }

  onAddStep() {
    (<FormArray>this.recipeForm.get('steps')).push(
      new FormGroup({
        'step': new FormControl(null, Validators.required)
      })
    );
  }

  onDeleteStep(index: number) {
    (<FormArray>this.recipeForm.get('steps')).removeAt(index);
  }


  //Add/remove Ingredient Groups

  get recipeIngredientGroupControls() {
    return this.recipeForm.get('ingredient_groups') as FormArray;
  }

  addIngredientGroup(): void {
    this.recipeIngredientGroupControls.push(this.createIngredientGroup());
  }

  createIngredientGroup(): FormGroup {
    return new FormGroup({
      'ingredientGroupName': new FormControl(null, Validators.required),
      'ingredients': new FormArray([this.createIngredient()])
    });
  }

  deleteIngredientGroup(index: number): void {
    this.recipeIngredientGroupControls.removeAt(index);
  }

  //Add/remove Ingredients

  getIngredients(layerIndex: number): FormArray {
    return (this.recipeIngredientGroupControls.at(layerIndex) as FormGroup).get('ingredients') as FormArray;
  }

  addIngredient(layerIndex: number): void {
    const fields = this.getIngredients(layerIndex);
    fields.push(this.createIngredient());
  }

  createIngredient(): FormGroup {
    return new FormGroup({
      'ingredientName': new FormControl(null, Validators.required),
      'ingredientAmount': new FormControl(null, Validators.required),
      'ingredientMeasurementType': new FormControl(null, Validators.required)
    })
  }

  deleteIngredient(ingredientGroupIndex: number, ingredientIndex: number): void {
    const fields = this.getIngredients(ingredientGroupIndex);
    fields.removeAt(ingredientIndex);
  }


  //Form actions

  onSubmit() {
    this.recipeService.submitRecipe(this.recipeForm.value);
    this.latestRecipeName = this.recipeForm.value.name;
    this.recipeForm.reset();
  }

  onSubmitNew(){
    this.supaService.getLoggedInUser();
    this.supaService.addRecipeNew(this.recipeForm.value);
    this.latestRecipeName = this.recipeForm.value.name;
    this.recipeForm.reset();
  }

  onCancel() {
    this.router.navigate(['/admin'], {relativeTo: this.route});
  }

}
