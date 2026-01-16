/**
 * Gestión Citas Admin Page
 * 
 * Descripción: Módulo completo para la administración de citas médicas.
 * Permite a los administradores:
 * 1. Ver listado global de citas.
 * 2. Agendar nuevas citas manualmente.
 * 3. Modificar o Cancelar citas existentes.
 * 
 * Uso: Administradores.
 */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { IonicModule, ToastController, AlertController, ModalController } from '@ionic/angular';
import { format } from 'date-fns'; // Necesario para formatear fechas

@Component({
  selector: 'app-gestion-citas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './gestion-citas-admin.page.html',
  styleUrls: ['./gestion-citas-admin.page.scss'],
})
export class GestionCitasAdminPage implements OnInit {

  accion: string = ''; // Recibe 'crear', 'modificar', 'eliminar'
  pageTitle: string = 'Gestión de Citas';

  listaCitas: any[] = [];
  estadosCita: any[] = [];
  listaMedicos: any[] = [];
  listaPacientes: any[] = []; // Nuevo: Para el selector de pacientes

  // Modelo para la edición
  citaEnEdicion: any = null;

  // Modelo para creación
  nuevaCita: any = {
    id_paciente: null,
    id_medico: null,
    fecha_cita: '',
    hora_cita: '',
    motivo: '',
    id_estado: 1 // Pendiente por defecto
  };

  isLoading: boolean = false;
  message: string | null = null;
  error: boolean = false;
  isSaving: boolean = false;

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.accion = this.route.snapshot.paramMap.get('accion') || 'crear';
    this.setPageTitle(this.accion);

    this.loadMetadata(); // Cargar auxiliares (Médicos, Pacientes, Estados)

    if (this.accion === 'modificar' || this.accion === 'eliminar') {
      this.loadCitasList();
    }
  }

  setPageTitle(accion: string) {
    switch (accion) {
      case 'crear': this.pageTitle = 'Agendar Nueva Cita'; break;
      case 'modificar': this.pageTitle = 'Modificar Citas'; break;
      case 'eliminar': this.pageTitle = 'Eliminar Citas'; break;
      default: this.pageTitle = 'Gestión de Citas';
    }
  }

  loadMetadata() {
    this.estadosCita = [
      { id: 1, nombre: 'Pendiente de aprobación' },
      { id: 2, nombre: 'Cita confirmada' },
      { id: 3, nombre: 'Cita rechazada' },
      { id: 4, nombre: 'Cita modificada Confirmada' },
      { id: 5, nombre: 'Cita modificada Rechazada' }
    ];

    // Cargar Médicos
    this.authService.getMedicos().subscribe((res: any) => {
      if (res.status === 'success') this.listaMedicos = res.data || [];
    });

    // Cargar Pacientes (Solo si es modo crear para no sobrecargar)
    if (this.accion === 'crear') {
      this.authService.getAllPacientes().subscribe((res: any) => {
        if (res.status === 'success') this.listaPacientes = res.data || [];
      });
    }
  }

  // --- Consulta de Citas (CRUD: Read) ---
  loadCitasList() {
    this.isLoading = true;
    this.message = 'Cargando lista de citas...';
    this.error = false;

    this.authService.getAllCitas().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.listaCitas = res.data || [];
          this.message = res.data.length > 0 ? null : res.message;
        } else {
          this.message = res.message;
          this.error = true;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.message = 'Error de conexión con el servidor.';
        this.error = true;
        console.error('Error al cargar citas:', err);
      }
    });
  }

  // --- Creación de Cita (CRUD: Create) ---
  onCreateCita() {
    this.isSaving = true;
    this.message = 'Agendando cita...';

    // Preparar datos (backend espera id_paciente, id_medico, fecha, hora, motivo)
    const data = {
      id_paciente: this.nuevaCita.id_paciente,
      id_medico: this.nuevaCita.id_medico,
      fecha: this.nuevaCita.fecha_cita,
      hora: this.nuevaCita.hora_cita,
      motivo: this.nuevaCita.motivo
    };

    this.authService.agendarCita(data).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.status === 'success') {
          this.presentToast('Cita agendada exitosamente.', 'success');
          // Limpiar formulario o redirigir
          this.nuevaCita = { id_paciente: null, id_medico: null, fecha_cita: '', hora_cita: '', motivo: '', id_estado: 1 };
          this.router.navigate(['/sistema']);
        } else {
          this.presentToast(res.message, 'danger');
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.presentToast('Error al agendar cita.', 'danger');
        console.error(err);
      }
    });
  }

  // --- Edición de Cita (CRUD: Update) ---
  onEdit(cita: any) {
    this.citaEnEdicion = {
      id_cita: cita.id_cita,
      id_paciente: cita.id_paciente,
      id_medico: cita.id_medico,
      id_estado: cita.id_estado,
      fecha_cita: format(new Date(cita.fecha_cita), 'yyyy-MM-dd'),
      hora_cita: cita.hora_cita,
      motivo: cita.motivo
    };
    this.message = null;
  }

  onUpdateCita() {
    this.isSaving = true;
    this.message = 'Guardando cambios...';

    this.authService.updateCitaAdmin(this.citaEnEdicion).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res.status === 'success') {
          this.presentToast(res.message, 'success');
          this.citaEnEdicion = null;
          this.loadCitasList();
        } else {
          this.presentToast(res.message, 'danger');
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.message = 'Error de conexión.';
        console.error(err);
      }
    });
  }

  // --- Eliminación de Cita (CRUD: Delete) ---
  async onDelete(cita: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro de eliminar la cita del paciente ${cita.paciente_nombres} (${cita.fecha_cita} - ${cita.hora_cita})?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => {
            this.deleteCita(cita.id_cita);
          }
        }
      ]
    });
    await alert.present();
  }

  deleteCita(idCita: number) {
    this.isLoading = true;
    this.message = 'Eliminando cita...';

    this.authService.deleteCita(idCita).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.presentToast(res.message, 'success');
          this.loadCitasList();
        } else {
          this.presentToast(res.message, 'danger');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.presentToast('Error de conexión.', 'danger');
        console.error(err);
      }
    });
  }

  // --- Utilidades ---
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
