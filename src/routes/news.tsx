import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/PageTransition";
import { format } from "date-fns";

export const Route = createFileRoute("/news")({ component: () => <Outlet /> });
