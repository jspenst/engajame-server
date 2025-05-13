import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

export async function handleFileUpload(file: File, filePath: string) {
  const { error } = await supabase.storage.from(`sites`).upload(filePath, file)

  if (error) {
    console.error('Erro no upload:', error.message)
    return null
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('sites').getPublicUrl(filePath)

  return publicUrl
}
