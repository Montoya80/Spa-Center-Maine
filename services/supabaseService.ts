
import { getSupabase } from './supabaseClient';
import { Patient, Appointment, Product, BusinessConfig, SupabaseConfig } from '../types';

/**
 * Servicio de Sincronización para Maine SPA
 * Permite que la App funcione localmente y se respalde en la nube.
 */

export const syncPatientToCloud = async (config: SupabaseConfig, patient: Patient) => {
  const supabase = getSupabase(config);
  if (!supabase) return;

  const { error } = await supabase
    .from('patients')
    .upsert({
      id: patient.id.includes('p') ? undefined : patient.id, // Supabase prefiere UUID o IDs limpios
      client_code: patient.clientCode,
      full_name: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      birth_date: patient.birthDate,
      skin_type: patient.skinType,
      allergies: patient.allergies,
      password: patient.password,
      is_blocked: patient.isBlocked,
      metadata: patient // Guardamos el objeto completo como JSON por seguridad
    }, { onConflict: 'client_code' });

  if (error) console.error('Error syncing patient:', error);
};

export const syncAppointmentToCloud = async (config: SupabaseConfig, apt: Appointment) => {
  const supabase = getSupabase(config);
  if (!supabase) return;

  const { error } = await supabase
    .from('appointments')
    .upsert({
      id: apt.id.includes('apt') ? undefined : apt.id,
      patient_id: apt.patientId,
      patient_name: apt.patientName,
      date: apt.date,
      time: apt.time,
      service: apt.service,
      price: apt.price,
      status: apt.status,
      assigned_to: apt.assignedTo
    });

  if (error) console.error('Error syncing appointment:', error);
};

export const syncProductToCloud = async (config: SupabaseConfig, product: Product) => {
  const supabase = getSupabase(config);
  if (!supabase) return;

  const { error } = await supabase
    .from('inventory')
    .upsert({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      category_type: product.categoryType,
      active: product.active
    });

  if (error) console.error('Error syncing product:', error);
};

export const fetchAllFromCloud = async (config: SupabaseConfig) => {
    const supabase = getSupabase(config);
    if (!supabase) return null;

    const [pats, apts, inv] = await Promise.all([
        supabase.from('patients').select('*'),
        supabase.from('appointments').select('*'),
        supabase.from('inventory').select('*')
    ]);

    return {
        patients: pats.data || [],
        appointments: apts.data || [],
        inventory: inv.data || []
    };
};
