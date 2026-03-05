import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Referências na HomePage
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    const githubLinks = document.querySelectorAll('a[href*="github.com"]');
    const linkedinLinks = document.querySelectorAll('a[href*="linkedin.com"]');

    const displayEmail = document.querySelector('#display-email span');
    const displayPhone = document.querySelector('#display-phone span');
    const resumeBtn = document.getElementById('resume-btn');
    const projectsContainer = document.getElementById('projects-container');
    const skillsContainer = document.getElementById('skills-container');

    // Funções de Renderização
    const renderProjects = (projects) => {
        projectsContainer.innerHTML = projects.map(project => `
            <article class="projects__card reveal-up">
                <div class="projects__image-wrapper">
                    ${project.image_url
                ? `<img src="${project.image_url}" alt="${project.title}" class="projects__img">`
                : `<div class="projects__img-placeholder" style="background: linear-gradient(135deg, #1e293b, #0f172a);"></div>`
            }
                </div>
                <div class="projects__content">
                    <span class="projects__subtitle">${project.subtitle || ''}</span>
                    <h3 class="projects__title">${project.title}</h3>
                    <p class="projects__description">${project.description || ''}</p>
                    <div class="projects__tags">
                        ${(project.tags || []).map(tag => `<span class="projects__tag">${tag}</span>`).join('')}
                    </div>
                    ${project.link ? `<a href="${project.link}" target="_blank" class="projects__button">Ver Projeto <i class="ph ph-arrow-up-right"></i></a>` : ''}
                </div>
            </article>
        `).join('');

        // Trigger reveal animation for new elements
        initReveal();
    };

    const renderSkills = (skills) => {
        const categories = {
            'Frontend': skills.filter(s => s.category === 'Frontend'),
            'Backend': skills.filter(s => s.category === 'Backend')
        };

        skillsContainer.innerHTML = Object.keys(categories).map(cat => `
            <div class="skills__content reveal-up">
                <h3 class="skills__title">${cat === 'Backend' ? 'Backend & Ferramentas' : cat}</h3>
                <div class="skills__box">
                    ${categories[cat].map(skill => `
                        <div class="skills__item">
                            <i class="${skill.icon || 'ph ph-code'}"></i> ${skill.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        initReveal();
    };

    const initReveal = () => {
        const observerOptions = { threshold: 0.15 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
    };

    try {
        // 1. Carregar Configurações (Email, Telefone, Social, Resume)
        const { data: settings, error: settingsError } = await supabase
            .from('portfolio_settings')
            .select('*')
            .limit(1)
            .single();

        if (settings) {
            if (settings.email) {
                emailLinks.forEach(link => link.href = `mailto:${settings.email}`);
                if (displayEmail) displayEmail.textContent = settings.email;
            }
            if (settings.phone_number) {
                if (displayPhone) displayPhone.textContent = settings.phone_number;
            }
            if (settings.github_url) {
                githubLinks.forEach(link => link.href = settings.github_url);
            }
            if (settings.linkedin_url) {
                linkedinLinks.forEach(link => link.href = settings.linkedin_url);
            }
            if (settings.resume_link) {
                resumeBtn.href = settings.resume_link;
                resumeBtn.style.display = 'inline-flex';
            }
        }

        // 2. Carregar Projetos
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .order('display_order', { ascending: true });

        if (projects && projects.length > 0) {
            renderProjects(projects);
        }

        // 3. Carregar Habilidades
        const { data: skills, error: skillsError } = await supabase
            .from('skills')
            .select('*')
            .order('display_order', { ascending: true });

        if (skills && skills.length > 0) {
            renderSkills(skills);
        }

    } catch (err) {
        console.error('Erro na inicialização dinâmica do portfólio:', err);
    }
});
