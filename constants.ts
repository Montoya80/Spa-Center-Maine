
import { Patient, Appointment, Service, Promotion, BusinessConfig, Employee, WorkSchedule, Product } from './types';

const getToday = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const DEFAULT_SCHEDULE: WorkSchedule[] = [
    { dayOfWeek: 1, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 2, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 3, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 4, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 5, active: true, startTime: '09:00', endTime: '18:00' },
    { dayOfWeek: 6, active: true, startTime: '10:00', endTime: '14:00' },
    { dayOfWeek: 0, active: false, startTime: '00:00', endTime: '00:00' },
];

export const JOB_TITLES = [
    "Director/a Médico",
    "Dermatólogo/a",
    "Enfermera Estética",
    "Cosmetóloga Pro",
    "Recepcionista",
    "Terapeuta",
    "Administración",
    "Ventas"
];

export const MEXICAN_BANKS = ["BBVA", "Santander", "Banamex", "Banorte", "HSBC", "Mercado Pago", "Nu", "Banco Azteca", "Scotiabank", "Inbursa"];

export const MOCK_EMPLOYEES: Employee[] = [
    {
        id: 'e1',
        fullName: 'Dr. Roberto Méndez',
        email: 'roberto.m@mainespa.com',
        phone: '5532229490',
        password: '123qweASD',
        birthDate: '1980-05-12',
        hireDate: '2019-01-01',
        jobTitle: 'Director/a Médico',
        role: 'Director General',
        permissions: ['all'],
        avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=200&q=80',
        workSchedule: DEFAULT_SCHEDULE,
        attendanceLog: [],
        address: { street: 'Av. Paseo de la Reforma 222', city: 'CDMX', state: 'Ciudad de México', zip: '06600' },
        bankingInfo: { bankName: 'BBVA', accountNumber: '0123456789', clabe: '012180001234567890', cardNumber: '4152313245678901', accountHolder: 'Roberto Méndez' },
        status: 'active'
    },
    {
        id: 'e2',
        fullName: 'Lic. Claudia Vera',
        email: 'claudia.v@mainespa.com',
        phone: '5551234567',
        password: 'user123',
        birthDate: '1992-08-24',
        hireDate: '2021-03-15',
        jobTitle: 'Enfermera Estética',
        role: 'Especialista Inyectables',
        permissions: ['view_appointments', 'edit_appointments', 'view_patients', 'manage_inventory'],
        avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=200&q=80',
        workSchedule: DEFAULT_SCHEDULE,
        attendanceLog: [{ date: getToday(), checkIn: '08:50', status: 'present' }],
        address: { street: 'Calle Luna 45', city: 'Nezahualcóyotl', state: 'Estado de México', zip: '57000' },
        bankingInfo: { bankName: 'Santander', accountNumber: '9876543210', clabe: '014180009876543210', cardNumber: '5579123456789012', accountHolder: 'Claudia Vera' },
        status: 'active'
    }
];

export const INITIAL_PRODUCTS: Product[] = [
    { id: 'i1', name: 'Toxina Botulínica (Botox) 100U', price: 4500, stock: 5, active: true, category: 'Inyectables', categoryType: 'professional', description: 'Vial de uso médico.', imageUrl: 'https://images.unsplash.com/photo-1614859324967-bdf301e567bb?auto=format&fit=crop&w=400&q=80' },
    { id: 'i2', name: 'Ácido Hialurónico (Juvederm)', price: 2200, stock: 12, active: true, category: 'Rellenos', categoryType: 'professional', description: 'Jeringa 1ml.', imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80' },
    { id: 'r1', name: 'Serum Vitamina C', price: 1250, stock: 15, active: true, category: 'Venta', categoryType: 'retail', description: 'Antioxidante.', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80' }
];

export const INITIAL_CONFIG: BusinessConfig = {
  schedule: [
    { dayOfWeek: 1, label: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 2, label: 'Martes', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 3, label: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 4, label: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 5, label: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 6, label: 'Sábado', isOpen: true, openTime: '10:00', closeTime: '14:00' },
    { dayOfWeek: 0, label: 'Domingo', isOpen: false, openTime: '00:00', closeTime: '00:00' },
  ],
  blockedDates: [],
  blockedSlots: [],
  contact: { address: "Calle Ardilla #93, Col. Benito Juarez, Neza", phone: "555-0000", whatsapp: "5615582029", email: "contacto@mainespa.com", mapUrl: "" },
  emailConfig: { smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpUser: '', smtpPass: '', senderEmail: '', senderName: 'Maine SPA', enabled: false },
  bankingInfo: { bankName: 'Banorte', accountNumber: '0000000000', clabe: '072000000000000000', cardNumber: '', accountHolder: 'Maine SPA Center' }
};

export const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: "Limpieza Facial Profunda", price: 850, duration: 60, active: true, imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80" },
  { id: 's2', name: "Aplicación de Botox", price: 3500, duration: 30, active: true, imageUrl: "https://images.unsplash.com/photo-1614859324967-bdf301e567bb?auto=format&fit=crop&w=800&q=80" }
];

export const INITIAL_PROMOS: Promotion[] = [
  { id: 'promo1', title: "Verano Radiante", description: "15% OFF en faciales.", discountText: "15% OFF", active: true, color: "bg-orange-500", price: 800 }
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'p1', clientCode: 'SR12345', fileNumber: '0100', fullName: 'Sofia Rodriguez', birthDate: '1995-05-15', email: 'sofia@example.com', phone: '5550101000', skinType: 'Mixta', allergies: 'Ninguna', emergencyContact: { name: 'Juan Perez', phone: '5559999000' }, avatarUrl: 'https://picsum.photos/200/200?random=1', history: [], progressPhotos: [], clinicRecommendations: '', registrationDate: '2023-10-01' }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'Sofia Rodriguez', date: getToday(), time: '10:00', service: 'Limpieza Facial Profunda', price: 850, status: 'confirmed', assignedTo: 'e1', paymentVerified: true }
];
