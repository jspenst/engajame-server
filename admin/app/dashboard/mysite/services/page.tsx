'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSite } from '@/context/site-context'
import { handleFileUpload } from '@/utils/supabase/uploadFIle'

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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, service: ServiceItem) {
    if (!folderUrl) {
      setMessage('Erro: Caminho da pasta não definido. Verifique o site_url.')
      return
    }
    const file = e.target.files?.[0]
    if (!file) return

    console.log('folderUrl na hora do upload:', folderUrl)

    const url = await handleFileUpload(file, `${folderUrl}/${Date.now()}-${file.name}`)
    if (!url) return

    const { error } = await supabase
      .from('services_items')
      .update({ image_url: url })
      .eq('id', service.id)

    if (error) {
      setMessage('Erro ao atualizar imagem: ' + error.message)
    } else {
      // Atualiza o estado local
      setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, image_url: url } : s)))
      setMessage('Imagem atualizada com sucesso!')
    }
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
    <div className="left-64 p-4 flex flex-col items-center justify-center w-full gap-4">
      <h3 className="text-xl font-bold">Editar Sessão Serviços</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full items-left">
        <div className="flex flex-col">
          <label className="font-medium">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded "
          />
        </div>
        {services?.map((service, index) => (
          <div key={service.id} className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 items-center w-full">
              <label>Serviço</label>
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
            <div className="flex gap-2 items-center">
              <label>Descrição</label>
              <input
                type="text"
                value={service.description}
                className="p-2 border rounded w-full"
                onChange={(e) => {
                  const updated = [...services]
                  updated[index] = { ...service, description: e.target.value }
                  setServices(updated)
                }}
              />
            </div>
            {service.image_url && (
              <div>
                <img
                  src={service.image_url}
                  alt="Imagem atual"
                  className="w-64 border p-4 bg-gray-200 rounded-lg"
                />
                <input type="file" onChange={(e) => handleImageChange(e, service)} />
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded disabled:bg-blue-300 w-fit "
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>

        {message && <div className="text-sm text-center mt-2 text-green-700">{message}</div>}
      </form>
    </div>
  )
}
