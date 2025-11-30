import { createClient } from "@supabase/supabase-js";

const supabaseUrl:string = "https://dmwjkpqptyucdofedfyg.supabase.co"
const supabaseKey:string = "sb_publishable_i_EnSC-IDLW0sy-6y1V7vg_l46kJQ1-";

const db = createClient(supabaseUrl, supabaseKey);

export default db;