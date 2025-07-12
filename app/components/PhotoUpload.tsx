"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string) => void;
  className?: string;
}

export default function PhotoUpload({
  currentPhoto = "/assets/placeholder-image.svg",
  onPhotoChange,
  className = "",
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Stelle sicher, dass previewUrl nie leer ist
  const validCurrentPhoto =
    currentPhoto && currentPhoto.trim() !== ""
      ? currentPhoto
      : "/assets/placeholder-image.svg";
  const [previewUrl, setPreviewUrl] = useState<string>(validCurrentPhoto);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update previewUrl when currentPhoto changes
  useEffect(() => {
    const validPhoto =
      currentPhoto && currentPhoto.trim() !== ""
        ? currentPhoto
        : "/assets/placeholder-image.svg";
    setPreviewUrl(validPhoto);
  }, [currentPhoto]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validierung vor Upload
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Datei ist zu groß. Maximum 5MB erlaubt.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Ungültiger Dateityp. Nur JPEG, PNG und WebP sind erlaubt."
      );
      return;
    }

    // Vorschau erstellen
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Upload starten
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/contacts/upload-photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload fehlgeschlagen");
      }

      // Erfolgreich hochgeladen
      onPhotoChange(result.photoUrl);
      setPreviewUrl(result.photoUrl);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Upload fehlgeschlagen"
      );
      // Vorschau zurücksetzen bei Fehler - mit gültigem Fallback
      const fallbackPhoto =
        currentPhoto && currentPhoto.trim() !== ""
          ? currentPhoto
          : "/assets/placeholder-image.svg";
      setPreviewUrl(fallbackPhoto);
    } finally {
      setIsUploading(false);
      // Input zurücksetzen
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl("/assets/placeholder-image.svg");
    onPhotoChange("/assets/placeholder-image.svg");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Kontakt Foto
      </label>

      {/* Foto-Vorschau */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
            {" "}
            <Image
              src={previewUrl || "/assets/placeholder-image.svg"}
              alt="Foto Vorschau"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>

          {/* Upload-Indikator */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <svg
                className="animate-spin h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>

        {/* Upload-Buttons */}
        <div className="flex-1">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              {isUploading ? "Uploading..." : "Foto auswählen"}
            </button>

            {previewUrl !== "/assets/placeholder-image.svg" && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isUploading}
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {" "}
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Entfernen
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG oder WebP. Maximal 5MB.
          </p>
        </div>
      </div>

      {/* Verstecktes File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Foto auswählen"
        title="Foto auswählen"
      />

      {/* Fehleranzeige */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800">{uploadError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
