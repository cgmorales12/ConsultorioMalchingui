import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicosPageRoutingModule } from './medicos-routing.module';

import { MedicosPage } from './medicos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MedicosPageRoutingModule,
    MedicosPage
  ],
  declarations: []
})
export class MedicosPageModule {}
