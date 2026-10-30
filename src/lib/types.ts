export type PublicKit = {
  id: string;
  nome: string;
  descricao: string;
  imagem: string | null;
  preco: number;
  preco_referencia: number | null;
  disponivel: number;
  estoque_total: number;
  data_retirada: string;
  retirada_inicio: string;
  retirada_fim: string;
  ingredientes?: string;
  alergenicos?: string;
  conservacao?: string;
  items?: { nome: string; quantidade: number; unidade: string }[];
  establishment: {
    id: string;
    nome: string;
    tipo: string;
    bairro: string;
    endereco?: string;
    cidade?: string;
    horario_funcionamento?: string;
    is_demo: boolean;
  };
};

export const KIT_IMAGES = [
  { url: "/images/kit-cafe-da-tarde.jpg", label: "Pães e croissants" },
  { url: "/images/kit-bolos-do-dia.jpg", label: "Bolos" },
  { url: "/images/kit-paes-artesanais.jpg", label: "Pães artesanais" },
];
