import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_AGENCY_SLUG } from "@/lib/constants";
import type { Agency, Car } from "@/lib/database.types";

export const getAgencyBySlug = cache(async (slug: string = DEFAULT_AGENCY_SLUG): Promise<Agency | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("agencies").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    console.error("[getAgencyBySlug]", error);
    return null;
  }
  return data;
});

export const getAgencyOrNotFound = cache(async (slug: string = DEFAULT_AGENCY_SLUG): Promise<Agency> => {
  const agency = await getAgencyBySlug(slug);
  if (!agency) notFound();
  return agency;
});

export const getAgencyCars = cache(async (agencyId: string): Promise<Car[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("agency_id", agencyId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[getAgencyCars]", error);
    return [];
  }
  return data ?? [];
});

export const getCarById = cache(async (agencyId: string, carId: string): Promise<Car | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("agency_id", agencyId)
    .eq("id", carId)
    .maybeSingle();
  if (error) {
    console.error("[getCarById]", error);
    return null;
  }
  return data;
});
