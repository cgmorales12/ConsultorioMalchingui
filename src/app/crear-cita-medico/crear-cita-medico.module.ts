import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { CrearCitaMedicoPage } from './crear-cita-medico.page';

const routes: Routes = [
    {
        path: '',
        component: CrearCitaMedicoPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        CrearCitaMedicoPage
    ],
    declarations: []
})
export class CrearCitaMedicoPageModule { }
