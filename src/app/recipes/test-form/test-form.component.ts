import { Component } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-test-form',
  templateUrl: './test-form.component.html',
  styleUrls: ['./test-form.component.scss']
})
export class TestFormComponent {
  form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      layersInForm: new FormArray([this.createLayer()])
    });
  }

  get layers(): FormArray {
    return this.form.get('layersInForm') as FormArray;
  }

  createLayer(): FormGroup {
    return new FormGroup({
      name: new FormControl(''),
      fieldsInForm: new FormArray([this.createField()])
    });
  }

  createField(): FormGroup {
    return new FormGroup({
      fieldName: new FormControl(''),
      value: new FormControl('')
    });
  }

  addLayer(): void {
    this.layers.push(this.createLayer());
  }

  removeLayer(index: number): void {
    this.layers.removeAt(index);
  }

  addField(layerIndex: number): void {
    const fields = this.getFields(layerIndex);
    fields.push(this.createField());
  }

  removeField(layerIndex: number, fieldIndex: number): void {
    const fields = this.getFields(layerIndex);
    fields.removeAt(fieldIndex);
  }

  getFields(layerIndex: number): FormArray {
    return (this.layers.at(layerIndex) as FormGroup).get('fieldsInForm') as FormArray;
  }

  onSubmit(): void {
    console.log(this.form.value);
  }
}
