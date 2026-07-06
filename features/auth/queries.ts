import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAuthPageState() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      return { registrationOpen: false };
    }

    return {
      registrationOpen: (data.users?.length ?? 0) === 0,
    };
  } catch {
    return { registrationOpen: false };
  }
}
