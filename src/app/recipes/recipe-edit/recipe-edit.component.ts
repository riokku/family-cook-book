import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { Step } from 'src/app/shared/models/step.model';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { IngredientGroup } from 'src/app/shared/models/ingredient-group.model';
import { SupaService } from 'src/app/shared/services/supa.service';

@Component({
    selector: 'app-recipe-edit',
    templateUrl: './recipe-edit.component.html',
    styleUrls: ['./recipe-edit.component.scss'],
    standalone: false
})

export class RecipeEditComponent implements OnInit {

  editRecipeForm: FormGroup;
  editedSlug: string;
  editingRecipe: Recipe;

  recipeId: number;
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
  recipeIngredientsGroupArray: IngredientGroup[];
  recipeStepsArray: Step[];
  recipeTags: string[];
  recipeCreated: Date;
  recipeNotes: string;

  ingredientAmountTypeOptions: string[] = ["Cups", "Teaspoons", "Tablespoons", "Fluid ounces", "Pints", "Quarts", "Milliliters", "Liters", "Grams", "Kilograms", "Ounces", "Pounds", "Count"];
  recipeTagOptions: string[] = ["Appetizer", "Dinner", "Cast iron", "Beverage", "Breakfast", "Dessert", "Cookies", "Grilling", "Italian", "Mexican", "Salad", "Seafood", "Soup"];

  constructor(
    private route: ActivatedRoute,
    private supaService: SupaService,
    private router: Router,
  ) {}

  get recipeIngredientControls() {
    return (this.editRecipeForm.get('ingredients') as FormArray).controls;
  }

  get recipeStepsControls() {
    return (this.editRecipeForm.get('steps') as FormArray).controls;
  }

  get recipeIngredientGroupControls() {
    return this.editRecipeForm.get('ingredient_groups') as FormArray;
  }


  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.editedSlug = params['slug'];
        this.initializeForm();
      }
    )
  }

  // ── Slug ──────────────────────────────────────────────────────────────────

  onNameInput(event: Event): void {
    const name = (event.target as HTMLInputElement).value;
    const slug = name.replaceAll(' ', '-').toLowerCase().trim();
    this.editRecipeForm.get('slug').setValue(slug, { emitEvent: false });
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────

  dropStep(event: CdkDragDrop<FormGroup[]>): void {
    this.moveArrayItem(
      this.editRecipeForm.get('steps') as FormArray,
      event.previousIndex,
      event.currentIndex
    );
  }

  dropIngredient(event: CdkDragDrop<FormGroup[]>, groupIndex: number): void {
    this.moveArrayItem(
      this.getIngredients(groupIndex),
      event.previousIndex,
      event.currentIndex
    );
  }

  dropIngredientGroup(event: CdkDragDrop<FormGroup[]>): void {
    this.moveArrayItem(
      this.recipeIngredientGroupControls,
      event.previousIndex,
      event.currentIndex
    );
  }

  /** Reorders a FormArray by removing the item at `from` and inserting it at `to`. */
  private moveArrayItem(formArray: FormArray, from: number, to: number): void {
    const item = formArray.at(from);
    formArray.removeAt(from);
    formArray.insert(to, item);
  }

  private initializeForm(){

    this.editingRecipe = this.supaService.getRecipe(this.editedSlug);
    this.recipeId = this.editingRecipe.id;
    this.recipeName = this.editingRecipe.name;
    this.recipeSlug = this.editingRecipe.slug;
    this.recipeAuthor = this.editingRecipe.author;
    this.link = this.editingRecipe.link;
    this.recipeDescription = this.editingRecipe.description;
    this.recipePrepTime = this.editingRecipe.prep_time;
    this.recipeCookTime = this.editingRecipe.cook_time;
    this.recipeChillTime = this.editingRecipe.chill_time;
    this.recipeTotalime = this.editingRecipe.total_time;
    this.recipeServingSize = this.editingRecipe.serving_size;
    this.recipeFeatured = this.editingRecipe.featured;
    this.recipeImagePath = this.editingRecipe.image_path;
    this.recipeIngredientsGroupArray = this.editingRecipe.ingredient_groups;
    this.recipeStepsArray = this.editingRecipe.steps;
    this.recipeTags = this.editingRecipe.tags;
    this.recipeCreated = this.editingRecipe.created;
    this.recipeNotes = this.editingRecipe.notes;

    this.editRecipeForm = new FormGroup({
      'id': new FormControl(this.recipeId, Validators.required),
      'name': new FormControl(this.recipeName, Validators.required),
      'slug': new FormControl(this.recipeSlug, Validators.required),
      'author': new FormControl(this.recipeAuthor, Validators.required),
      'link': new FormControl(this.link),
      'description': new FormControl(this.recipeDescription, Validators.required),
      'prep_time': new FormControl(this.recipePrepTime),
      'cook_time': new FormControl(this.recipeCookTime),
      'chill_time': new FormControl(this.recipeChillTime),
      'total_time': new FormControl(this.recipeTotalime, Validators.required),
      'serving_size': new FormControl(this.recipeServingSize, Validators.required),
      'featured': new FormControl(this.recipeFeatured),
      'image_path': new FormControl(this.recipeImagePath),
      'ingredient_groups': new FormArray(this.recipeIngredientsGroupArray.map(ingredient => new FormGroup({
        'ingredientGroupName': new FormControl(ingredient.ingredientGroupName, Validators.required),
        'ingredients': new FormArray(ingredient.ingredients.map(ingredient => new FormGroup({
          'ingredientName': new FormControl(ingredient.ingredientName, Validators.required),
          'ingredientAmount': new FormControl(ingredient.ingredientAmount, Validators.required),
          'ingredientMeasurementType': new FormControl(ingredient.ingredientMeasurementType, Validators.required)
        })))
      }))),
      'steps': new FormArray(this.recipeStepsArray.map(step => new FormGroup({
        'step': new FormControl(step.step, Validators.required),
        'stepIngredients': new FormArray(
          (step.stepIngredients || []).map(si =>
            this.createStepIngredient(si.ingredientName, si.ingredientAmount, si.ingredientMeasurementType)
          )
        )
      }))),
      'tags': new FormControl(this.recipeTags, Validators.required),
      'created': new FormControl(this.recipeCreated, Validators.required),
      'notes': new FormControl(this.recipeNotes)
    });

    // Now that the full form is built, apply max validators to any step ingredients
    // that were loaded from the saved recipe (allIngredients reads from ingredient_groups,
    // which is now part of editRecipeForm).
    const stepsArray = this.editRecipeForm.get('steps') as FormArray;
    stepsArray.controls.forEach((stepCtrl, stepIdx) => {
      const siArray = stepCtrl.get('stepIngredients') as FormArray;
      siArray.controls.forEach((_, siIdx) => {
        this.onStepIngredientNameChange(stepIdx, siIdx);
      });
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
        'step': new FormControl(null, Validators.required),
        'stepIngredients': new FormArray([])
      })
    );
  }

  // ── Step ingredients ──────────────────────────────────────────────────────

  /** Flat list of all named ingredients across every ingredient group in the form. */
  get allIngredients(): { name: string; amount: number; unit: string }[] {
    const result: { name: string; amount: number; unit: string }[] = [];
    const groups = this.recipeIngredientGroupControls;
    for (let i = 0; i < groups.length; i++) {
      const grp = groups.at(i) as FormGroup;
      const ings = grp.get('ingredients') as FormArray;
      for (let j = 0; j < ings.length; j++) {
        const ing = ings.at(j) as FormGroup;
        const name = ing.get('ingredientName').value;
        if (name) {
          result.push({
            name,
            amount: ing.get('ingredientAmount').value,
            unit: ing.get('ingredientMeasurementType').value
          });
        }
      }
    }
    return result;
  }

  getStepIngredients(stepIndex: number): FormArray {
    return (this.editRecipeForm.get('steps') as FormArray)
      .at(stepIndex).get('stepIngredients') as FormArray;
  }

  createStepIngredient(name: string = null, amount: number = null, unit: string = null): FormGroup {
    return new FormGroup({
      'ingredientName': new FormControl(name, Validators.required),
      'ingredientAmount': new FormControl(amount, [Validators.required, Validators.min(0.001)]),
      'ingredientMeasurementType': new FormControl(unit)
    });
  }

  addStepIngredient(stepIndex: number): void {
    this.getStepIngredients(stepIndex).push(this.createStepIngredient());
  }

  deleteStepIngredient(stepIndex: number, ingredientIndex: number): void {
    this.getStepIngredients(stepIndex).removeAt(ingredientIndex);
  }

  /** When an ingredient is chosen from the dropdown, auto-populate its unit and cap the amount. */
  onStepIngredientNameChange(stepIndex: number, ingredientIndex: number): void {
    const stepIng = this.getStepIngredients(stepIndex).at(ingredientIndex) as FormGroup;
    const selected = stepIng.get('ingredientName').value;
    const master = this.allIngredients.find(i => i.name === selected);
    if (master) {
      stepIng.get('ingredientMeasurementType').setValue(master.unit, { emitEvent: false });
      stepIng.get('ingredientAmount').setValidators([
        Validators.required,
        Validators.min(0.001),
        Validators.max(master.amount)
      ]);
      stepIng.get('ingredientAmount').updateValueAndValidity();
    }
  }

  /** Returns the max allowed amount for a given ingredient name (from the master list). */
  maxAmountFor(ingredientName: string): number | null {
    if (!ingredientName) return null;
    return this.allIngredients.find(i => i.name === ingredientName)?.amount ?? null;
  }

  deleteIngredient(ingredientGroupIndex: number, ingredientIndex: number): void {
    const fields = this.getIngredients(ingredientGroupIndex);
    fields.removeAt(ingredientIndex);
  }

  //Add/remove Ingredient Groups

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


  onDeleteStep(index: number) {
    (<FormArray>this.editRecipeForm.get('steps')).removeAt(index);
  }

  onSaveChanges() {
    this.supaService.updateRecipe(this.editRecipeForm.value);
    this.router.navigate(['/admin']);
  }

  onCancel() {
    this.router.navigate(['/admin']);
  }
}
