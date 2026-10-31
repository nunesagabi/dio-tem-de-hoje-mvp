import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const myEstablishmentQuery = () =>
  queryOptions({
    queryKey: ["my-establishment"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase.from("establishments").select("*").eq("owner_id", u.user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const myKitsQuery = (estId: string | undefined) =>
  queryOptions({
    queryKey: ["my-kits", estId],
    enabled: !!estId,
    queryFn: async () => {
      const { data, error } = await supabase.from("kits").select("*, kit_items(*)").eq("establishment_id", estId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const myReservationsQuery = (estId: string | undefined) =>
  queryOptions({
    queryKey: ["my-reservations", estId],
    enabled: !!estId,
    queryFn: async () => {
      const { data, error } = await supabase.from("reservations").select("id, codigo_confirmacao, nome_consumidor, telefone_consumidor, quantidade, preco_unitario, status, data_retirada, created_at, completed_at, kits(nome)").eq("establishment_id", estId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
