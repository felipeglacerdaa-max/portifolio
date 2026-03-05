import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Referências na HomePage
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]'); // Pega botões como "Diga Olá"
    const githubLinks = document.querySelectorAll('a[href*="github.com"]');
    const linkedinLinks = document.querySelectorAll('a[href*="linkedin.com"]');

    try {
        const { data, error } = await supabase
            .from('portfolio_settings')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') console.error('Supabase fetch error:', error);
            return;
        }

        if (data) {
            // Atualizar Email Dinamicamente
            if (data.email) {
                emailLinks.forEach(link => {
                    link.href = `mailto:${data.email}`;
                });
            }

            // Atualizar GitHub Dinamicamente (mantendo as lógicas que já tem nele, só alterando o href)
            if (data.github_url) {
                githubLinks.forEach(link => {
                    link.href = data.github_url;
                });
            }

            // Atualizar LinkedIn Dinamicamente
            if (data.linkedin_url) {
                linkedinLinks.forEach(link => {
                    link.href = data.linkedin_url;
                });
            }

            // (Opcional) Podemos adicionar o link do currículo no botão de "Contato" ou em outro lugar na UI futuramente
            // Exemplo: se tivesse um botão com id "download-cv", faríamos:
            // if(data.resume_link) document.getElementById('download-cv').href = data.resume_link;
        }
    } catch (err) {
        console.error('Erro na inicialização dinâmica do portfólio:', err);
    }
});
