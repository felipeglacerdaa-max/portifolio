-- Script SQL para criar o Bucket de Imagens e Configurar Permissões (RLS)

-- 1. Cria o Bucket público chamado 'project-images' (se já não existir)
insert into storage.buckets (id, name, public) 
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- 2. Permite que QUALQUER pessoa veja as imagens (Necessário para carregar na página principal)
create policy "Imagens Publicas - Visualizacao"
on storage.objects for select
using ( bucket_id = 'project-images' );

-- 3. Permite que usuarios façam upload das imagens
create policy "Upload de Imagens"
on storage.objects for insert
with check ( bucket_id = 'project-images' );

-- 4. Permite que usuarios atualizem imagens existentes
create policy "Atualizacao de Imagens"
on storage.objects for update
using ( bucket_id = 'project-images' );

-- 5. Permite que usuarios excluam imagens
create policy "Exclusao de Imagens"
on storage.objects for delete
using ( bucket_id = 'project-images' );
