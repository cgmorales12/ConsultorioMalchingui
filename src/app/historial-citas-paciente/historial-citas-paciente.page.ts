import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for Standalone or when using imports
import { IonicModule, NavController, AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth';

@Component({
    selector: 'app-historial-citas-paciente',
    templateUrl: './historial-citas-paciente.page.html',
    styleUrls: ['./historial-citas-paciente.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule]
})
export class HistorialCitasPacientePage implements OnInit {

    historial: any[] = [];
    isLoading: boolean = false;
    idPaciente: number | null = null;

    constructor(
        private authService: AuthService,
        private navCtrl: NavController,
        private alertController: AlertController,
        private toastController: ToastController
    ) { }

    ngOnInit() {
        this.loadHistorial();
    }

    loadHistorial() {
        this.isLoading = true;

        // 🚨 1. Try 'patient_session' from sessionStorage (Correct for Patient App)
        const sessionStr = sessionStorage.getItem('patient_session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            this.idPaciente = session.id_paciente || session.id;
        }

        // 2. Fallbacks (Legacy/Other flows)
        if (!this.idPaciente) {
            const datosPaciente = JSON.parse(localStorage.getItem('datos_paciente') || '{}');
            if (datosPaciente.id_paciente) this.idPaciente = datosPaciente.id_paciente;
        }

        console.log('Cargando historial para ID Paciente:', this.idPaciente); // DEBUG

        if (this.idPaciente) {
            this.authService.getHistorialPaciente(this.idPaciente).subscribe({
                next: (res: any) => {
                    this.isLoading = false;
                    if (res.status === 'success') {
                        this.historial = res.data;
                    }
                },
                error: (err: any) => {
                    this.isLoading = false;
                    console.error(err);
                }
            });
        } else {
            this.isLoading = false;
            console.error("No patient ID found in session");
        }
    }

    async calificarAtencion(cita: any) {
        if (!cita.id_medico) return;

        const alert = await this.alertController.create({
            header: 'Calificar Atención',
            subHeader: `Dr(a). ${cita.medico_nombres} ${cita.medico_apellidos}`,
            message: 'Selecciona una puntuación de 1 a 5 y deja un comentario opcional.',
            inputs: [
                {
                    name: 'puntuacion',
                    type: 'number',
                    placeholder: '1 - 5',
                    min: 1,
                    max: 5
                },
                {
                    name: 'comentario',
                    type: 'textarea',
                    placeholder: 'Escribe tu opinión...'
                }
            ],
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Enviar',
                    handler: (data) => {
                        const pts = parseInt(data.puntuacion);
                        if (!pts || pts < 1 || pts > 5) {
                            this.mostrarToast('Por favor ingresa una puntuación válida (1-5)', 'warning');
                            return false;
                        }
                        this.enviarCalificacion(cita.id_medico, pts, data.comentario);
                        return true;
                    }
                }
            ]
        });
        await alert.present();
    }

    enviarCalificacion(idMedico: number, puntuacion: number, comentario: string) {
        const payload = {
            id_medico: idMedico,
            id_paciente: this.idPaciente,
            puntuacion: puntuacion,
            comentario: comentario
        };

        this.authService.guardarValoracionMedico(payload).subscribe({
            next: async () => {
                this.mostrarToast('¡Gracias por tu valoración!', 'success');
            },
            error: (err) => {
                console.error(err);
                this.mostrarToast('Error al guardar valoración', 'danger');
            }
        });
    }

    async mostrarToast(msg: string, color: string) {
        const t = await this.toastController.create({ message: msg, duration: 2000, color: color });
        t.present();
    }

    goBack() {
        this.navCtrl.back();
    }

    getBadgeColor(accion: string): string {
        switch (accion) {
            case 'CREADA': return 'success';
            case 'MODIFICADA': return 'warning';
            case 'CANCELADA': return 'danger';
            case 'FINALIZADA': return 'primary'; // Asumimos que existe este estado o similar
            default: return 'medium';
        }
    }
}
