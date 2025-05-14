'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSite } from '@/context/site-context'
import { handleFileUpload } from '@/utils/supabase/uploadFIle'

interface PortfolioItem {
  id: number
  title: string
  subtitle?: string
  description?: string
  image_url?: string
}

export default function Portfolio() {
  const { siteData } = useSite()
  const [title, setTitle] = useState('')
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [folderUrl, setFolderUrl] = useState('')
  useEffect(() => {
    if (siteData) {
      setTitle(siteData.portfolio_sections.title || '')
      setPortfolioItems(siteData.portfolio_sections.portfolio_items)
      setFolderUrl(siteData.url)
      console.log(siteData)
    }
  }, [siteData])

  const supabase = createClient()

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, service: PortfolioItem) {
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
      setPortfolioItems((prev) => prev.map((s) => (s.id === service.id ? { ...s, image_url: url } : s)))
      setMessage('Imagem atualizada com sucesso!')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error: titleError } = await supabase
      .from('portfolio_sections')
      .update({ title })
      .eq('id', siteData.portfolio_sections.id)

    if (titleError) {
      setMessage('Erro ao atualizar título: ' + titleError.message)
      setLoading(false)
      return
    }

    for (const portfolioItem of portfolioItems) {
      const { error } = await supabase
        .from('portfolio_items')
        .update({
          title: portfolioItem.title,
          description: portfolioItem.description,
          image_url: portfolioItem.image_url,
        })
        .eq('id', portfolioItem.id)

      if (error) {
        setMessage(`Erro ao atualizar portfolio ${portfolioItem.id}: ` + error.message)
        setLoading(false)
        return
      }
    }

    setMessage('Atualizado com sucesso!')
    setLoading(false)
  }

  return (
    <div className="left-64 p-4 flex flex-col items-center justify-center w-full gap-4">
      <h3 className="text-xl font-bold">Editar Sessão Portfolio</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full items-left">
        <div className="flex flex-col">
          <label className="font-medium">Título da sessão</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded "
          />
        </div>
        <div className="flex gap-2 items-center justify-center">
        {portfolioItems?.map((item, index) => (
          <div key={item.id} className="w-48 min-h-max bg-gray-200 flex flex-col ">
            <input
                type="text"
                value={item.title}
                className="p-2 border rounded w-full "
                onChange={(e) => {
                  const updated = [...portfolioItems]
                  updated[index] = { ...item, title: e.target.value }
                  setPortfolioItems(updated)
                }}
              />
              <input
                type="text"
                value={item.subtitle}
                className="p-2 border rounded w-full text-sm"
                onChange={(e) => {
                  const updated = [...portfolioItems]
                  updated[index] = { ...item, title: e.target.value }
                  setPortfolioItems(updated)
                }}
              />
            <img src={item.image_url} alt="" />
            
          </div>
        ))}
        </div>
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
