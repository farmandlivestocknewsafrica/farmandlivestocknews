import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase
  .from("ad_placements")
  .select("id, slot_slug, ad_campaigns(id, title, is_active)");

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}

console.log("Total placements:", data?.length);
if (data) {
  const positions: Record<string, number> = {};
  data.forEach(p => {
    positions[p.slot_slug] = (positions[p.slot_slug] || 0) + 1;
  });
  
  console.log("\nSlots in database:");
  Object.entries(positions).forEach(([pos, count]) => {
    console.log(`  "${pos}": ${count} placements`);
  });

  console.log("\nAll ads via placements:");
  data.forEach(p => {
    const campaign = p.ad_campaigns as any;
    console.log(`  - ${p.slot_slug}: "${campaign.title}" (campaign_active=${campaign.is_active})`);
  });
}
