import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar Autenticação Inicialmente
    const checkAuth = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            window.location.replace('login');
            return null;
        }
        document.body.style.display = 'block';
        return session.user;
    };

    const user = await checkAuth();
    if (!user) return;

    // =========== NAVEGAÇÃO ENTRE SEÇÕES ===========
    const navButtons = document.querySelectorAll('.section-nav__btn');
    const sections = document.querySelectorAll('.admin__section');
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show-menu');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navToggle && navMenu.classList.contains('show-menu')) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('show-menu');
            }
        }
    });

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;

            navButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${target}-section`).classList.add('active');

            // Close mobile menu on click
            if (navMenu) {
                navMenu.classList.remove('show-menu');
            }
        });
    });

    // =========== VARIÁVEIS DO DOM ===========
    const toast = document.getElementById('toast');
    const logoutBtn = document.getElementById('logout-btn');

    // Settings
    const settingsForm = document.getElementById('settings-form');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const githubInput = document.getElementById('github');
    const linkedinInput = document.getElementById('linkedin');
    const resumeInput = document.getElementById('resume');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Projects
    const projectForm = document.getElementById('project-form');
    const projectIdInput = document.getElementById('project-id');
    const projectTitleInput = document.getElementById('project-title');
    const projectSubtitleInput = document.getElementById('project-subtitle');
    const projectDescInput = document.getElementById('project-desc');
    const projectTagsInput = document.getElementById('project-tags');
    const projectLinkInput = document.getElementById('project-link');
    const projectImageInput = document.getElementById('project-image');
    const projectImageFileInput = document.getElementById('project-image-file');
    const projectImagePreview = document.getElementById('project-image-preview');
    const projectImagePreviewImg = projectImagePreview.querySelector('img');
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    const projectsList = document.getElementById('projects-list');

    // Skills
    const skillForm = document.getElementById('skill-form');
    const skillIdInput = document.getElementById('skill-id');
    const skillNameInput = document.getElementById('skill-name');
    const skillCategoryInput = document.getElementById('skill-category');
    const skillIconInput = document.getElementById('skill-icon');
    const cancelSkillBtn = document.getElementById('cancel-skill-btn');
    const skillsList = document.getElementById('skills-list');

    let currentSettingsId = null;

    // =========== FUNÇÕES AUXILIARES ===========
    const showToast = (message, isError = false) => {
        toast.querySelector('span').textContent = message;
        toast.className = `toast show ${isError ? 'error' : 'success'}`;
        toast.querySelector('i').className = isError ? 'ph ph-x-circle' : 'ph ph-check-circle';
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const setLoading = (btn, isLoading, originalText) => {
        if (isLoading) {
            btn.innerHTML = 'Processando... <i class="ph ph-spinner ph-spin"></i>';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';
        } else {
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }
    };

    // =========== CONFIGURAÇÕES (SETTINGS) ===========
    const loadSettings = async () => {
        try {
            const { data, error } = await supabase.from('portfolio_settings').select('*').limit(1).single();
            if (error && error.code !== 'PGRST116') throw error;
            if (data) {
                currentSettingsId = data.id;
                emailInput.value = data.email || '';
                phoneInput.value = data.phone_number || '';
                githubInput.value = data.github_url || '';
                linkedinInput.value = data.linkedin_url || '';
                resumeInput.value = data.resume_link || '';
            }
        } catch (error) {
            console.error('Erro:', error.message);
            showToast('Erro ao carregar configurações', true);
        }
    };

    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(saveSettingsBtn, true, 'Salvar Alterações <i class="ph ph-floppy-disk"></i>');
        const payload = {
            email: emailInput.value,
            phone_number: phoneInput.value,
            github_url: githubInput.value,
            linkedin_url: linkedinInput.value,
            resume_link: resumeInput.value,
        };
        try {
            const { error } = currentSettingsId
                ? await supabase.from('portfolio_settings').update(payload).eq('id', currentSettingsId)
                : await supabase.from('portfolio_settings').insert([payload]);
            if (error) throw error;
            showToast('Configurações salvas!');
            await loadSettings();
        } catch (error) {
            showToast('Erro ao salvar', true);
        } finally {
            setLoading(saveSettingsBtn, false, 'Salvar Alterações <i class="ph ph-floppy-disk"></i>');
        }
    });

    // =========== PROJETOS (PROJECTS) ===========
    const loadProjects = async () => {
        try {
            const { data, error } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
            if (error) throw error;
            projectsList.innerHTML = data.map(p => `
                <div class="item-card">
                    <div class="item-info">
                        <h4>${p.title}</h4>
                        <p>${p.subtitle || ''}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon" onclick="editProject('${p.id}')"><i class="ph ph-pencil"></i></button>
                        <button class="btn-icon btn-icon--delete" onclick="deleteProject('${p.id}')"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
            `).join('');
        } catch (error) { showToast('Erro ao carregar projetos', true); }
    };

    window.editProject = async (id) => {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
        if (data) {
            projectIdInput.value = data.id;
            projectTitleInput.value = data.title;
            projectSubtitleInput.value = data.subtitle || '';
            projectDescInput.value = data.description || '';
            projectTagsInput.value = (data.tags || []).join(', ');
            projectLinkInput.value = data.link || '';
            projectImageInput.value = data.image_url || '';
            projectImageFileInput.value = ''; // Reset file input

            if (data.image_url) {
                projectImagePreview.style.display = 'block';
                projectImagePreviewImg.src = data.image_url;
            } else {
                projectImagePreview.style.display = 'none';
                projectImagePreviewImg.src = '';
            }

            document.getElementById('save-project-btn').innerHTML = 'Atualizar Projeto <i class="ph ph-check"></i>';
            cancelProjectBtn.style.display = 'block';
            document.getElementById('projects-section').scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.deleteProject = async (id) => {
        if (!confirm('Excluir este projeto?')) return;
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) showToast('Erro ao excluir', true);
        else { showToast('Projeto excluído'); loadProjects(); }
    };

    cancelProjectBtn.addEventListener('click', () => {
        projectForm.reset();
        projectIdInput.value = '';
        projectImageInput.value = '';
        projectImagePreview.style.display = 'none';
        projectImagePreviewImg.src = '';
        document.getElementById('save-project-btn').innerHTML = 'Adicionar Projeto <i class="ph ph-plus"></i>';
        cancelProjectBtn.style.display = 'none';
    });

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = projectIdInput.value;

        setLoading(document.getElementById('save-project-btn'), true, '');

        let finalImageUrl = projectImageInput.value;

        // Verify if a new file was selected for upload
        if (projectImageFileInput.files && projectImageFileInput.files.length > 0) {
            const file = projectImageFileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload the file to the 'project-images' bucket
            const { error: uploadError } = await supabase.storage
                .from('project-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Detalhes do Erro de Upload no Supabase:", uploadError);
                setLoading(document.getElementById('save-project-btn'), false, id ? 'Atualizar Projeto <i class="ph ph-check"></i>' : 'Adicionar Projeto <i class="ph ph-plus"></i>');
                showToast('Erro ao fazer upload da imagem', true);
                return;
            }

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-images')
                .getPublicUrl(filePath);

            finalImageUrl = publicUrl;
        }

        const payload = {
            title: projectTitleInput.value,
            subtitle: projectSubtitleInput.value,
            description: projectDescInput.value,
            tags: projectTagsInput.value.split(',').map(t => t.trim()).filter(t => t),
            link: projectLinkInput.value,
            image_url: finalImageUrl || null,
        };

        const { error } = id
            ? await supabase.from('projects').update(payload).eq('id', id)
            : await supabase.from('projects').insert([payload]);
        setLoading(document.getElementById('save-project-btn'), false, id ? 'Atualizar Projeto <i class="ph ph-check"></i>' : 'Adicionar Projeto <i class="ph ph-plus"></i>');

        if (error) showToast('Erro ao salvar projeto', true);
        else {
            showToast(id ? 'Projeto atualizado' : 'Projeto adicionado');
            cancelProjectBtn.click();
            loadProjects();
        }
    });

    // =========== HABILIDADES (SKILLS) ===========
    const loadSkills = async () => {
        try {
            const { data, error } = await supabase.from('skills').select('*').order('display_order', { ascending: true });
            if (error) throw error;
            skillsList.innerHTML = data.map(s => `
                <div class="item-card">
                    <div class="item-info">
                        <h4>${s.name}</h4>
                        <p>${s.category}</p>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon" onclick="editSkill('${s.id}')"><i class="ph ph-pencil"></i></button>
                        <button class="btn-icon btn-icon--delete" onclick="deleteSkill('${s.id}')"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
            `).join('');
        } catch (error) { showToast('Erro ao carregar habilidades', true); }
    };

    window.editSkill = async (id) => {
        const { data, error } = await supabase.from('skills').select('*').eq('id', id).single();
        if (data) {
            skillIdInput.value = data.id;
            skillNameInput.value = data.name;
            skillCategoryInput.value = data.category;
            skillIconInput.value = data.icon || '';

            document.getElementById('save-skill-btn').innerHTML = 'Atualizar <i class="ph ph-check"></i>';
            cancelSkillBtn.style.display = 'block';
        }
    };

    window.deleteSkill = async (id) => {
        if (!confirm('Excluir habilidade?')) return;
        const { error } = await supabase.from('skills').delete().eq('id', id);
        if (error) showToast('Erro ao excluir', true);
        else { showToast('Habilidade excluída'); loadSkills(); }
    };

    cancelSkillBtn.addEventListener('click', () => {
        skillForm.reset();
        skillIdInput.value = '';
        document.getElementById('save-skill-btn').innerHTML = 'Adicionar Habilidade <i class="ph ph-plus"></i>';
        cancelSkillBtn.style.display = 'none';
    });

    skillForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = skillIdInput.value;
        const payload = {
            name: skillNameInput.value,
            category: skillCategoryInput.value,
            icon: skillIconInput.value,
        };

        const btn = document.getElementById('save-skill-btn');
        setLoading(btn, true, '');
        const { error } = id
            ? await supabase.from('skills').update(payload).eq('id', id)
            : await supabase.from('skills').insert([payload]);
        setLoading(btn, false, id ? 'Atualizar <i class="ph ph-check"></i>' : 'Adicionar Habilidade <i class="ph ph-plus"></i>');

        if (error) showToast('Erro ao salvar habilidade', true);
        else {
            showToast(id ? 'Habilidade atualizada' : 'Habilidade adicionada');
            cancelSkillBtn.click();
            loadSkills();
        }
    });

    // =========== FILE PREVIEW & UPLOAD TRIGGERS ===========
    const resumeFileInput = document.getElementById('resume-file');
    const uploadResumeBtn = document.getElementById('upload-resume-btn');
    const uploadProjectImageBtn = document.getElementById('upload-project-image-btn');

    uploadResumeBtn.addEventListener('click', () => resumeFileInput.click());
    uploadProjectImageBtn.addEventListener('click', () => projectImageFileInput.click());

    resumeFileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `curriculo_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            setLoading(uploadResumeBtn, true, '<i class="ph ph-upload-simple"></i> Upload');

            try {
                // Upload to 'resumes' or 'project-images' as a fallback if 'resumes' doesn't exist
                // The prompt implies adding a resume, let's try 'resumes' first
                const { error: uploadError } = await supabase.storage
                    .from('project-images') // Reusing project-images for simplicity unless instructed otherwise
                    .upload(`resumes/${filePath}`, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('project-images')
                    .getPublicUrl(`resumes/${filePath}`);

                resumeInput.value = publicUrl;
                showToast('Currículo carregado com sucesso!');
            } catch (error) {
                console.error("Erro no upload do currículo:", error);
                showToast('Erro ao fazer upload do currículo', true);
            } finally {
                setLoading(uploadResumeBtn, false, '<i class="ph ph-upload-simple"></i> Upload');
            }
        }
    });

    projectImageFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                projectImagePreview.style.display = 'block';
                projectImagePreviewImg.src = e.target.result;
                uploadProjectImageBtn.innerHTML = '<i class="ph ph-image"></i> Alterar Imagem';
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // =========== LOGOUT ===========
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.replace('login');
    });

    // Inicialização
    loadSettings();
    loadProjects();
    loadSkills();
});
