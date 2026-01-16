import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionLoginUsuariosPage } from './gestion-login-usuarios.page';

describe('GestionLoginUsuariosPage', () => {
  let component: GestionLoginUsuariosPage;
  let fixture: ComponentFixture<GestionLoginUsuariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionLoginUsuariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
