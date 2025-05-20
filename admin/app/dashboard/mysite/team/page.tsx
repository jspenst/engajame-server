'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSite } from '@/context/site-context'
import { handleFileUpload } from '@/utils/supabase/uploadFIle'
import { MdEdit, MdOutlineDeleteForever, MdSearch } from 'react-icons/md'
import TextareaAutosize from 'react-textarea-autosize'

interface TeamMember {
  id: number
  name: string
  profession?: string
  description?: string
  image_url?: string
}

export default function Team() {
  const { siteData } = useSite()
  const [title, setTitle] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [folderUrl, setFolderUrl] = useState('')
  useEffect(() => {
    if (siteData) {
      setTitle(siteData.teams.title || '')
      setTeamMembers(siteData.teams.team_members)
      setFolderUrl(siteData.url)
    }
    console.log(siteData)
  }, [siteData])

  const supabase = createClient()

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    member: TeamMember
  ) {
    if (!folderUrl) {
      setMessage('Erro: Caminho da pasta não definido. Verifique o site_url.')
      return
    }
    const file = e.target.files?.[0]
    if (!file) return

    console.log('folderUrl na hora do upload:', folderUrl)

    const url = await handleFileUpload(
      file,
      `${folderUrl}/${Date.now()}-${file.name}`
    )
    if (!url) return

    const { error } = await supabase
      .from('team_members')
      .update({ image_url: url })
      .eq('id', member.id)

    if (error) {
      setMessage('Erro ao atualizar imagem: ' + error.message)
    } else {
      // Atualiza o estado local
      setTeamMembers((prev) =>
        prev.map((s) => (s.id === member.id ? { ...s, image_url: url } : s))
      )
      setMessage('Imagem atualizada com sucesso!')
    }
  }

  async function handleAddItem() {
    if (!siteData?.teams?.id) {
      setMessage('Erro: ID da sessão de serviços não encontrado.')
      return
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert([
        {
          name: '',
          profession: '',
          team: siteData.teams.id,
        },
      ])
      .select()
      .single()

    if (error) {
      setMessage('Erro ao adicionar membro: ' + error.message)
      return
    }

    setTeamMembers((prev) => [...prev, data])
    setMessage('Membro adicionado!')
  }

  async function handleDeleteItem(itemId: number) {
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.'
    )
    if (!confirmDelete) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', itemId)

    if (error) {
      setMessage('Erro ao excluir item: ' + error.message)
      setLoading(false)
      return
    }

    setTeamMembers((prev) => prev.filter((item) => item.id !== itemId))
    setMessage('Membro excluído com sucesso!')
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error: titleError } = await supabase
      .from('teams')
      .update({ title })
      .eq('id', siteData.teams.id)

    if (titleError) {
      setMessage('Erro ao atualizar título: ' + titleError.message)
      setLoading(false)
      return
    }

    for (const member of teamMembers) {
      const { error } = await supabase
        .from('team_members')
        .update({
          name: member.name,
          profession: member.profession,
          description: member.description,
          image_url: member.image_url,
        })
        .eq('id', member.id)

      if (error) {
        setMessage(`Erro ao atualizar Membro ${member.id}: ` + error.message)
        setLoading(false)
        return
      }
    }

    setMessage('Atualizado com sucesso!')
    setLoading(false)
  }

  return (
    <div className="left-64 p-4 flex flex-col items-center justify-left w-full h-full gap-4">
      <h3 className="text-xl font-bold">Editar Sessão Equipe</h3>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full items-left"
      >
        <div className="flex flex-col max-w-fit">
          <label className="font-medium">Título da sessão</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded "
          />
        </div>
        <div className="font-medium">Profissionais</div>
        <div className="flex gap-2 items-center justify-left h-full flex-wrap">
          {teamMembers?.map((item, index) => (
            <div
              key={item.id}
              className="w-48 flex flex-col overflow-hidden border p-1 shadow-lg h-full place-content-between"
            >
              <input
                type="text"
                value={item.name ? item.name : ''}
                placeholder="Nome"
                className="p-2 border rounded w-full"
                onChange={(e) => {
                  const updated = [...teamMembers]
                  updated[index] = { ...item, name: e.target.value }
                  setTeamMembers(updated)
                }}
              />

              <input
                type="text"
                value={item.profession ? item.profession : ''}
                placeholder="Profissão"
                className="p-2 border rounded w-full text-sm"
                onChange={(e) => {
                  const updated = [...teamMembers]
                  updated[index] = { ...item, profession: e.target.value }
                  setTeamMembers(updated)
                }}
              />
              <div className="flex flex-col items-center justify-center w-full">
                <label className="group relative cursor-pointer rounded-lg text-center inline-block overflow-hidden flex items-center justify-center w-44 h-44 my-2">
                  {!(item.image_url === null || item.image_url === '') ? (
                    <>
                      <img
                        src={item.image_url}
                        alt="Imagem atual"
                        className="object-contain rounded-lg bg-white"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ">
                        <span className="text-white text-3xl">
                          <MdEdit />
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center  transition-opacity duration-300">
                      <span className="text-white text-3xl">
                        <MdSearch />
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, item)}
                  />
                </label>
              </div>
              <TextareaAutosize
                value={item.description ? item.description : ''}
                placeholder="Descrição"
                className="p-2 border rounded w-full text-sm"
                onChange={(e) => {
                  const updated = [...teamMembers]
                  updated[index] = { ...item, description: e.target.value }
                  setTeamMembers(updated)
                }}
              />
              <div className="flex justify-end w-full">
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-600 text-white py-2 px-4 rounded w-fit flex gap-2 m-2 items-center"
                >
                  Excluir
                  <MdOutlineDeleteForever className="text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-green-600 text-white py-2 px-4 rounded w-fit"
          >
            Adicionar novo item
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded disabled:bg-blue-300 w-fit "
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>

        {message && (
          <div className="text-sm text-center mt-2 text-green-700">
            {message}
          </div>
        )}
      </form>
    </div>
  )
}
