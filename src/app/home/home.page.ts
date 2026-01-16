/**
 * Home Page (Página Principal)
 * 
 * Descripción: Pantalla de inicio de la aplicación. Muestra:
 * 1. Listado de médicos disponibles hoy.
 * 2. Accesos directos a Login, Registro, Citas y Chatbot.
 * 3. Información general del consultorio (footer).
 * 
 * Uso: Accesible por cualquier usuario (público).
 */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth';

interface MedicoDisponible {
  nombre: string;
  especialidad: string;
  horario: string;
  disponible: boolean;
  genero: 'M' | 'F';
}

interface DashboardStats {
  ocupados: number;
  disponibles: number;
  liberados: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  medicosDisponibles: MedicoDisponible[] = [];

  statsCitas: DashboardStats = {
    ocupados: 0,
    disponibles: 0,
    liberados: 0
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadHomeData();
  }

  ionViewWillEnter() {
    // Recargar datos cada vez que se entra a la home (por si cambió algo)
    this.loadHomeData();
  }

  loadHomeData() {
    // 0. Mantenimiento Automático: Archivar disponibilidad pasada
    this.authService.procesarHistorialDisponibilidad().subscribe({
      next: () => {
        this.cargarDatosVista();
      },
      error: (err: any) => {
        console.error('Error en mantenimiento autmático:', err);
        this.cargarDatosVista();
      }
    });
  }

  cargarDatosVista() {
    const today = new Date();

    // A. Cargar Médicos
    this.authService.getMedicos().subscribe((resMed: any) => {
      if (resMed.status === 'success') {
        const todosLosMedicos = resMed.data;

        this.authService.getMedicosConDisponibilidadFutura().subscribe((resDisp: any) => {
          let medicosDisponiblesIds = new Set<number>();

          if (resDisp.status === 'success' && resDisp.data) {
            resDisp.data.forEach((id: number) => medicosDisponiblesIds.add(id));
          }

          // 3. Mapear y FILTRAR por disponibilidad
          const medicosMapeados = todosLosMedicos.map((medico: any) => {
            const isAvailable = medicosDisponiblesIds.has(Number(medico.id_medico));

            const nombres = medico.nombres || '';
            const apellidos = medico.apellidos || '';
            const nombreCompleto = `${nombres} ${apellidos}`.trim() || 'Nombre no disponible';

            // Heurística de Género
            let genero: 'M' | 'F' = 'M';
            const primerNombre = nombres.split(' ')[0].toLowerCase();
            if (primerNombre.endsWith('a')) { genero = 'F'; }
            if (primerNombre === 'jose' || primerNombre === 'luca' || primerNombre === 'angel') genero = 'M';

            return {
              nombre: nombreCompleto,
              especialidad: medico.especialidad || 'Sin especialidad',
              horario: 'Turnos Disponibles',
              disponible: isAvailable,
              genero: genero
            };
          });

          // FILTRO: Mostrar TODOS, pero ordenar los disponibles primero
          this.medicosDisponibles = medicosMapeados.sort((a: any, b: any) => {
            return (a.disponible === b.disponible) ? 0 : a.disponible ? -1 : 1;
          });
        });
      }
    });

    // B. Cargar Estadísticas de Citas
    this.authService.getCitasDashboardSummary().subscribe((res: any) => {
      if (res.status === 'success' && res.stats) {
        this.statsCitas = res.stats;
      }
    });
  }

  /**
   * 1. Registro de Pacientes Nuevos
   */
  goToRegistro() {
    this.router.navigate(['/registro-paciente']);
  }

  /**
   * 2. SOLUCIÓN AL ERROR: Navega al login específico de pacientes (Cédula/Correo)
   */
  goToLoginPaciente() {
    this.router.navigate(['/login-paciente']);
  }

  /**
   * 3. Acceso a Agendar Cita (Redirige a login si no hay sesión)
   */
  goToAgendarCita() {
    const idUsuario = localStorage.getItem('id_usuario'); // O sessionStorage si movimos lógica, pero Home usa localStorage legado a veces?
    // Mejor chequear sessionStorage del paciente si es lo que usamos ahora?
    // Pero Home acceden todos. El paciente usa login-paciente.
    const sessionStr = sessionStorage.getItem('patient_session');

    if (sessionStr) {
      this.router.navigate(['/agendar-cita']);
    } else {
      this.router.navigate(['/login-paciente']);
    }
  }

  /**
   * 4. Consultas de Telemedicina (Redirige a login si no hay sesión)
   */
  goToMisConsultas() {
    const sessionStr = sessionStorage.getItem('patient_session');
    if (sessionStr) {
      this.router.navigate(['/mis-consultas-paciente']);
    } else {
      this.router.navigate(['/login-paciente']);
    }
  }

  /**
   * 5. Login de Personal (Médicos/Admin)
   */
  goToLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * 6. Acceso al Chatbot
   */
  goToChatbot() {
    this.router.navigate(['/chatbot']);
  }
}
