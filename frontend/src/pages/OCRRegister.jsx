import { useEffect, useState } from "react";

import { createGuest, extractOCR } from "../api/api.js";

const emptyGuestForm = {
  full_name: "",
  document_number: "",
  document_type: "CI",
  phone: "",
  email: "",
  nationality: "",
  address: "",
  birth_date: "",
  notes: "",
};

function buildGuestPayload(form) {
  return {
    full_name: form.full_name,
    document_number: form.document_number,
    document_type: form.document_type,
    phone: form.phone || null,
    email: form.email || null,
    nationality: form.nationality || null,
    address: form.address || null,
    birth_date: form.birth_date ? `${form.birth_date}T00:00:00` : null,
    notes: form.notes || null,
    is_active: true,
  };
}

function OCRRegister({ user }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [ocrResult, setOcrResult] = useState(null);
  const [guestForm, setGuestForm] = useState(emptyGuestForm);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleName = user?.role?.name;
  const canWrite = roleName === "Administrador" || roleName === "Recepcionista";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setOcrResult(null);
    setMessage("");
    setError("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : "");
  }

  function handleGuestFieldChange(event) {
    const { name, value } = event.target;
    setGuestForm((current) => ({ ...current, [name]: value }));
  }

  async function handleExtract() {
    if (!file) {
      setError("Selecciona una imagen antes de extraer datos.");
      return;
    }

    setExtracting(true);
    setMessage("");
    setError("");

    try {
      const data = await extractOCR(file);
      setOcrResult(data);
      setGuestForm((current) => ({
        ...current,
        full_name: data.detected_full_name || current.full_name,
        document_number: data.detected_document_number || current.document_number,
        notes: current.notes || `Registro asistido por OCR: ${data.filename}`,
      }));
      setMessage("Texto extraido correctamente. Revisa y completa los datos antes de guardar.");
    } catch (err) {
      setError(err.message);
    } finally {
      setExtracting(false);
    }
  }

  async function handleSaveGuest(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await createGuest(buildGuestPayload(guestForm));
      setGuestForm(emptyGuestForm);
      setOcrResult(null);
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setMessage("Huesped guardado correctamente desde registro OCR.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="h4 mb-1">Registro OCR</h2>
          <p className="text-secondary mb-0">
            Extrae texto desde una imagen de documento y completa manualmente el
            registro del huesped.
          </p>
        </div>
        <span className="badge text-bg-primary align-self-start">
          OCR asistido
        </span>
      </div>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      {!canWrite ? (
        <div className="alert alert-warning">
          Tu rol solo permite consultar informacion. El registro OCR requiere rol
          Administrador o Recepcionista.
        </div>
      ) : null}

      <div className="row g-4">
        <div className="col-xl-5">
          <div className="bg-white border rounded-2 p-4">
            <h3 className="h5 mb-3">Imagen del documento</h3>

            <div className="mb-3">
              <label className="form-label" htmlFor="ocr_file">
                Archivo de imagen
              </label>
              <input
                accept="image/*"
                className="form-control"
                disabled={!canWrite}
                id="ocr_file"
                onChange={handleFileChange}
                type="file"
              />
            </div>

            {previewUrl ? (
              <div className="border rounded-2 p-2 mb-3 bg-light">
                <img
                  alt="Vista previa del documento"
                  className="img-fluid rounded-2"
                  src={previewUrl}
                />
              </div>
            ) : (
              <div className="border rounded-2 p-4 text-center text-secondary mb-3">
                Sin imagen seleccionada.
              </div>
            )}

            <button
              className="btn btn-primary"
              disabled={!canWrite || !file || extracting}
              onClick={handleExtract}
              type="button"
            >
              {extracting ? "Extrayendo..." : "Extraer datos"}
            </button>
          </div>

          {ocrResult ? (
            <div className="bg-white border rounded-2 p-4 mt-4">
              <h3 className="h5 mb-3">Texto extraido</h3>
              <div className="mb-3">
                <p className="mb-1">
                  <strong>Archivo:</strong> {ocrResult.filename}
                </p>
                <p className="mb-1">
                  <strong>Nombre detectado:</strong>{" "}
                  {ocrResult.detected_full_name || "No detectado"}
                </p>
                <p className="mb-0">
                  <strong>Documento detectado:</strong>{" "}
                  {ocrResult.detected_document_number || "No detectado"}
                </p>
              </div>
              <pre className="bg-light border rounded-2 p-3 small text-wrap mb-0">
                {ocrResult.extracted_text || "Sin texto extraido."}
              </pre>
            </div>
          ) : null}
        </div>

        <div className="col-xl-7">
          <form className="bg-white border rounded-2 p-4" onSubmit={handleSaveGuest}>
            <h3 className="h5 mb-3">Datos validados del huesped</h3>

            <div className="mb-3">
              <label className="form-label" htmlFor="full_name">
                Nombre completo
              </label>
              <input
                className="form-control"
                disabled={!canWrite}
                id="full_name"
                name="full_name"
                onChange={handleGuestFieldChange}
                required
                type="text"
                value={guestForm.full_name}
              />
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label" htmlFor="document_type">
                  Tipo documento
                </label>
                <select
                  className="form-select"
                  disabled={!canWrite}
                  id="document_type"
                  name="document_type"
                  onChange={handleGuestFieldChange}
                  value={guestForm.document_type}
                >
                  <option value="CI">CI</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="DNI">DNI</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="col-md-8 mb-3">
                <label className="form-label" htmlFor="document_number">
                  Numero documento
                </label>
                <input
                  className="form-control"
                  disabled={!canWrite}
                  id="document_number"
                  name="document_number"
                  onChange={handleGuestFieldChange}
                  required
                  type="text"
                  value={guestForm.document_number}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="phone">
                  Telefono
                </label>
                <input
                  className="form-control"
                  disabled={!canWrite}
                  id="phone"
                  name="phone"
                  onChange={handleGuestFieldChange}
                  type="text"
                  value={guestForm.phone}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="birth_date">
                  Fecha nacimiento
                </label>
                <input
                  className="form-control"
                  disabled={!canWrite}
                  id="birth_date"
                  name="birth_date"
                  onChange={handleGuestFieldChange}
                  type="date"
                  value={guestForm.birth_date}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-control"
                  disabled={!canWrite}
                  id="email"
                  name="email"
                  onChange={handleGuestFieldChange}
                  type="email"
                  value={guestForm.email}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="nationality">
                  Nacionalidad
                </label>
                <input
                  className="form-control"
                  disabled={!canWrite}
                  id="nationality"
                  name="nationality"
                  onChange={handleGuestFieldChange}
                  type="text"
                  value={guestForm.nationality}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="address">
                Direccion
              </label>
              <input
                className="form-control"
                disabled={!canWrite}
                id="address"
                name="address"
                onChange={handleGuestFieldChange}
                type="text"
                value={guestForm.address}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="notes">
                Notas
              </label>
              <textarea
                className="form-control"
                disabled={!canWrite}
                id="notes"
                name="notes"
                onChange={handleGuestFieldChange}
                rows="3"
                value={guestForm.notes}
              />
            </div>

            <button className="btn btn-primary" disabled={!canWrite || saving} type="submit">
              {saving ? "Guardando..." : "Guardar huesped"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default OCRRegister;
