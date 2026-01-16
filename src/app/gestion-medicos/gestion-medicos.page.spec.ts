import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionMedicosPage } from './gestion-medicos.page';

describe('GestionMedicosPage', () => {
  let component: GestionMedicosPage;
  let fixture: ComponentFixture<GestionMedicosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionMedicosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
