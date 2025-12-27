export async function verifyRestaurant(req, res) {
  const { id } = req.params;
  const { isVerified } = req.body;

  const { data } = await supabaseAdmin
    .from("restaurants")
    .update({ isVerified })
    .eq("id", id)
    .select()
    .single();

  res.json(data);
}
