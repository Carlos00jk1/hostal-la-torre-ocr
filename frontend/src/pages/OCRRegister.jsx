import { useEffect, useRef, useState } from "react";

import { createGuest, extractOCRMultiple } from "../api/api.js";

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

function calculateAge(birthDate) {
  if (!birthDate) {
    return null;
  }

  const born = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(born.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function formatDetectedLabel(fieldName) {
  const labels = {
    full_name: "Nombre completo",
    document_number: "Número documento",
    document_type: "Tipo documento",
    birth_date: "Fecha nacimiento",
    age: "Edad",
    marital_status: "Estado civil",
    occupation: "Ocupación",
    address: "Dirección",
    nationality: "Nacionalidad",
  };

  return labels[fieldName] ?? fieldName;
}

function OCRRegister({ user }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [ocrResult, setOcrResult] = useState(null);
  const [guestForm, setGuestForm] = useState(emptyGuestForm);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectedImagesRef = useRef([]);

  const roleName = user?.role?.name;
  const canWrite = roleName === "Administrador" || roleName === "Recepcionista";
  const guestAge = calculateAge(guestForm.birth_date);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    };
  }, []);

  function handleFileChange(event) {
    const files = Array.from(event.target.files ?? []);
    const nextImages = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [...current, ...nextImages]);
    setOcrResult(null);
    setMessage("");
    setError("");
    event.target.value = "";
  }

  function removeImage(imageId) {
    setSelectedImages((current) => {
      const imageToRemove = current.find((image) => image.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return current.filter((image) => image.id !== imageId);
    });
    setOcrResult(null);
    setMessage("");
    setError("");
  }

  function handleGuestFieldChange(event) {
    const { name, value } = event.target;
    setGuestForm((current) => ({ ...current, [name]: value }));
  }

  async function handleExtract() {
    if (selectedImages.length === 0) {
      setError("Selecciona una o más imágenes antes de extraer datos.");
      return;
    }

    setExtracting(true);
    setMessage("");
    setError("");

    try {
      const data = await extractOCRMultiple(selectedImages.map((image) => image.file));
      const failedFiles = data.files.filter((fileResult) => fileResult.status === "failed");
      const detectedFields = data.detected_fields ?? {};
      setOcrResult(data);
      setGuestForm((current) => ({
        ...current,
        full_name: detectedFields.full_name || current.full_name,
        document_number: detectedFields.document_number || current.document_number,
        document_type: detectedFields.document_type || current.document_type,
        birth_date: detectedFields.birth_date || current.birth_date,
        nationality: detectedFields.nationality || current.nationality,
        address: detectedFields.address || current.address,
        notes:
          current.notes ||
          `Registro asistido por OCR: ${data.files
            .filter((fileResult) => fileResult.status === "success")
            .map((fileResult) => fileResult.filename)
            .join(", ")}`,
      }));

      if (failedFiles.length > 0) {
        setMessage(
          `OCR finalizado con advertencias. No se pudo procesar: ${failedFiles
            .map((fileResult) => fileResult.original_filename)
            .join(", ")}.`,
        );
      } else {
        const missingImportantFields = [];
        if (!detectedFields.full_name) {
          missingImportantFields.push("nombre");
        }
        if (!detectedFields.document_number) {
          missingImportantFields.push("documento");
        }

        setMessage(
          missingImportantFields.length > 0
            ? `Datos sugeridos automáticamente. No se detectó con suficiente claridad: ${missingImportantFields.join(
                ", ",
              )}. Complete manualmente.`
            : "Datos sugeridos automáticamente. Revise y corrija antes de guardar.",
        );
      }
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
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setGuestForm(emptyGuestForm);
      setOcrResult(null);
      setSelectedImages([]);
      setMessage("Huésped guardado correctamente desde registro OCR.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ocr-workspace">
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="h4 mb-1">Registro OCR</h2>
          <p className="text-secondary mb-0">
            Puede cargar una o varias imágenes del documento, por ejemplo anverso
            y reverso del carnet. El OCR asiste el registro, pero los datos deben
            revisarse antes de guardar.
          </p>
        </div>
        <span className="al-badge al-badge-primary align-self-start">
          OCR asistido
        </span>
      </div>

      {message ? <div className="al-alert al-alert-warning">{message}</div> : null}
      {error ? (
        <div className="al-alert al-alert-danger">
          {error.toLowerCase().includes("tesseract") || error.toLowerCase().includes("ocr") || error.toLowerCase().includes("500")
            ? "El OCR requiere Tesseract instalado en el servidor. Puede completar los datos manualmente en el formulario de la derecha."
            : error}
        </div>
      ) : null}

      {!canWrite ? (
        <div className="al-alert al-alert-warning">
          Tu rol solo permite consultar informacion. El registro OCR requiere rol Administrador o Recepcionista.
        </div>
      ) : null}

      <div className="ocr-steps-banner">
        <div className={`ocr-step-indicator ${selectedImages.length > 0 ? "done" : "active"}`}>
          <span className="ocr-step-num">1</span>
          <span className="ocr-step-label">Cargar imagenes</span>
        </div>
        <div className={`ocr-step-indicator ${ocrResult ? "done" : selectedImages.length > 0 ? "active" : ""}`}>
          <span className="ocr-step-num">2</span>
          <span className="ocr-step-label">Extraer datos</span>
        </div>
        <div className={`ocr-step-indicator ${ocrResult ? "active" : ""}`}>
          <span className="ocr-step-num">3</span>
          <span className="ocr-step-label">Revisar informacion</span>
        </div>
        <div className="ocr-step-indicator">
          <span className="ocr-step-num">4</span>
          <span className="ocr-step-label">Guardar huesped</span>
        </div>
      </div>

      <div className="al-alert al-alert-info" style={{marginBottom: "1.25rem"}}>
        El OCR asiste el registro; revise los datos antes de guardar. La calidad depende de la iluminacion y recorte de la imagen.
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <div className="ocr-step-card">
            <h3 className="h6 mb-3" style={{color: "#a5523a", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem"}}>Paso 1 — Cargar imagenes</h3>

            <div className="ocr-file-picker mb-3">
              <input
                accept="image/*"
                className="visually-hidden"
                disabled={!canWrite}
                id="ocr_files"
                multiple
                onChange={handleFileChange}
                type="file"
              />
              <div className="ocr-drop-zone">
                <label className="al-file-btn" htmlFor="ocr_files" style={{pointerEvents: canWrite ? "auto" : "none", opacity: canWrite ? 1 : 0.5}}>
                  Seleccionar imagenes
                </label>
                <p className="ocr-drop-zone-label mt-2 mb-0">
                  {selectedImages.length > 0
                    ? <><strong>{selectedImages.length}</strong> imagen{selectedImages.length === 1 ? "" : "es"} cargada{selectedImages.length === 1 ? "" : "s"}</>
                    : <>Sin imagenes seleccionadas</>}
                </p>
              </div>
            </div>

            {selectedImages.length > 0 ? (
              <div className="ocr-preview-grid mb-3">
                {selectedImages.map((image) => (
                  <div className="ocr-preview-item" key={image.id}>
                    <img
                      alt={`Vista previa de ${image.file.name}`}
                      src={image.previewUrl}
                    />
                    <div className="ocr-preview-item-footer">
                      <p className="ocr-preview-item-name">{image.file.name}</p>
                      <button
                        className="al-btn-sm al-btn-outline-danger"
                        disabled={!canWrite || extracting}
                        onClick={() => removeImage(image.id)}
                        style={{fontSize: "0.68rem", padding: "0.2rem 0.5rem"}}
                        type="button"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <h3 className="h6 mb-2" style={{color: "#a5523a", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem"}}>Paso 2 — Extraer texto</h3>
            <button
              className="al-btn al-btn-primary"
              disabled={!canWrite || selectedImages.length === 0 || extracting}
              onClick={handleExtract}
              type="button"
            >
              {extracting ? "Extrayendo..." : "Extraer datos"}
            </button>
          </div>

          {ocrResult ? (
            <div className="ocr-step-card mt-4">
              <h3 className="h6 mb-3" style={{color: "#a5523a", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem"}}>Texto extraido</h3>
              <div className="mb-3">
                <p className="mb-1">
                  <strong>Nombre detectado:</strong>{" "}
                  {ocrResult.detected_full_name || "No detectado"}
                </p>
                <p className="mb-0">
                  <strong>Documento detectado:</strong>{" "}
                  {ocrResult.detected_document_number || "No detectado"}
                </p>
              </div>

              {ocrResult.detected_fields ? (
                <div className="mb-3">
                  <h4 className="h6">Campos detectados</h4>
                  <div className="al-table-responsive">
                    <table className="table table-sm mb-0">
                      <tbody>
                        {Object.entries(ocrResult.detected_fields)
                          .filter(([, value]) => value)
                          .map(([fieldName, value]) => (
                            <tr key={fieldName}>
                              <th className="text-secondary" scope="row">
                                {formatDetectedLabel(fieldName)}
                              </th>
                              <td>{value}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="mb-3">
                {ocrResult.files.map((fileResult) => (
                  <div
                    className={`alert py-2 mb-2 ${
                      fileResult.status === "success"
                        ? "alert-success"
                        : "alert-warning"
                    }`}
                    key={`${fileResult.original_filename}-${fileResult.filename}`}
                  >
                    <strong>{fileResult.original_filename}</strong>:{" "}
                    {fileResult.status === "success"
                      ? "Procesado correctamente"
                      : fileResult.error || "No se pudo procesar esta imagen"}
                  </div>
                ))}
              </div>

              <div className="ocr-extracted-box mb-3">
                {ocrResult.combined_text || "Sin texto extraido."}
              </div>
            </div>
          ) : null}
        </div>

        <div className="col-xl-7">
          <form className="ocr-step-card" onSubmit={handleSaveGuest}>
            <h3 className="h6 mb-3" style={{color: "#a5523a", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem"}}>Paso 3 — Revisar datos</h3>

            <div className="mb-3">
              <label className="form-label" htmlFor="full_name">
                Nombre completo
              </label>
              <input
                className="al-input"
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
                  className="al-input"
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
                  Número documento
                </label>
                <input
                  className="al-input"
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
                  Teléfono
                </label>
                <input
                  className="al-input"
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
                  className="al-input"
                  disabled={!canWrite}
                  id="birth_date"
                  name="birth_date"
                  onChange={handleGuestFieldChange}
                  type="date"
                  value={guestForm.birth_date}
                />
                <div className="form-text">
                  {guestAge !== null ? `Edad: ${guestAge} años` : "Edad no calculada"}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="al-input"
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
                  className="al-input"
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
                Dirección
              </label>
              <input
                className="al-input"
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
                className="al-input"
                disabled={!canWrite}
                id="notes"
                name="notes"
                onChange={handleGuestFieldChange}
                rows="3"
                value={guestForm.notes}
              />
            </div>

            <p className="al-form-section-title">Guardar huesped</p>
            <button className="al-btn al-btn-primary" disabled={!canWrite || saving} type="submit">
              {saving ? "Guardando..." : "Guardar huesped"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default OCRRegister;
