import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionLoginUsuariosPage } from './gestion-login-usuarios.page';

const routes: Routes = [
  {
    path: '',
    component: GestionLoginUsuariosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionLoginUsuariosPageRoutingModule {}
