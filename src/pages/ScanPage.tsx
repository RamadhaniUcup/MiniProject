import { ChangeEvent, useEffect, useRef, useState } from "react";
import type { ScanResult } from "../types/batik";

const API_URL = "http://127.0.0.1:5000/predict";
const JAVANESE_BATIK = "\uA9A7\uA9A0\uA9B6\uA98F\uA9C0";
const JAVANESE_JAWA = "\uA997\uA9AE";
const JAVANESE_NUSANTARA = "\uA9A4\uA9B8\uA9B1\uA9A4\uA9C0\uA9A0\uA9AB";

type ScanMode = "upload" | "camera";

function isScanResult(value: unknown): value is ScanResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ScanResult>;
  return (
    typeof candidate.classKey === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.origin === "string" &&
    typeof candidate.philosophy === "string" &&
    typeof candidate.confidence === "number"
  );
}

async function canvasToFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
        return;
      }
      reject(new Error("Gagal mengambil gambar dari kamera."));
    }, "image/jpeg", 0.92);
  });

  return new File([blob], filename, { type: "image/jpeg" });
}

export default function ScanPage() {
  const [mode, setMode] = useState<ScanMode>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  };

  const clearResult = () => {
    setResult(null);
    setErrorMessage("");
  };

  const handleModeChange = (nextMode: ScanMode) => {
    setMode(nextMode);
    clearResult();
    if (nextMode === "upload") {
      stopCamera();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    clearResult();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const startCamera = async () => {
    clearResult();

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("Browser ini belum mendukung akses kamera.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch {
      setErrorMessage("Kamera tidak bisa diakses. Periksa izin kamera browser Anda.");
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setErrorMessage("Kamera belum siap. Tunggu sebentar lalu coba lagi.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setErrorMessage("Gagal memproses gambar kamera.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const file = await canvasToFile(canvas, "batik-camera-capture.jpg");
    clearResult();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const runPrediction = async () => {
    if (!selectedFile) {
      setErrorMessage("Pilih atau ambil gambar batik terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        throw new Error("Layanan scan belum siap. Coba beberapa saat lagi.");
      }

      if (!isScanResult(payload)) {
        throw new Error("Hasil scan belum dapat dibaca. Silakan coba foto lain.");
      }

      setResult(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat memindai gambar.";
      setErrorMessage(
        message.includes("Failed to fetch")
          ? "Layanan scan belum tersambung. Pastikan layanan BatikVision sudah berjalan, lalu coba lagi."
          : message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative overflow-hidden">
      <section className="relative border-b border-soga-200/80 bg-heritage-ink">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-28"
          style={{ backgroundImage: "url('/images/hero-batik.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-heritage-ink/82" aria-hidden="true" />
        <div className="absolute right-8 top-10 hidden font-display text-5xl text-heritage-gold/20 lg:block" aria-hidden="true">
          {JAVANESE_BATIK}
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-heritage-gold">
              {JAVANESE_JAWA} / BatikVision
            </p>
            <h1 className="mt-5 font-display text-5xl font-bold leading-tight text-heritage-ivory md:text-6xl">
              Scan Motif Batik
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-soga-100">
              Unggah foto kain batik untuk mengenali motif, asal daerah, dan makna filosofinya.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="absolute left-5 top-8 hidden h-px w-56 bg-soga-300 md:block" aria-hidden="true" />
        <div className="absolute right-8 top-8 hidden font-display text-2xl text-soga-300/80 md:block" aria-hidden="true">
          {JAVANESE_NUSANTARA}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="rounded-lg border border-soga-200/90 bg-heritage-ivory/95 p-5 shadow-[0_24px_70px_rgba(59,33,27,0.1)] md:p-7">
            <div className="flex flex-col gap-4 border-b border-soga-200 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-heritage-gold">Sumber Gambar</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-heritage-ink">Pilih foto batik</h2>
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-md border border-soga-200 bg-soga-100 p-1">
                <button
                  type="button"
                  onClick={() => handleModeChange("upload")}
                  className={`min-h-10 rounded-md px-4 text-sm font-black transition ${
                    mode === "upload" ? "bg-white text-heritage-maroon shadow-sm" : "text-soga-700 hover:bg-white/70"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("camera")}
                  className={`min-h-10 rounded-md px-4 text-sm font-black transition ${
                    mode === "camera" ? "bg-white text-heritage-maroon shadow-sm" : "text-soga-700 hover:bg-white/70"
                  }`}
                >
                  Kamera
                </button>
              </div>
            </div>

            {mode === "upload" ? (
              <div className="relative mt-6 overflow-hidden rounded-lg border border-dashed border-soga-300 bg-white p-7 text-center">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-[0.06]"
                  style={{ backgroundImage: "url('/images/batik-detail.jpg')" }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <p className="font-display text-2xl font-bold text-heritage-ink">Unggah foto kain batik</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-soga-700">
                    Pilih foto yang cukup terang dan menampilkan pola batik dengan jelas.
                  </p>
                  <label className="mt-6 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md bg-heritage-ink px-5 text-sm font-black text-heritage-ivory shadow-sm transition hover:-translate-y-0.5 hover:bg-soga-700">
                    Pilih Foto
                    <input className="sr-only" type="file" accept="image/*" onChange={handleFileChange} />
                  </label>
                  {selectedFile ? (
                    <p className="mt-4 text-xs font-semibold text-soga-600">{selectedFile.name}</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="relative overflow-hidden rounded-lg border border-soga-200 bg-heritage-ink">
                  <video ref={videoRef} className="aspect-video w-full object-cover" autoPlay playsInline muted />
                  {!isCameraActive ? (
                    <div className="absolute inset-0 grid place-items-center bg-heritage-ink/88 px-6 text-center">
                      <div>
                        <p className="font-display text-2xl font-bold text-heritage-ivory">Kamera siap digunakan</p>
                        <p className="mt-2 text-sm leading-6 text-soga-100">
                          Arahkan kamera ke kain batik setelah kamera dinyalakan.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-heritage-ink px-5 text-sm font-black text-heritage-ivory shadow-sm transition hover:bg-soga-700"
                  >
                    Nyalakan Kamera
                  </button>
                  <button
                    type="button"
                    onClick={captureFromCamera}
                    disabled={!isCameraActive}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-heritage-maroon px-5 text-sm font-black text-heritage-ivory shadow-sm transition hover:bg-soga-600 disabled:cursor-not-allowed disabled:bg-soga-300"
                  >
                    Ambil Foto
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-soga-500">Preview Gambar</p>
              <div className="overflow-hidden rounded-lg border border-soga-200 bg-white">
                {previewUrl ? (
                  <img className="aspect-video w-full object-cover" src={previewUrl} alt="Preview gambar batik" />
                ) : (
                  <div className="grid aspect-video place-items-center px-6 text-center">
                    <div>
                      <p className="font-display text-2xl font-bold text-heritage-ink">Belum ada foto</p>
                      <p className="mt-2 max-w-md text-sm leading-6 text-soga-700">
                        Foto batik yang dipilih akan tampil di sini sebelum proses scan dimulai.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={runPrediction}
                disabled={isLoading}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-heritage-gold px-6 text-sm font-black text-heritage-ink shadow-[0_18px_40px_rgba(184,138,74,0.2)] transition hover:-translate-y-0.5 hover:bg-soga-300 disabled:cursor-wait disabled:opacity-70"
              >
                {isLoading ? "Menganalisis Motif..." : "Scan Batik"}
              </button>
            </div>
          </section>

          <aside className="rounded-lg border border-soga-200/90 bg-white/95 p-5 shadow-[0_24px_70px_rgba(59,33,27,0.1)] md:p-7">
            <div className="flex items-start justify-between gap-5 border-b border-soga-200 pb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-heritage-gold">Hasil Scan</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-heritage-ink">Motif Terdeteksi</h2>
              </div>
              <span className="font-display text-2xl text-soga-300" aria-hidden="true">
                {JAVANESE_BATIK}
              </span>
            </div>

            {errorMessage ? (
              <div className="mt-5 rounded-lg border border-[#d7aaa3] bg-[#fff6f2] p-5 text-sm leading-6 text-heritage-maroon">
                {errorMessage}
              </div>
            ) : null}

            {result ? (
              <div className="mt-5 rounded-lg border border-soga-200 bg-soga-50 p-6">
                <p className="text-sm font-bold text-soga-700">Motif Terdeteksi</p>
                <h3 className="mt-2 font-display text-4xl font-bold text-heritage-ink">{result.title}</h3>
                <dl className="mt-6 grid gap-4">
                  <div className="rounded-md border border-soga-100 bg-white p-4">
                    <dt className="text-xs font-black uppercase tracking-[0.14em] text-soga-500">
                      Tingkat Kecocokan AI
                    </dt>
                    <dd className="mt-1 text-2xl font-black text-heritage-maroon">
                      {result.confidence.toFixed(1)}%
                    </dd>
                  </div>
                  <div className="rounded-md border border-soga-100 bg-white p-4">
                    <dt className="text-xs font-black uppercase tracking-[0.14em] text-soga-500">Asal Daerah</dt>
                    <dd className="mt-1 font-semibold text-heritage-ink">{result.origin}</dd>
                  </div>
                  <div className="rounded-md border border-soga-100 bg-white p-4">
                    <dt className="text-xs font-black uppercase tracking-[0.14em] text-soga-500">Filosofi</dt>
                    <dd className="mt-2 leading-7 text-soga-700">{result.philosophy}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="mt-5 grid min-h-[420px] place-items-center rounded-lg border border-dashed border-soga-300 bg-soga-50 p-8 text-center">
                <div>
                  <p className="font-display text-3xl font-bold text-heritage-ink">Menunggu foto batik</p>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-soga-700">
                    Pilih foto batik, lalu hasil motif, asal daerah, dan filosofinya akan muncul di sini.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
