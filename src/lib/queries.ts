import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PublicKit } from "./types";

export const publicKitsQuery = () =>
  queryOptions({
    queryKey: ["public-kits"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_public_kits");
      if (error) throw error;
      return (data as unknown as PublicKit[]) ?? [];
    },
  });

export const publicKitQuery = (id: string) =>
  queryOptions({
    queryKey: ["public-kit", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_kit", { _id: id });
      if (error) throw error;
      return (data as unknown as PublicKit | null) ?? null;
    },
  });
