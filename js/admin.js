import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar Autenticação Inicialmente
    const checkAuth = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            // Não autorizado, mandar para login
            window.location.replace('login.html');
            return null;
        }

        // Autorizado: Mostrar corpo da página
        document.body.style.display = 'block';
        return session.user;
    };

    const user = await checkAuth();
    if (!user) return; // Interrompe a execução se não estiver logado

    // =========== VARIÁVEIS DO DOM ===========
    const settingsForm = document.getElementById('settings-form');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const githubInput = document.getElementById('github');
    const linkedinInput = document.getElementById('linkedin');
    const resumeInput = document.getElementById('resume');

    const saveBtn = document.getElementById('save-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const toast = document.getElementById('toast');

    let currentSettingsId = null; // Para saber se fazemos INSERT ou UPDATE

    // =========== FUNÇÕES AUXILIARES ===========
    const showToast = (message, isError = false) => {
        toast.querySelector('span').textContent = message;
        toast.className = `toast show ${isError ? 'error' : 'success'}`;

        if (isError) {
            toast.querySelector('i').className = 'ph ph-x-circle';
        } else {
            toast.querySelector('i').className = 'ph ph-check-circle';
        }

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    const setLoading = (isLoading) => {
        if (isLoading) {
            saveBtn.innerHTML = 'Salvando... <i class="ph ph-spinner ph-spin"></i>';
            saveBtn.style.opacity = '0.7';
            saveBtn.style.pointerEvents = 'none';
        } else {
            saveBtn.innerHTML = 'Salvar Alterações <i class="ph ph-floppy-disk"></i>';
            saveBtn.style.opacity = '1';
            saveBtn.style.pointerEvents = 'auto';
        }
    };

    // =========== CARREGAR DADOS ===========
    const loadSettings = async () => {
        try {
            // Busca apenas 1 registro (assumindo que seja portfólio de 1 pessoa)
            const { data, error } = await supabase
                .from('portfolio_settings')
                .select('*')
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // Ignora erro de 0 linhas retornadas
                throw error;
            }

            if (data) {
                currentSettingsId = data.id;
                emailInput.value = data.email || '';
                phoneInput.value = data.phone_number || '';
                githubInput.value = data.github_url || '';
                linkedinInput.value = data.linkedin_url || '';
                resumeInput.value = data.resume_link || '';
            }

        } catch (error) {
            console.error('Erro ao carregar configurações:', error.message);
            showToast('Erro ao carregar dados do banco', true);
        }
    };

    // =========== SALVAR DADOS ===========
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            email: emailInput.value,
            phone_number: phoneInput.value,
            github_url: githubInput.value,
            linkedin_url: linkedinInput.value,
            resume_link: resumeInput.value,
        };

        try {
            let error;
            if (currentSettingsId) {
                // Fazer UPDATE
                const res = await supabase
                    .from('portfolio_settings')
                    .update(payload)
                    .eq('id', currentSettingsId);
                error = res.error;
            } else {
                // Fazer INSERT
                const res = await supabase
                    .from('portfolio_settings')
                    .insert([payload])
                    .select();

                error = res.error;
                if (res.data && res.data.length > 0) {
                    currentSettingsId = res.data[0].id;
                }
            }

            if (error) throw error;
            showToast('Configurações salvas com sucesso!');

        } catch (error) {
            console.error('Erro ao salvar:', error.message);
            showToast('Erro ao salvar no banco. Verifique as permissões RLS.', true);
        } finally {
            setLoading(false);
        }
    });

    // =========== LOGOUT ===========
    logoutBtn.addEventListener('click', async () => {
        try {
            await supabase.auth.signOut();
            window.location.replace('login.html');
        } catch (error) {
            console.error('Erro no logout:', error.message);
        }
    });

    // Inicializar carregamento dos dados se a auth bateu
    loadSettings();
});
