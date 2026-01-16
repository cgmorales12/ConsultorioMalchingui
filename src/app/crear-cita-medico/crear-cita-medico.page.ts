import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth';

@Component({
    selector: 'app-crear-cita-medico',
    templateUrl: './crear-cita-medico.page.html',
    styleUrls: ['./crear-cita-medico.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule]
})
export class CrearCitaMedicoPage implements OnInit {

    pacientes: any[] = [];
    medicos: any[] = [];
    fechasDisponibles: any[] = []; // Array to store available dates
    horasDisponibles: any[] = []; // Array to store available time slots
    cita: {
        id_paciente: number | null;
        id_medico: number | null;
        fecha_cita: string;
        hora_cita: string;
        motivo: string;
        estado: number;
    } = {
            id_paciente: null,
            id_medico: null,
            fecha_cita: '',
            hora_cita: '',
            motivo: '',
            estado: 1
        };

    constructor(
        private navCtrl: NavController,
        private authService: AuthService,
        private toastController: ToastController
    ) { }

    ngOnInit() {
        this.loadPacientes();
        this.loadMedicos();

        // 🚨 CORRECCIÓN: Usar ID de médico de la sesión
        const session = this.authService.getSession();
        const idMedico = session.id_medico || session.id_usuario;

        if (idMedico) {
            this.cita.id_medico = idMedico;
            // Si ya hay medico, y fecha seleccionada (raro en init), cargar horas
        }
    }

    onMedicoChange() {
        this.loadFechasDisponibles();
        this.cita.fecha_cita = '';
        this.cita.hora_cita = '';
        this.horasDisponibles = [];
    }

    loadFechasDisponibles() {
        this.fechasDisponibles = [];
        if (!this.cita.id_medico) return;

        // This endpoint gets the configured availability blocks (days the doctor works)
        this.authService.getDisponibilidadByMedico(this.cita.id_medico).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    // Extract unique dates
                    const days = res.data.map((d: any) => d.fecha_dia);
                    this.fechasDisponibles = [...new Set(days)].sort();
                } else {
                    this.fechasDisponibles = [];
                }
            },
            error: (err) => {
                this.fechasDisponibles = [];
                console.error(err);
            }
        });
    }

    onFechaChange() {
        this.checkAvailability();
    }

    checkAvailability() {
        this.horasDisponibles = [];
        this.cita.hora_cita = ''; // Reset hour selection

        if (!this.cita.fecha_cita || !this.cita.id_medico) return;

        // This endpoint gets the calculated free slots for a specific date
        this.authService.getDisponibilidad(this.cita.fecha_cita, this.cita.id_medico).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.horasDisponibles = res.data;
                } else {
                    this.presentToast('No hay horarios disponibles para esta fecha. Intente con otra.', 'warning');
                }
            },
            error: (err) => {
                console.error(err);
                this.horasDisponibles = [];
            }
        });
    }

    loadMedicos() {
        this.authService.getMedicos().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.medicos = res.data;
                }
            },
            error: (err) => console.error('Error cargando medicos', err)
        });
    }

    loadPacientes() {
        this.authService.getAllPacientes().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.pacientes = res.data;
                }
            },
            error: (err: any) => {
                console.error('Error cargando pacientes', err);
            }
        });
    }

    crearCita() {
        if (!this.cita.id_paciente || !this.cita.fecha_cita || !this.cita.hora_cita || !this.cita.motivo) {
            this.presentToast('Por favor complete todos los campos', 'warning');
            return;
        }

        this.authService.agendarCita(this.cita).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.presentToast('Cita creada exitosamente', 'success');
                    this.navCtrl.back();
                } else {
                    this.presentToast(res.message || 'Error al crear cita', 'danger');
                }
            },
            error: (err) => {
                console.error('Error creando cita', err);
                this.presentToast('Error de conexión', 'danger');
            }
        });
    }

    async presentToast(message: string, color: string) {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            color
        });
        toast.present();
    }

    goBack() {
        this.navCtrl.back();
    }

}
