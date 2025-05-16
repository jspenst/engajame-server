'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { handleFileUpload } from './uploadFIle'

export async function handleImageChange(
  e: React.ChangeEvent<HTMLInputElement>,
  folderUrl: string,
  table: string,
  id: number
) {
  const [message, setMessage] = useState('')
  const supabase = createClient()

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
    .from(table)
    .update({ image_url: url })
    .eq('id', id)

  if (error) {
    setMessage('Erro ao atualizar imagem: ' + error.message)
  } else {
    setMessage('Imagem atualizada com sucesso!')
    return { url, message }
  }
}
