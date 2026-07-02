// Form for adding a new website to monitor.
import { useState } from "react";

function AddSiteForm({ onAddSite }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !url) return;

    await onAddSite({ name, url });

    setName("");
    setUrl("");
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Website name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button type="submit">Add Site</button>
    </form>
  );
}

export default AddSiteForm;