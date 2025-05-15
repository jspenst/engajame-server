"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSite } from "@/context/site-context";
import { handleFileUpload } from "@/utils/supabase/uploadFIle";
import { MdAdd } from "react-icons/md";

interface Faq {
  id: number;
  question: string;
  answer: string;
}

export default function FAQs() {
  const { siteData } = useSite();
  const [title, setTitle] = useState("");
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [folderUrl, setFolderUrl] = useState("");
  useEffect(() => {
    if (siteData) {
      setTitle(siteData.faqs_sections.title || "");
      setFaqs(siteData.faqs_sections.faqs_items);
      setFolderUrl(siteData.url);
    }
    console.log(siteData);
  }, [siteData]);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error: titleError } = await supabase
      .from("faqs_sections")
      .update({ title })
      .eq("id", siteData.faqs_sections.id);

    if (titleError) {
      setMessage("Erro ao atualizar título: " + titleError.message);
      setLoading(false);
      return;
    }

    for (const faq of faqs) {
      const { error } = await supabase
        .from("faqs_items")
        .update({
          question: faq.question,
          answer: faq.answer,
        })
        .eq("id", faq.id);

      if (error) {
        setMessage(`Erro ao atualizar FAQ ${faq.id}: ` + error.message);
        setLoading(false);
        return;
      }
    }

    setMessage("Atualizado com sucesso!");
    setLoading(false);
  }

  return (
    <div className="left-64 p-4 flex flex-col items-center justify-left w-full h-full gap-4">
      <h3 className="text-xl font-bold">Editar Sessão FAQs</h3>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full h-full"
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
        <div className="flex flex-col gap-4 items-center justify-left p-2 bg-gray-200">
          {faqs?.map((item, index) => (
            <div
              key={item.id}
              className="w-full bg-gray-200 flex flex-col overflow-hidden"
            >
              {item.question && (
                <textarea
                  value={item.question}
                  className="p-2 border rounded w-full text-wrap"
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[index] = { ...item, question: e.target.value };
                    setFaqs(updated);
                  }}
                />
              )}
              {item.answer && (
                <textarea
                  value={item.answer}
                  className="p-2 border rounded w-full text-wrap"
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[index] = { ...item, answer: e.target.value };
                    setFaqs(updated);
                  }}
                />
              )}
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
