
import { createClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

let supabaseInstance: any = null;

export const getSupabase = (config?: SupabaseConfig) => {
  if (supabaseInstance) return supabaseInstance;
  
  if (!config || !config.url || !config.anonKey) {
    return null;
  }

  supabaseInstance = createClient(config.url, config.anonKey);
  return supabaseInstance;
};

export const testSupabaseConnection = async (url: string, key: string) => {
  try {
    const client = createClient(url, key);
    // Intentamos una operación básica para validar
    const { data, error } = await client.from('_dummy_table_check').select('*').limit(1);
    
    // Si el error es 404 de la tabla, significa que la conexión es exitosa pero la tabla no existe (lo cual es normal)
    if (error && error.code === 'PGRST116') return { success: true, message: 'Conexión establecida correctamente.' };
    if (error && error.message.includes('fetch')) throw new Error('URL inválida o sin respuesta.');
    
    return { success: true, message: 'Conexión exitosa.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error desconocido al conectar.' };
  }
};

/**
 * SQL MIGRATION SCRIPT
 * Proporciona el código necesario para inicializar Supabase.
 */
export const SUPABASE_SQL_SCHEMA = `
-- TABLA DE PACIENTES
create table patients (
  id uuid primary key default uuid_generate_v4(),
  client_code text unique not null,
  file_number text,
  full_name text not null,
  email text,
  phone text,
  birth_date date,
  skin_type text,
  allergies text,
  password text,
  is_blocked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- TABLA DE CITAS
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(id),
  date date not null,
  time time not null,
  service text not null,
  price decimal(10,2),
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  assigned_to text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- TABLA DE INVENTARIO
create table inventory (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price decimal(10,2),
  stock integer default 0,
  category text,
  category_type text check (category_type in ('retail', 'professional')),
  active boolean default true
);
`;
