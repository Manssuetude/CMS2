export const formClientService = {
  async submit(formData: FormData) {
    const response = await fetch("/api/forms", { method: "POST", body: formData });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error ?? "Une erreur est survenue. Merci de réessayer.");
    }
    return response.json();
  },
};
