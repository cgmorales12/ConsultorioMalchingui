import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionCitasAdminPage } from './gestion-citas-admin.page';

const routes: Routes = [
  {
    path: '',
    component: GestionCitasAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionCitasAdminPageRoutingModule {}
