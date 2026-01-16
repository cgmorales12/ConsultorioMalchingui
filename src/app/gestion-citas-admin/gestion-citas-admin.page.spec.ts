import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionCitasAdminPage } from './gestion-citas-admin.page';

describe('GestionCitasAdminPage', () => {
  let component: GestionCitasAdminPage;
  let fixture: ComponentFixture<GestionCitasAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionCitasAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
