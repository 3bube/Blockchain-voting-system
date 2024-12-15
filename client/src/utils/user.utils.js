import newRequest from "./newRequest";

// update user
export const updateUser = async (id, name, email, password) => {
  if (!id) throw new Error("No id provided");
  try {
    const response = await newRequest.put("/user/update", {
      id,
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message ?? "Error updating user");
  }
};
