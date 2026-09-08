import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { SupaService } from 'src/app/shared/services/supa.service';
import { AiService, ScannedRecipe } from 'src/app/shared/services/ai.service';

@Component({
    selector: 'app-add-recipe',
    templateUrl: './add-recipe.component.html',
    styleUrls: ['./add-recipe.component.scss'],
    standalone: false
})

export class AddRecipeComponent implements OnInit {

  @ViewChild('scanInput') scanInput: ElementRef<HTMLInputElement>;

  recipeCreatedDate: Date;
  recipeForm: FormGroup;

  latestRecipeName: string;

  // ── AI scan state ──────────────────────────────────────────────────────────
  isScanningRecipe = false;
  scanError: string | null = null;
  scanSuccess = false;

  ingredientAmountTypeOptions: string[] = ["Cups", "Teaspoons", "Tablespoons", "Fluid ounces", "Pints", "Quarts", "Milliliters", "Liters", "Grams", "Kilograms", "Ounces", "Pounds", "Count"];
  recipeTagOptions: string[] = ["Appetizer", "Dinner", "Cast iron", "Beverage", "Breakfast", "Dessert", "Cookies", "Grilling", "Italian", "Mexican", "Salad", "Seafood", "Soup"];

  constructor(
    private route: ActivatedRoute,
    private supaService: SupaService,
    private router: Router,
    private aiService: AiService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
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

  // ── Slug ──────────────────────────────────────────────────────────────────

  onNameInput(event: Event): void {
    const name = (event.target as HTMLInputElement).value;
    const slug = name.replaceAll(' ', '-').toLowerCase().trim();
    this.recipeForm.get('slug').setValue(slug, { emitEvent: false });
  }

  // ── AI Recipe Scanner ──────────────────────────────────────────────────────

  /** Opens the hidden file input so the user can pick an image or use the camera. */
  onScanRecipe(): void {
    this.scanInput.nativeElement.click();
  }

  /** Handles the file chosen by the user, sends it to Gemini, and populates the form. */
  async onScanFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isScanningRecipe = true;
    this.scanError = null;
    this.scanSuccess = false;

    try {
      const { data, mimeType } = await this.fileToScaledBase64(file);
      const scanned = await this.aiService.extractRecipeFromImage(data, mimeType);
      this.populateFormFromScan(scanned);
      this.scanSuccess = true;
    } catch (err) {
      console.error('Recipe scan error:', err);
      this.scanError = await this.describeScanError(err);
    } finally {
      this.isScanningRecipe = false;
      input.value = ''; // reset so the same file can be chosen again
    }
  }

  /**
   * Turns a failed scan into a message worth showing. The edge function reports
   * a real reason in its JSON body, so prefer that; only guess as a last resort,
   * and never blame the photo for what was actually a transport failure.
   */
  private async describeScanError(err: any): Promise<string> {
    const response: Response | undefined = err?.context;
    const status = response?.status;

    if (status === 401 || status === 403) {
      return 'You need to be signed in as an admin to scan recipes. Try signing in again.';
    }

    // Prefer whatever the function itself said
    try {
      const text = await response?.clone?.().text?.();
      if (text) {
        try {
          const body = JSON.parse(text);
          if (body?.error) return body.error;
        } catch {
          return `Scan failed (${status}): ${text.slice(0, 200)}`;
        }
      }
    } catch {
      // response body could not be read — fall through
    }

    // No response at all means we never got a reply, not a bad photo
    if (!status) {
      return 'The scan timed out before it finished. Check your connection and try again — if it keeps happening, the scan-recipe function logs will show why.';
    }

    return `Scan failed (${status}). Check the scan-recipe function logs for details.`;
  }

  /**
   * Downscales an image and returns it as base64 (data URI prefix stripped).
   *
   * Phone cameras produce 3-12MB photos, and base64 inflates that by a further
   * third — far more than the scan needs and slow enough over mobile data to
   * stall the request. 1600px on the long edge keeps recipe text comfortably
   * legible to Gemini while cutting the payload to a few hundred KB.
   */
  private async fileToScaledBase64(
    file: File,
    maxEdge = 1600,
    quality = 0.85
  ): Promise<{ data: string; mimeType: string }> {
    // `from-image` honours the EXIF orientation phones write, so a photo taken
    // sideways is uprighted rather than handed to Gemini rotated.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    return { data: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
  }

  /** Populates every form field from the AI-scanned recipe object. */
  private populateFormFromScan(scanned: ScannedRecipe): void {
    // General fields
    this.recipeForm.patchValue({
      name:         scanned.name        || '',
      description:  scanned.description || '',
      author:       scanned.author      || '',
      prep_time:    scanned.prep_time,
      cook_time:    scanned.cook_time,
      chill_time:   scanned.chill_time,
      total_time:   scanned.total_time,
      serving_size: scanned.serving_size,
      tags:         scanned.tags        || [],
      notes:        scanned.notes       || '',
    });

    // Auto-generate slug from scanned name
    if (scanned.name) {
      const slug = scanned.name.replaceAll(' ', '-').toLowerCase().trim();
      this.recipeForm.get('slug').setValue(slug, { emitEvent: false });
    }

    // Ingredient groups — rebuild the FormArray from scratch
    const ingredientGroupsArray = this.recipeForm.get('ingredient_groups') as FormArray;
    ingredientGroupsArray.clear();
    for (const group of (scanned.ingredient_groups || [])) {
      const groupForm = new FormGroup({
        'ingredientGroupName': new FormControl(group.ingredientGroupName || 'Main', Validators.required),
        'ingredients': new FormArray([])
      });
      const ingredientsArray = groupForm.get('ingredients') as FormArray;
      for (const ing of (group.ingredients || [])) {
        ingredientsArray.push(new FormGroup({
          'ingredientName':            new FormControl(ing.ingredientName,            Validators.required),
          'ingredientAmount':          new FormControl(ing.ingredientAmount,          Validators.required),
          'ingredientMeasurementType': new FormControl(ing.ingredientMeasurementType, Validators.required)
        }));
      }
      ingredientGroupsArray.push(groupForm);
    }

    // Ensure at least one ingredient group exists so the form stays valid
    if (ingredientGroupsArray.length === 0) {
      ingredientGroupsArray.push(this.createIngredientGroup());
    }

    // Steps — rebuild the FormArray from scratch
    const stepsArray = this.recipeForm.get('steps') as FormArray;
    stepsArray.clear();
    for (const s of (scanned.steps || [])) {
      stepsArray.push(new FormGroup({
        'step':            new FormControl(s.step, Validators.required),
        'stepIngredients': new FormArray([])
      }));
    }
  }

  // ── Steps ─────────────────────────────────────────────────────────────────

  get recipeStepsControls() {
    return (this.recipeForm.get('steps') as FormArray).controls;
  }

  onAddStep() {
    (<FormArray>this.recipeForm.get('steps')).push(
      new FormGroup({
        'step': new FormControl(null, Validators.required),
        'stepIngredients': new FormArray([])
      })
    );
  }

  onDeleteStep(index: number) {
    (<FormArray>this.recipeForm.get('steps')).removeAt(index);
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
    return (this.recipeForm.get('steps') as FormArray)
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

  dropStep(event: CdkDragDrop<FormGroup[]>): void {
    this.moveArrayItem(
      this.recipeForm.get('steps') as FormArray,
      event.previousIndex,
      event.currentIndex
    );
  }

  // ── Ingredient Groups ─────────────────────────────────────────────────────

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

  dropIngredientGroup(event: CdkDragDrop<FormGroup[]>): void {
    this.moveArrayItem(
      this.recipeIngredientGroupControls,
      event.previousIndex,
      event.currentIndex
    );
  }

  // ── Ingredients ───────────────────────────────────────────────────────────

  getIngredients(layerIndex: number): FormArray {
    return (this.recipeIngredientGroupControls.at(layerIndex) as FormGroup).get('ingredients') as FormArray;
  }

  addIngredient(layerIndex: number): void {
    this.getIngredients(layerIndex).push(this.createIngredient());
  }

  createIngredient(): FormGroup {
    return new FormGroup({
      'ingredientName': new FormControl(null, Validators.required),
      'ingredientAmount': new FormControl(null, Validators.required),
      'ingredientMeasurementType': new FormControl(null, Validators.required)
    });
  }

  deleteIngredient(ingredientGroupIndex: number, ingredientIndex: number): void {
    this.getIngredients(ingredientGroupIndex).removeAt(ingredientIndex);
  }

  dropIngredient(event: CdkDragDrop<FormGroup[]>, groupIndex: number): void {
    this.moveArrayItem(
      this.getIngredients(groupIndex),
      event.previousIndex,
      event.currentIndex
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Reorders a FormArray by removing the item at `from` and inserting it at `to`. */
  private moveArrayItem(formArray: FormArray, from: number, to: number): void {
    const item = formArray.at(from);
    formArray.removeAt(from);
    formArray.insert(to, item);
  }

  // ── Form actions ──────────────────────────────────────────────────────────

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
