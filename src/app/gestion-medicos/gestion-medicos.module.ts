import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- Añadido aquí

import { IonicModule } from '@ionic/angular';

import { GestionMedicosPageRoutingModule } from './gestion-medicos-routing.module';

import { GestionMedicosPage } from './gestion-medicos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // <--- Correcto
    IonicModule,
    GestionMedicosPageRoutingModule,
    GestionMedicosPage
  ],
  declarations: []
})
export class GestionMedicosPageModule {}
