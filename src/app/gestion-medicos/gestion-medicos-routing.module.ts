import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionMedicosPage } from './gestion-medicos.page';

const routes: Routes = [
  {
    path: '',
    component: GestionMedicosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionMedicosPageRoutingModule {}
