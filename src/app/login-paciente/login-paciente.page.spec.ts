import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPacientePage } from './login-paciente.page';

describe('LoginPacientePage', () => {
  let component: LoginPacientePage;
  let fixture: ComponentFixture<LoginPacientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPacientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
