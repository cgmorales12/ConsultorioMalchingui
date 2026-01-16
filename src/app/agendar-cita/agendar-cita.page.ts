/**
 * Agendar Cita Page (Módulo Paciente)
 * 
 * Descripción: Pantalla para que el paciente reserve una nueva cita médica.
 * Permite seleccionar médico, ver su disponibilidad por día y elegir hora.
 * 
 * Uso: Pacientes logueados.
 */
import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth';
import localeEs from '@angular/common/locales/es';

// Registramos el idioma español para mostrar días como "Lun", "Mar", etc.
registerLocaleData(localeEs);

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './agendar-cita.page.html',
  styleUrls: ['./agendar-cita.page.scss'],
})
export class AgendarCitaPage implements OnInit {
  cita = {
    cedula_paciente: '',
    id_medico: null as number | null,
    fecha_cita: '',
    hora_cita: '',
    motivo: '',
    estado: 1 // Align with CrearCitaMedicoPage
  };

  medicos: any[] = [];
  disponibilidad: any[] = [];
  fechasHabilitadas: string[] = [];

  isLoading = false;
  isSaving = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef // 🚨 Ayuda a refrescar las tarjetas de la semana
  ) { }

  ngOnInit() {
    this.recuperarDatosPaciente();
    this.loadMedicosList();
  }

  recuperarDatosPaciente() {
    // 🚨 CORRECCIÓN: Usar sessionStorage ('patient_session') que es lo que usa el Login y Perfil
    const dataStr = sessionStorage.getItem('patient_session');

    if (dataStr) {
      const paciente = JSON.parse(dataStr);
      console.log('Datos Paciente Recuperados (Session):', paciente);

      this.cita.cedula_paciente = paciente.cedula;

      // Asignar ID si existe (compatible con diferentes estructuras de respuesta)
      if (paciente.id_paciente || paciente.id) {
        (this.cita as any).id_paciente = paciente.id_paciente || paciente.id;
      }
    } else {
      // Si no hay sesión, mandar al login
      this.router.navigate(['/login-paciente']);
    }
  }

  loadMedicosList() {
    this.authService.getMedicos().subscribe({
      next: (res: any) => {
        if (res.status === 'success') this.medicos = res.data || [];
      }
    });
  }

  /**
   * 🚨 DETECTAR CAMBIO DE MÉDICO:
   * Al elegir médico, cargamos sus días de atención en formato lista.
   */
  onMedicoChange() {
    this.fechasHabilitadas = [];
    this.disponibilidad = [];
    this.cita.fecha_cita = '';
    this.cita.hora_cita = '';

    if (this.cita.id_medico) {
      this.isLoading = true;
      this.authService.getDisponibilidadByMedico(this.cita.id_medico).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.status === 'success' && res.data) {
            // 🚨 Limpiamos las fechas y las convertimos para evitar errores de zona horaria
            this.fechasHabilitadas = res.data.map((item: any) =>
              item.fecha_dia.trim().replace(/-/g, '/')
            );

            console.log("Fechas cargadas para la semana:", this.fechasHabilitadas);
            this.cdr.detectChanges(); // Forzamos a Angular a mostrar las tarjetas
          }
        },
        error: () => {
          this.isLoading = false;
          this.presentToast('Error al obtener disponibilidad.', 'danger');
        }
      });
    }
  }

  /**
   * 🚨 FUNCIÓN PARA SELECCIONAR TARJETA DE FECHA
   */
  seleccionarFechaRapida(fecha: string) {
    this.cita.fecha_cita = fecha;
    this.cita.hora_cita = ''; // Reset hora
    this.disponibilidad = [];

    // Al hacer clic, cargamos las horas de ese día
    this.loadHorasDisponibles(fecha);
  }

  loadHorasDisponibles(fecha: string) {
    if (!this.cita.id_medico) return;

    // Restauramos el formato con guiones para la consulta a la base de datos
    const fechaDB = fecha.replace(/\//g, '-');

    this.isLoading = true;
    this.authService.getDisponibilidad(fechaDB, this.cita.id_medico).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.disponibilidad = res.data || [];
        }
      },
      error: () => {
        this.isLoading = false;
        this.presentToast('Error al cargar horarios.', 'danger');
      }
    });
  }

  onAgendarCita() {
    if (!this.cita.fecha_cita || !this.cita.hora_cita) {
      this.presentToast('Seleccione fecha y hora.', 'warning');
      return;
    }

    this.isSaving = true;
    this.error = null;

    console.log('Enviando cita:', this.cita);

    // 🚨 CORRECCIÓN: Asegurar formato YYYY-MM-DD
    const citaEnvio = { ...this.cita, id_disponibilidad: null };
    if (citaEnvio.fecha_cita) {
      citaEnvio.fecha_cita = citaEnvio.fecha_cita.replace(/\//g, '-');
    }

    // 🚨 CORRECCIÓN: Obtener id_disponibilidad basado en la hora seleccionada
    const slotSeleccionado = this.disponibilidad.find(d => d.hora_inicio === this.cita.hora_cita);
    if (slotSeleccionado) {
      citaEnvio.id_disponibilidad = slotSeleccionado.id_disponibilidad;
    }

    this.authService.agendarCita(citaEnvio).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.status === 'success') {
          this.presentToast('¡Cita agendada con éxito!', 'success');
          this.router.navigate(['/perfil-paciente']);
        } else {
          this.error = res.message;
        }
      },
      error: () => {
        this.isSaving = false;
        this.error = 'Error de conexión con el servidor.';
      }
    });
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    toast.present();
  }
}