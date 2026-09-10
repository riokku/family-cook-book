import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

import { AdminComponent } from './admin.component';
import { SupaService } from 'src/app/shared/services/supa.service';
import { SupaServiceStub } from 'src/testing/test-doubles';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: SupaService, useClass: SupaServiceStub }
      ],
      // Child components and third-party elements are not under test here.
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
