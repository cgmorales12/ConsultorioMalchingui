import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { GestionDisponibilidadAdminPageRoutingModule } from './gestion-disponibilidad-admin-routing.module';
import { GestionDisponibilidadAdminPage } from './gestion-disponibilidad-admin.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GestionDisponibilidadAdminPageRoutingModule,
        GestionDisponibilidadAdminPage
    ],
    declarations: []
})
export class GestionDisponibilidadAdminPageModule { }
