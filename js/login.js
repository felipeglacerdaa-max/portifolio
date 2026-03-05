import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');
    const loginBtn = document.getElementById('login-btn');

    // Mudar ícone do botão enquanto carrega
    const setLoading = (isLoading) => {
        if (isLoading) {
            loginBtn.innerHTML = 'Entrando... <i class="ph ph-spinner ph-spin"></i>';
            loginBtn.style.opacity = '0.7';
            loginBtn.style.pointerEvents = 'none';
        } else {
            loginBtn.innerHTML = 'Entrar <i class="ph ph-sign-in"></i>';
            loginBtn.style.opacity = '1';
            loginBtn.style.pointerEvents = 'auto';
        }
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        setLoading(true);

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                throw error;
            }

            // Redirecionar para admin.html em caso de sucesso
            window.location.href = 'admin.html';

        } catch (error) {
            console.error('Erro de login:', error.message);
            errorMsg.textContent = 'E-mail ou senha incorretos.';
            errorMsg.style.display = 'block';
        } finally {
            setLoading(false);
        }
    });

    // Checar se já está logado
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            window.location.href = 'admin.html';
        }
    };

    checkSession();
});
