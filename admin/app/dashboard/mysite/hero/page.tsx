'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSite } from '@/context/site-context'

export default function Hero() {
  const { siteData } = useSite()
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('')
  useEffect(() => {
    if (siteData) {
      setTitle(siteData.hero_sections.title || '')
      setSubtitle(siteData.hero_sections.subtitle || '')
      setBackgroundImageUrl(siteData.hero_sections.background_image_url || '')
    }
  }, [siteData])

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    let uploadedImageUrl = backgroundImageUrl

    if (imageFile) {
      const filePath = `${siteData.url}/${Date.now()}-${imageFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('sites')
        .upload(filePath, imageFile)

      if (uploadError) {
        setMessage('Erro no upload da imagem: ' + uploadError.message)
        setLoading(false)
        return
      }
      const { data: publicUrlData } = supabase.storage.from('sites').getPublicUrl(filePath)

      uploadedImageUrl = publicUrlData.publicUrl
    }

    const { error } = await supabase
      .from('hero_sections')
      .update({
        title,
        subtitle,
        background_image_url: uploadedImageUrl,
      })
      .eq('id', siteData.hero_sections.id)

    if (error) {
      setMessage('Erro ao atualizar: ' + error.message)
    } else {
      setMessage('Atualizado com sucesso!')
    }

    setLoading(false)
  }

  return (
    <div className="left-64 p-4 flex flex-col items-center justify-center w-full gap-4">
      <h3 className="text-xl font-bold">Editar Sessão Principal</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full items-left">
        <div className="flex flex-col">
          <label className="font-medium">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded "
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="font-medium">Subtítulo</label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="p-2 border rounded"
          />
        </div>

        <div className="flex flex-col w-full gap-2">
          <label className="font-medium">Imagem de Fundo (Upload)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="p-2 border rounded"
          />
          {backgroundImageUrl && (
            <img
              src={backgroundImageUrl}
              alt="Imagem de fundo atual"
              className="w-64 border p-4 bg-gray-200 rounded-lg"
            />
          )}
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
