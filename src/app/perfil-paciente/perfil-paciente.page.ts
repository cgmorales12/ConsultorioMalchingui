/**
 * Perfil Paciente Page
 * 
 * Descripción: Panel personal del paciente.
 * Permite ver citas programadas, historial, actualizar datos personales y modificar/cancelar citas.
 * 
 * Uso: Pacientes logueados.
 */
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';

import { AuthService } from '../services/auth';

/**
 * 🚨 COMPONENTE DEL MODAL 
 * Diseñado para que las etiquetas sean fijas y visibles siempre.
 */
@Component({
  selector: 'app-editar-perfil-modal',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Actualizar Perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancelar()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item lines="full">
          <ion-label position="stacked" color="primary">Teléfono:</ion-label>
          <ion-input type="tel" [(ngModel)]="datos.telefono" placeholder="Ej: 0969787084" maxlength="10"></ion-input>
        </ion-item>

        <ion-item lines="full">
          <ion-label position="stacked" color="primary">Email:</ion-label>
          <ion-input type="email" [(ngModel)]="datos.email" placeholder="Ej: correo@gmail.com"></ion-input>
        </ion-item>

        <ion-item lines="full">
          <ion-label position="stacked" color="primary">Dirección:</ion-label>
          <ion-input type="text" [(ngModel)]="datos.direccion" placeholder="Ej: Calderon"></ion-input>
        </ion-item>
      </ion-list>

      <ion-button expand="block" class="ion-margin-top" (click)="guardar()">
        GUARDAR CAMBIOS
      </ion-button>
    </ion-content>
  `
})
class EditarPerfilModalComponent {
  @Input() datos: any;
  constructor(private modalCtrl: ModalController) { }
  cancelar() { return this.modalCtrl.dismiss(null, 'cancel'); }
  guardar() { return this.modalCtrl.dismiss(this.datos, 'confirm'); }
}

/**
 * 🚨 COMPONENTE MODAL PARA MODIFICAR CITA
 * Muestra fechas y horas disponibles dinámicamente.
 */
@Component({
  selector: 'app-modificar-cita-modal',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar color="warning">
        <ion-title>Modificar Cita</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancelar()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item lines="none" class="ion-margin-bottom">
        <ion-label>Fecha de la Cita</ion-label>
      </ion-item>
      
      <div class="ion-text-center ion-margin-bottom">
        <ion-datetime
          presentation="date"
          [(ngModel)]="fecha"
          (ionChange)="onFechaChange($event)"
          [isDateEnabled]="isDateEnabled"
          [min]="minDate"
          locale="es-ES"
        ></ion-datetime>
      </div>

      <ion-item lines="full" class="ion-margin-bottom">
        <ion-label position="stacked">Hora de la Cita</ion-label>
        <ion-select [(ngModel)]="hora" placeholder="Seleccione una hora" [disabled]="loadingHoras || horasDisponibles.length === 0">
          <ion-select-option *ngFor="let slot of horasDisponibles" [value]="slot.hora_inicio">
            {{ slot.hora_inicio }}
          </ion-select-option>
        </ion-select>
        <ion-note slot="helper" *ngIf="loadingHoras">Cargando horas...</ion-note>
        <ion-note slot="helper" color="danger" *ngIf="!loadingHoras && horasDisponibles.length === 0 && fecha">
          No hay horarios disponibles para esta fecha.
        </ion-note>
      </ion-item>

      <ion-item lines="full" class="ion-margin-bottom">
        <ion-label position="stacked">Motivo del cambio (Obligatorio)</ion-label>
        <ion-textarea [(ngModel)]="motivo" placeholder="Explique por qué desea cambiar la cita" auto-grow="true" rows="3"></ion-textarea>
      </ion-item>

      <ion-button expand="block" color="warning" class="ion-margin-top" (click)="guardar()" 
                  [disabled]="!fecha || !hora || !motivo">
        Confirmar Cambios
      </ion-button>
    </ion-content>
  `
})
class ModificarCitaModalComponent implements OnInit {
  @Input() cita: any;
  fecha: string = '';
  hora: string = '';
  motivo: string = '';

  horasDisponibles: any[] = [];
  diasDisponiblesSet: Set<string> = new Set();
  loadingHoras: boolean = false;
  minDate: string = new Date().toISOString();

  constructor(private modalCtrl: ModalController, private authService: AuthService) { }

  ngOnInit() {
    if (this.cita) {
      this.fecha = this.cita.fecha_cita;
      this.hora = this.cita.hora_cita;

      this.cargarDiasDisponibles();
      this.diasDisponiblesSet.add(this.cita.fecha_cita);

      this.cargarHoras();
    }
  }

  cargarDiasDisponibles() {
    this.authService.getDisponibilidadByMedico(this.cita.id_medico).subscribe((res: any) => {
      if (res.status === 'success') {
        res.data.forEach((d: any) => {
          this.diasDisponiblesSet.add(d.fecha_dia);
        });
        this.diasDisponiblesSet = new Set(this.diasDisponiblesSet);
      }
    });
  }

  isDateEnabled = (dateIsoString: string) => {
    const date = new Date(dateIsoString);
    const dateString = date.toISOString().split('T')[0];
    return this.diasDisponiblesSet.has(dateString);
  };

  onFechaChange(event: any) {
    const val = event.detail.value;
    if (val) {
      if (typeof val === 'string') {
        this.fecha = val.split('T')[0];
      } else if (Array.isArray(val)) {
        this.fecha = val[0].split('T')[0];
      }
      this.cargarHoras();
    }
  }

  cargarHoras() {
    if (!this.fecha) return;

    this.loadingHoras = true;
    this.horasDisponibles = [];

    this.authService.getDisponibilidad(this.fecha, this.cita.id_medico).subscribe({
      next: (res: any) => {
        this.loadingHoras = false;
        if (res.status === 'success') {
          this.horasDisponibles = res.data;

          // Lógica IMPORTANTE: Si es el mismo día y hora original, la hora no saldrá de la DB (porque está ocupada por mí).
          // Debemos inyectarla manualmente para que aparezca seleccionada.
          if (this.fecha === this.cita.fecha_cita) {
            // Cortamos segundos si viene con ellos: '14:30:00' -> '14:30'
            const miHoraShort = this.cita.hora_cita.substring(0, 5);
            // Verificamos si ya está (raro, pero posible)
            const existe = this.horasDisponibles.find((h: any) => h.hora_inicio === miHoraShort);
            if (!existe) {
              // La agregamos y ordenamos
              this.horasDisponibles.push({ hora_inicio: miHoraShort, id_disponibilidad: 999 });
              this.horasDisponibles.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
            }
            // Aseguramos que el valor seleccionado coincida con el formato corto
            this.hora = miHoraShort;
          }
        }
      },
      error: () => {
        this.loadingHoras = false;
      }
    });
  }

  cancelar() { return this.modalCtrl.dismiss(null, 'cancel'); }

  guardar() {
    const fechaFinal = this.fecha.split('T')[0];
    return this.modalCtrl.dismiss({
      nueva_fecha: fechaFinal,
      nueva_hora: this.hora,
      motivo: this.motivo
    }, 'confirm');
  }
}

/**
 * ✅ CLASE PRINCIPAL DEL PERFIL DEL PACIENTE
 */
@Component({
  selector: 'app-perfil-paciente',
  templateUrl: './perfil-paciente.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class PerfilPacientePage {
  paciente: any = {};
  citas: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }


  ionViewWillEnter() {
    const dataStr = sessionStorage.getItem('patient_session');
    if (dataStr) {
      this.paciente = JSON.parse(dataStr);
      this.cargarCitas();
    } else {
      this.router.navigate(['/login-paciente'], { replaceUrl: true });
    }
  }

  cargarCitas() {
    this.authService.getAllCitas().subscribe((res: any) => {
      if (res && res.status === 'success') {
        // Filtrado por el nombre del paciente logueado
        this.citas = res.data.filter((c: any) => c.paciente_nombres === this.paciente.nombres);
      }
    });
  }

  irAAgendar() { this.router.navigate(['/agendar-cita']); }
  irAConsulta() { this.router.navigate(['/mis-consultas-paciente']); }
  irAHistorial() { this.router.navigate(['/historial-citas-paciente']); }

  /**
   * 🛠️ Abre el MODAL en lugar de un Alert para garantizar que las
   * etiquetas "Teléfono:", "Email:" y "Dirección:" sean visibles.
   */
  async abrirModificar() {
    const modal = await this.modalCtrl.create({
      component: EditarPerfilModalComponent,
      componentProps: {
        // Pasamos una copia de los datos actuales
        datos: {
          telefono: this.paciente.telefono,
          email: this.paciente.email,
          direccion: this.paciente.direccion
        }
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.actualizarDatos(data);
    }
  }

  actualizarDatos(nuevosDatos: any) {
    const payload = {
      cedula: this.paciente.cedula, // 0910243229
      nombres: this.paciente.nombres,
      apellidos: this.paciente.apellidos,
      fecha_nacimiento: this.paciente.fecha_nacimiento,
      telefono: nuevosDatos.telefono,
      email: nuevosDatos.email,
      direccion: nuevosDatos.direccion
    };

    this.authService.updatePaciente(payload).subscribe({
      next: async (res: any) => {
        if (res && res.status === 'success') {
          // Actualizamos la vista local y el almacenamiento
          this.paciente = { ...this.paciente, ...nuevosDatos };
          sessionStorage.setItem('patient_session', JSON.stringify(this.paciente));
          this.mostrarToast('Datos actualizados correctamente', 'success');
        } else {
          this.mostrarToast('Error: ' + res.message, 'danger');
        }
      },
      error: () => this.mostrarToast('Error de conexión con el servidor', 'danger')
    });
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  // --- NUEVOS MÉTODOS PARA GESTIÓN DE CITAS PACIENTE ---

  async modificarCita(cita: any) {
    const modal = await this.modalCtrl.create({
      component: ModificarCitaModalComponent,
      componentProps: { cita: cita }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      if (!data.motivo || !data.nueva_fecha || !data.nueva_hora) {
        this.mostrarToast('Datos incompletos', 'warning');
        return;
      }
      this.enviarActualizacion(cita.id_cita, 'modificar', data.motivo, data.nueva_fecha, data.nueva_hora);
    }
  }

  async rechazarCita(cita: any) {
    const alert = await this.alertController.create({
      header: 'Rechazar/Cancelar Cita',
      message: '¿Está seguro que desea cancelar esta cita? Esta acción no se puede deshacer.',
      inputs: [
        {
          name: 'motivo',
          type: 'textarea',
          placeholder: 'Motivo de cancelación (Obligatorio)'
        }
      ],
      buttons: [
        {
          text: 'Volver',
          role: 'cancel'
        },
        {
          text: 'Cancelar Cita',
          role: 'destructive',
          handler: (data) => {
            if (!data.motivo) {
              this.mostrarToast('Debe ingresar un motivo.', 'warning');
              return false;
            }
            this.enviarActualizacion(cita.id_cita, 'rechazar', data.motivo);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  enviarActualizacion(id_cita: number, accion: string, motivo: string, fecha?: string, hora?: string) {
    const payload: any = {
      id_cita: id_cita,
      accion: accion,
      motivo_accion: motivo
    };

    if (accion === 'modificar') {
      payload.nueva_fecha = fecha;
      payload.nueva_hora = hora;
    }

    this.authService.updateCitaPaciente(payload).subscribe({
      next: (res: any) => {
        if (res && res.status === 'success') {
          this.mostrarToast(res.message, 'success');
          this.cargarCitas(); // Recargar lista
        } else {
          this.mostrarToast('Error: ' + res.message, 'danger');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.mostrarToast('Error de conexión', 'danger');
      }
    });
  }

  logout() {
    sessionStorage.removeItem('patient_session');
    this.router.navigate(['/home'], { replaceUrl: true });
  }
}