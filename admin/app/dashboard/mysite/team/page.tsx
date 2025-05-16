"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSite } from "@/context/site-context";
import { handleFileUpload } from "@/utils/supabase/uploadFIle";
import { MdAdd, MdEdit, MdSearch } from "react-icons/md";

interface TeamMember {
  id: number;
  name: string;
  profession?: string;
  description?: string;
  image_url?: string;
}

export default function Team() {
  const { siteData } = useSite();
  const [title, setTitle] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [folderUrl, setFolderUrl] = useState("");
  useEffect(() => {
    if (siteData) {
      setTitle(siteData.teams.title || "");
      setTeamMembers(siteData.teams.team_members);
      setFolderUrl(siteData.url);
    }
    console.log(siteData);
  }, [siteData]);

  const supabase = createClient();

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    member: TeamMember
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
      .eq("id", member.id);

    if (error) {
      setMessage("Erro ao atualizar imagem: " + error.message);
    } else {
      // Atualiza o estado local
      setTeamMembers((prev) =>
        prev.map((s) => (s.id === member.id ? { ...s, image_url: url } : s))
      );
      setMessage("Imagem atualizada com sucesso!");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error: titleError } = await supabase
      .from("teams")
      .update({ title })
      .eq("id", siteData.teams.id);

    if (titleError) {
      setMessage("Erro ao atualizar título: " + titleError.message);
      setLoading(false);
      return;
    }

    for (const member of teamMembers) {
      const { error } = await supabase
        .from("team_members")
        .update({
          name: member.name,
          profession: member.profession,
          description: member.description,
          image_url: member.image_url,
        })
        .eq("id", member.id);

      if (error) {
        setMessage(`Erro ao atualizar Membro ${member.id}: ` + error.message);
        setLoading(false);
        return;
      }
    }

    setMessage("Atualizado com sucesso!");
    setLoading(false);
  }

  return (
    <div className="left-64 p-4 flex flex-col items-center justify-left w-full h-full gap-4">
      <h3 className="text-xl font-bold">Editar Sessão Equipe</h3>
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
        <div className="font-medium">Profissionais</div>
        <div className="flex gap-2 items-center justify-left h-full flex-wrap">
          {teamMembers?.map((item, index) => (
            <div
              key={item.id}
              className="w-48 flex flex-col overflow-hidden border p-1 shadow-lg"
            >
              <input
                type="text"
                value={item.name ? item.name : ""}
                placeholder="Nome"
                className="p-2 border rounded w-full"
                onChange={(e) => {
                  const updated = [...teamMembers];
                  updated[index] = { ...item, name: e.target.value };
                  setTeamMembers(updated);
                }}
              />

              <input
                type="text"
                value={item.profession ? item.profession : ""}
                placeholder="Profissão"
                className="p-2 border rounded w-full text-sm"
                onChange={(e) => {
                  const updated = [...teamMembers];
                  updated[index] = { ...item, profession: e.target.value };
                  setTeamMembers(updated);
                }}
              />
              <div className="flex flex-col items-center justify-center">
                <label className="group relative cursor-pointer rounded-lg text-center inline-block w-64 h-64 overflow-hidden">
                  {item.image_url ? (
                    <>
                      <img
                        src={item.image_url}
                        alt="Imagem atual"
                        className="w-64 h-64 object-contain rounded-lg bg-white"
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
                    onChange={(e) => handleImageChange(e, item)}
                  />
                </label>
              </div>
              {/*<div className="flex flex-col grow items-center justify-center">
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
              </div> */}
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
