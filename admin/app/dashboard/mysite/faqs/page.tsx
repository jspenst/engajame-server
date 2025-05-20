'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSite } from '@/context/site-context'
import TextareaAutosize from 'react-textarea-autosize'
import { MdOutlineDeleteForever } from 'react-icons/md'

interface Faq {
  id: number
  question: string
  answer: string
}

export default function FAQs() {
  const { siteData } = useSite()
  const [title, setTitle] = useState('')
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (siteData) {
      setTitle(siteData.faqs_sections.title || '')
      setFaqs(siteData.faqs_sections.faqs_items)
    }
    console.log(siteData)
  }, [siteData])

  const supabase = createClient()

  async function handleAddItem() {
    if (!siteData?.faqs_sections?.id) {
      setMessage('Erro: ID da sessão de depoimentos não encontrado.')
      return
    }

    const { data, error } = await supabase
      .from('faqs_items')
      .insert([
        {
          question: 'Pergunta',
          answer: 'Resposta',
          faq_section: siteData.faqs_sections.id,
        },
      ])
      .select()
      .single()

    if (error) {
      setMessage('Erro ao adicionar item: ' + error.message)
      return
    }

    setFaqs((prev) => [...prev, data])
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
      .from('faqs_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      setMessage('Erro ao excluir item: ' + error.message)
      setLoading(false)
      return
    }

    setFaqs((prev) => prev.filter((item) => item.id !== itemId))
    setMessage('Item excluído com sucesso!')
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error: titleError } = await supabase
      .from('faqs_sections')
      .update({ title })
      .eq('id', siteData.faqs_sections.id)

    if (titleError) {
      setMessage('Erro ao atualizar título: ' + titleError.message)
      setLoading(false)
      return
    }

    for (const faq of faqs) {
      const { error } = await supabase
        .from('faqs_items')
        .update({
          question: faq.question,
          answer: faq.answer,
        })
        .eq('id', faq.id)

      if (error) {
        setMessage(`Erro ao atualizar FAQ ${faq.id}: ` + error.message)
        setLoading(false)
        return
      }
    }

    setMessage('Atualizado com sucesso!')
    setLoading(false)
  }

  return (
    <div className="left-64 p-4 flex flex-col items-center justify-left w-full h-full gap-4">
      <h3 className="text-xl font-bold">Editar Sessão FAQs</h3>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 w-full h-full"
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
        <h4 className="font-medium">FAQs</h4>
        <div className="flex flex-col gap-4 items-center justify-left p-2 bg-gray-200">
          {faqs?.map((item, index) => (
            <div
              key={item.id}
              className="w-full bg-gray-200 flex flex-col overflow-hidden"
            >
              {item.question && (
                <div className="flex items-center justify-center gap-2">
                  <span>P:</span>
                  <TextareaAutosize
                    value={item.question}
                    className="p-2 border rounded w-full text-wrap"
                    onChange={(e) => {
                      const updated = [...faqs]
                      updated[index] = { ...item, question: e.target.value }
                      setFaqs(updated)
                    }}
                  />
                </div>
              )}
              {item.answer && (
                <div className="flex items-center justify-center gap-2">
                  <span>R:</span>
                  <TextareaAutosize
                    value={item.answer}
                    className="p-2 border rounded w-full text-wrap"
                    onChange={(e) => {
                      const updated = [...faqs]
                      updated[index] = { ...item, answer: e.target.value }
                      setFaqs(updated)
                    }}
                  />
                </div>
              )}
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
