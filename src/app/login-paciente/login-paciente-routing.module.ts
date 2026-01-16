import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginPacientePage } from './login-paciente.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPacientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPacientePageRoutingModule {}
