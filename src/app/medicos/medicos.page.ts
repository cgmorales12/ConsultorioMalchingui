import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { IonicModule, ToastController, AlertController, NavController } from '@ionic/angular'; // 🚨 Inyectamos NavController

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './medicos.page.html',
  styleUrls: ['./medicos.page.scss'],
})
export class MedicosPage {

  idMedico: number | null = null;
  citasAgendadas: any[] = [];
  citasPorAprobar: any[] = [];
  isLoading: boolean = false;
  pendingConsultationsCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private navCtrl: NavController
  ) { }

  ionViewWillEnter() {
    this.loadMedicoIdAndCitas();
  }

  // --- Lógica de Sesión y Carga Inicial ---

  async loadMedicoIdAndCitas() {
    this.isLoading = true;
    const session = this.authService.getSession();
    console.log('MedicosPage Session Check:', session);

    // 🚨 CORRECCIÓN: Priorizar id_medico real sobre id_usuario para alertar correctamente
    if (session.id_medico) {
      this.idMedico = session.id_medico;
    } else if (session.id_usuario) {
      this.idMedico = session.id_usuario;
    }

    if (this.idMedico) {
      this.loadCitasAgendadas();
      this.loadPendingConsultations();
      this.loadDoctorStats(); // 🚨 Cargar estadísticas
    } else {
      this.presentToast('Sesión expirada. Por favor, ingrese nuevamente.', 'danger');
      this.logout();
    }
  }

  // --- Estadísticas (Dashboard) ---
  stats = { promedio: "0.0", total_votos: 0 };

  loadDoctorStats() {
    if (!this.idMedico) return;
    this.authService.getEstadisticasMedico(this.idMedico).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.stats = res;
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadCitasAgendadas() {
    if (!this.idMedico) {
      this.isLoading = false;
      return;
    }

    this.authService.getCitasPendientes(this.idMedico).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          const allCitas = res.citas || res.data || [];
          console.log('Respuesta API Citas (Raw):', allCitas);

          // Filtrar Confirmadas (2)
          this.citasAgendadas = allCitas.filter((c: any) => c.id_estado == 2 || c.estado == 2 || c.nombre_estado === 'Aprobada' || c.nombre_estado === 'Confirmada');

          // Filtrar Pendientes (1) para la alerta
          this.citasPorAprobar = allCitas.filter((c: any) => c.id_estado == 1 || c.estado == 1 || c.nombre_estado === 'Pendiente');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error al cargar citas:', err);
        this.presentToast('Error de conexión al cargar las citas.', 'danger');
      }
    });
  }

  loadPendingConsultations() {
    if (!this.idMedico) return;

    this.authService.getConsultasParaMedico(this.idMedico).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          const allMsgs = res.data || [];
          this.pendingConsultationsCount = allMsgs.filter((m: any) => m.estado === 'pendiente').length;
        }
      },
      error: (err: any) => console.error('Error cargando consultas pendientes', err)
    });
  }

  // --- Funciones de Acción Rápida ---

  updateCitaEstado(idCita: number, idEstado: number, successMessage: string) {
    const data = {
      id_cita: idCita,
      id_estado: idEstado
    };

    this.authService.updateCitaEstado(data).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.presentToast(successMessage, 'success');
          this.loadCitasAgendadas();
        } else {
          this.presentToast(res.message, 'danger');
        }
      },
      error: (err: any) => {
        this.presentToast('Error al actualizar el estado de la cita.', 'danger');
        console.error('Error al actualizar cita:', err);
      }
    });
  }

  // --- Funciones de Navegación ---

  goToConsultas() {
    this.router.navigate(['/consultas-medico']);
  }

  goToCrearCita() {
    this.router.navigate(['/crear-cita-medico']);
  }

  goToAprobarCita() {
    this.router.navigate(['/gestion-citas', { gestion: 'aprobacion' }]);
  }

  goToModificarCita() {
    this.router.navigate(['/gestion-citas', { gestion: 'modificacion' }]);
  }

  goToEliminarCita() {
    this.router.navigate(['/gestion-citas', { gestion: 'eliminacion' }]);
  }

  goToGestionDisponibilidad() {
    this.router.navigate(['/gestion-disponibilidad-medico']);
  }

  // --- Utilidades ---

  /**
   * 🚨 LOGOUT MEJORADO: 
   * Usamos navigateRoot para limpiar el historial de navegación.
   * Esto evita que al estar en el Login puedas regresar al Panel Médico.
   */
  async logout() {
    this.authService.logoutSession();
    this.navCtrl.navigateRoot('/login', {
      animated: true,
      animationDirection: 'back'
    });
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}
