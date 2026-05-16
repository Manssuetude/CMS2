export const formClientService = {
  async submit(formData: FormData) {
    const response = await fetch("/api/forms", { method: "POST", body: formData });
    if (!response.ok) throw new Error("Form submission failed.");
    return response.json();
  },
};
