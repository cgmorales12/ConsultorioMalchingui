import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionCitasAdminPageRoutingModule } from './gestion-citas-admin-routing.module';

import { GestionCitasAdminPage } from './gestion-citas-admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionCitasAdminPageRoutingModule,
    GestionCitasAdminPage
  ],
  declarations: []
})
export class GestionCitasAdminPageModule {}
