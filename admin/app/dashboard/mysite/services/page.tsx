'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSite } from '@/context/site-context'
import { handleFileUpload } from '@/utils/supabase/uploadFIle'
import { MdEdit, MdOutlineDeleteForever, MdSearch } from 'react-icons/md'
import TextareaAutosize from 'react-textarea-autosize'

interface ServiceItem {
  id: number
  title: string
  description?: string
  image_url?: string
}

export default function Services() {
  const { siteData } = useSite()
  const [title, setTitle] = useState('')
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [folderUrl, setFolderUrl] = useState('')
  useEffect(() => {
    if (siteData) {
      setTitle(siteData.services_sections.title || '')
      setServices(siteData.services_sections.services_items)
      setFolderUrl(siteData.url)
      console.log(siteData)
    }
  }, [siteData])

  const supabase = createClient()

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    service: ServiceItem
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
      .from('services_items')
      .update({ image_url: url })
      .eq('id', service.id)

    if (error) {
      setMessage('Erro ao atualizar imagem: ' + error.message)
    } else {
      // Atualiza o estado local
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, image_url: url } : s))
      )
      setMessage('Imagem atualizada com sucesso!')
    }
  }

  async function handleAddService() {
    if (!siteData?.services_sections?.id) {
      setMessage('Erro: ID da sessão de serviços não encontrado.')
      return
    }

    const { data, error } = await supabase
      .from('services_items')
      .insert([
        {
          title: 'Novo Serviço',
          description: '',
          image_url: '',
          service_section: siteData.services_sections.id,
        },
      ])
      .select()
      .single()

    if (error) {
      setMessage('Erro ao adicionar serviço: ' + error.message)
      return
    }

    setServices((prev) => [...prev, data])
    setMessage('Serviço adicionado!')
  }

  async function handleDeleteService(serviceId: number) {
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.'
    )
    if (!confirmDelete) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('services_items')
      .delete()
      .eq('id', serviceId)

    if (error) {
      setMessage('Erro ao excluir serviço: ' + error.message)
      setLoading(false)
      return
    }

    setServices((prev) => prev.filter((service) => service.id !== serviceId))
    setMessage('Serviço excluído com sucesso!')
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error: titleError } = await supabase
      .from('services_sections')
      .update({ title })
      .eq('id', siteData.services_sections.id)

    if (titleError) {
      setMessage('Erro ao atualizar título: ' + titleError.message)
      setLoading(false)
      return
    }

    for (const service of services) {
      const { error } = await supabase
        .from('services_items')
        .update({
          title: service.title,
          description: service.description,
          image_url: service.image_url,
        })
        .eq('id', service.id)

      if (error) {
        setMessage(`Erro ao atualizar serviço ${service.id}: ` + error.message)
        setLoading(false)
        return
      }
    }

    setMessage('Atualizado com sucesso!')
    setLoading(false)
  }

  return (
    <div className="left-64 p-4 flex flex-col items-center justify-center w-full">
      <h3 className="text-xl font-bold">Editar Sessão Serviços</h3>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full items-left"
      >
        <div className="flex flex-col">
          <label className="font-medium">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded "
          />
        </div>

        <div className="font-medium">Serviços</div>
        <div className="flex gap-2 flex-wrap">
          {services?.map((service, index) => (
            <div
              key={service.id}
              className="flex gap-2 h-full w-full p-4 my-4 border rounded shadow"
            >
              <div className="flex flex-col items-center justify-center p-2">
                <label className="group relative cursor-pointer rounded-lg text-center inline-block w-48 h-48 overflow-hidden">
                  {service.image_url ? (
                    <>
                      <img
                        src={service.image_url}
                        alt="Imagem atual"
                        className="w-48 h-48 object-contain rounded-lg bg-white"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                    onChange={(e) => handleImageChange(e, service)}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2 h-full w-full">
                <div className="flex gap-2 items-center place-content-between w-full">
                  <label className="w-20">Serviço</label>
                  <input
                    type="text"
                    value={service.title}
                    className="p-2 border rounded w-full "
                    onChange={(e) => {
                      const updated = [...services]
                      updated[index] = { ...service, title: e.target.value }
                      setServices(updated)
                    }}
                  />
                </div>
                <div className="flex gap-2 grow items-center w-full">
                  <label className="w-20">Descrição</label>
                  <TextareaAutosize
                    value={service.description}
                    className="p-2 border rounded w-64 w-full"
                    onChange={(e) => {
                      const updated = [...services]
                      updated[index] = {
                        ...service,
                        description: e.target.value,
                      }
                      setServices(updated)
                    }}
                  />
                </div>
                <div className="flex justify-end w-full">
                  <button
                    type="button"
                    onClick={() => handleDeleteService(service.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded w-fit flex gap-2 items-center"
                  >
                    Excluir
                    <MdOutlineDeleteForever className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAddService}
            className="bg-green-600 text-white py-2 px-4 rounded w-fit"
          >
            Adicionar novo serviço
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
