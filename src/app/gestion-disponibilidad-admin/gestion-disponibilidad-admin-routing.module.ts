import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionDisponibilidadAdminPage } from './gestion-disponibilidad-admin.page';

const routes: Routes = [
    {
        path: '',
        component: GestionDisponibilidadAdminPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionDisponibilidadAdminPageRoutingModule { }
