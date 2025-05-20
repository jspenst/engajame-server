'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSite } from '@/context/site-context'
import { handleFileUpload } from '@/utils/supabase/uploadFIle'
import {
  MdEdit,
  MdOutlineDeleteForever,
  MdSearch,
  MdStar,
} from 'react-icons/md'
import TextareaAutosize from 'react-textarea-autosize'

interface Testimonial {
  id: number
  username: string
  stars: number
  description?: string
  image_url?: string
}

export default function Testimonials() {
  const { siteData } = useSite()
  const [title, setTitle] = useState('')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [folderUrl, setFolderUrl] = useState('')
  useEffect(() => {
    if (siteData) {
      setTitle(siteData.testimonials_sections.title || '')
      setTestimonials(siteData.testimonials_sections.testimonials)
      setFolderUrl(siteData.url)
    }
    console.log(siteData)
  }, [siteData])

  const supabase = createClient()

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    testimonial: Testimonial
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
      .eq('id', testimonial.id)

    if (error) {
      setMessage('Erro ao atualizar imagem: ' + error.message)
    } else {
      // Atualiza o estado local
      setTestimonials((prev) =>
        prev.map((s) =>
          s.id === testimonial.id ? { ...s, image_url: url } : s
        )
      )
      setMessage('Imagem atualizada com sucesso!')
    }
  }

  async function handleAddItem() {
    if (!siteData?.testimonials_sections?.id) {
      setMessage('Erro: ID da sessão de depoimentos não encontrado.')
      return
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([
        {
          username: 'Nome de usuário',
          stars: 1,
          description: 'Descrição',
          image_url: '',
          testimonial_section: siteData.testimonials_sections.id,
        },
      ])
      .select()
      .single()

    if (error) {
      setMessage('Erro ao adicionar item: ' + error.message)
      return
    }

    setTestimonials((prev) => [...prev, data])
    setMessage('Item adicionado!')
  }

  async function handleDeleteItem(itemId: number) {
    const confirmDelete = window.confirm(
      'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.'
    )
    if (!confirmDelete) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', itemId)

    if (error) {
      setMessage('Erro ao excluir item: ' + error.message)
      setLoading(false)
      return
    }

    setTestimonials((prev) => prev.filter((item) => item.id !== itemId))
    setMessage('Item excluído com sucesso!')
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error: titleError } = await supabase
      .from('testimonials_sections')
      .update({ title })
      .eq('id', siteData.testimonials_sections.id)

    if (titleError) {
      setMessage('Erro ao atualizar título: ' + titleError.message)
      setLoading(false)
      return
    }

    for (const testimonial of testimonials) {
      const { error } = await supabase
        .from('testimonials')
        .update({
          username: testimonial.username,
          stars: testimonial.stars,
          description: testimonial.description,
          image_url: testimonial.image_url,
        })
        .eq('id', testimonial.id)

      if (error) {
        setMessage(
          `Erro ao atualizar Depoimento ${testimonial.id}: ` + error.message
        )
        setLoading(false)
        return
      }
    }

    setMessage('Atualizado com sucesso!')
    setLoading(false)
  }

  return (
    <div className="left-64 p-4 flex flex-col items-center justify-left w-full h-full gap-4">
      <h3 className="text-xl font-bold">Editar Sessão Depoimentos</h3>
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
        <div className="font-medium">Depoimentos</div>
        <div className="flex gap-2 items-center justify-left h-full">
          {testimonials?.map((item, index) => (
            <div
              key={item.id}
              className="min-h-full flex flex-col items-center justify-between overflow-hidden border p-2 gap-2"
            >
              <input
                type="text"
                value={item.username ? item.username : ''}
                className="p-2 border rounded w-full text-center text-sm"
                onChange={(e) => {
                  const updated = [...testimonials]
                  updated[index] = { ...item, username: e.target.value }
                  setTestimonials(updated)
                }}
              />

              <div className="flex flex-col items-center justify-center">
                <label className="group relative cursor-pointer rounded-full text-center inline-block h-24 w-24 overflow-hidden">
                  {item.image_url ? (
                    <>
                      <img
                        src={item.image_url}
                        alt="Imagem atual"
                        className="object-contain rounded-full bg-white"
                      />
                      {/* Overlay */}
                      <div className="absolute h-24 w-24 rounded-full inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
              <div className="flex items-center justify-center gap-2">
                <label htmlFor="stars">
                  <MdStar className="text-yellow-500" />
                </label>
                <input
                  type="range"
                  name="stars"
                  min="1"
                  max="5"
                  step="1"
                  value={item.stars ? item.stars.toString() : '5'}
                  onChange={(e) => {
                    const updated = [...testimonials]
                    updated[index] = {
                      ...item,
                      stars: parseInt(e.target.value),
                    }
                    setTestimonials(updated)
                  }}
                  className="max-w-24"
                />
                <span className="text-sm">{testimonials[index].stars}</span>
              </div>
              <div className="grow">
                <TextareaAutosize
                  value={item.description}
                  className="w-full text-center text-sm resize-none border"
                  minRows={1}
                  onChange={(e) => {
                    const updated = [...testimonials]
                    updated[index] = {
                      ...item,
                      description: e.target.value,
                    }
                    setTestimonials(updated)
                  }}
                />
              </div>
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
