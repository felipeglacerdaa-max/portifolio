import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// =========================================================================
// ATENÇÃO USUÁRIO (FELIPE):
// Cole aqui sua URL e Anon Key do projeto Supabase para ativar o Admin
// =========================================================================

const supabaseUrl = 'https://wqwrihaijmogmpmeekka.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxd3JpaGFpam1vZ21wbWVla2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTgzNDgsImV4cCI6MjA4ODI5NDM0OH0.Dy53eJ4JvQ5rNq6wDJtkqLF1-j5oVpQqnAP2BNP2i4o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
