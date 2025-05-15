"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSite } from "@/context/site-context";
import { handleFileUpload } from "@/utils/supabase/uploadFIle";
import { MdAdd } from "react-icons/md";

interface Testimonial {
  id: number;
  username: string;
  stars: number;
  description?: string;
  image_url?: string;
}

export default function Testimonials() {
  const { siteData } = useSite();
  const [title, setTitle] = useState("");
  const [testimonilas, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [folderUrl, setFolderUrl] = useState("");
  useEffect(() => {
    if (siteData) {
      setTitle(siteData.testimonials_sections.title || "");
      setTestimonials(siteData.testimonials_sections.testimonials);
      setFolderUrl(siteData.url);
    }
    console.log(siteData);
  }, [siteData]);

  const supabase = createClient();

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    testimonial: Testimonial
  ) {
    if (!folderUrl) {
      setMessage("Erro: Caminho da pasta não definido. Verifique o site_url.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("folderUrl na hora do upload:", folderUrl);

    const url = await handleFileUpload(
      file,
      `${folderUrl}/${Date.now()}-${file.name}`
    );
    if (!url) return;

    const { error } = await supabase
      .from("team_members")
      .update({ image_url: url })
      .eq("id", testimonial.id);

    if (error) {
      setMessage("Erro ao atualizar imagem: " + error.message);
    } else {
      // Atualiza o estado local
      setTestimonials((prev) =>
        prev.map((s) =>
          s.id === testimonial.id ? { ...s, image_url: url } : s
        )
      );
      setMessage("Imagem atualizada com sucesso!");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error: titleError } = await supabase
      .from("testimonials_sections")
      .update({ title })
      .eq("id", siteData.testimonials_sections.id);

    if (titleError) {
      setMessage("Erro ao atualizar título: " + titleError.message);
      setLoading(false);
      return;
    }

    for (const testimonial of testimonilas) {
      const { error } = await supabase
        .from("testimonials")
        .update({
          username: testimonial.username,
          stars: testimonial.stars,
          description: testimonial.description,
          image_url: testimonial.image_url,
        })
        .eq("id", testimonial.id);

      if (error) {
        setMessage(
          `Erro ao atualizar Depoimento ${testimonial.id}: ` + error.message
        );
        setLoading(false);
        return;
      }
    }

    setMessage("Atualizado com sucesso!");
    setLoading(false);
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
        <div className="flex gap-2 items-center justify-left h-full">
          {testimonilas?.map((item, index) => (
            <div
              key={item.id}
              className="w-48 min-h-full bg-gray-200 flex flex-col overflow-hidden"
            >
              {item.username && (
                <input
                  type="text"
                  value={item.username}
                  className="p-2 border rounded w-full "
                  onChange={(e) => {
                    const updated = [...testimonilas];
                    updated[index] = { ...item, username: e.target.value };
                    setTestimonials(updated);
                  }}
                />
              )}

              <div className="flex flex-col grow items-center justify-center">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt="Imagem atual"
                    className="w-64 border p-4 bg-gray-200 rounded-lg grow"
                  />
                ) : (
                  <MdAdd className="text-2xl grow" />
                )}
                <label className="mt-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center">
                  Selecionar imagem
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, item)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded disabled:bg-blue-300 w-fit "
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>

        {message && (
          <div className="text-sm text-center mt-2 text-green-700">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
