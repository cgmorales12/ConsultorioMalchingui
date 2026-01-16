import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  // Rutas creadas
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'registro-paciente',
    loadChildren: () => import('./registro-paciente/registro-paciente.module').then(m => m.RegistroPacientePageModule)
  },
  {
    path: 'agendar-cita/:cedula',
    loadChildren: () => import('./agendar-cita/agendar-cita.module').then(m => m.AgendarCitaPageModule)
  },
  // Rutas protegidas (por crear)
  {
    path: 'medicos',
    loadChildren: () => import('./medicos/medicos.module').then(m => m.MedicosPageModule)
  },
  {
    path: 'sistema',
    loadChildren: () => import('./sistema/sistema.module').then(m => m.SistemaPageModule)
  },
  {
    path: 'registro-paciente',
    loadChildren: () => import('./registro-paciente/registro-paciente.module').then(m => m.RegistroPacientePageModule)
  },
  {
    path: 'agendar-cita',
    loadChildren: () => import('./agendar-cita/agendar-cita.module').then(m => m.AgendarCitaPageModule)
  },
  {
    path: 'medicos',
    loadChildren: () => import('./medicos/medicos.module').then(m => m.MedicosPageModule)
  },
  {
    path: 'sistema',
    loadChildren: () => import('./sistema/sistema.module').then(m => m.SistemaPageModule)
  },
  {
    path: 'gestion-medicos',
    loadChildren: () => import('./gestion-medicos/gestion-medicos.module').then(m => m.GestionMedicosPageModule)
  },
  {
    path: 'gestion-citas-admin',
    loadChildren: () => import('./gestion-citas-admin/gestion-citas-admin.module').then(m => m.GestionCitasAdminPageModule)
  },
  {
    path: 'gestion-disponibilidad-admin',
    loadChildren: () => import('./gestion-disponibilidad-admin/gestion-disponibilidad-admin.module').then(m => m.GestionDisponibilidadAdminPageModule)
  },
  {
    path: 'gestion-disponibilidad-medico',
    loadChildren: () => import('./gestion-disponibilidad-medico/gestion-disponibilidad-medico.module').then(m => m.GestionDisponibilidadMedicoPageModule)
  },
  {
    path: 'gestion-login-usuarios',
    loadChildren: () => import('./gestion-login-usuarios/gestion-login-usuarios.module').then(m => m.GestionLoginUsuariosPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'chatbot',
    loadChildren: () => import('./chatbot/chatbot.module').then(m => m.ChatbotPageModule)
  },
  {
    path: 'consultas-medico',
    loadChildren: () => import('./consultas-medico/consultas-medico.module').then(m => m.ConsultasMedicoPageModule)
  },
  {
    path: 'mis-consultas-paciente',
    loadChildren: () => import('./mis-consultas-paciente/mis-consultas-paciente.module').then(m => m.MisConsultasPacientePageModule)
  },
  {
    path: 'login-paciente',
    loadChildren: () => import('./login-paciente/login-paciente.module').then(m => m.LoginPacientePageModule)
  },
  {
    path: 'perfil-paciente',
    loadChildren: () => import('./perfil-paciente/perfil-paciente.module').then(m => m.PerfilPacientePageModule)
  },
  {
    path: 'crear-cita-medico',
    loadChildren: () => import('./crear-cita-medico/crear-cita-medico.module').then(m => m.CrearCitaMedicoPageModule)
  },
  {
    path: 'gestion-citas',
    loadChildren: () => import('./gestion-citas/gestion-citas.module').then(m => m.GestionCitasPageModule)
  },
  {
    path: 'historial-citas-paciente',
    loadComponent: () => import('./historial-citas-paciente/historial-citas-paciente.page').then(m => m.HistorialCitasPacientePage)
  },
  {
    path: 'reportes-bot',
    loadChildren: () => import('./reportes-bot/reportes-bot.module').then( m => m.ReportesBotPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
