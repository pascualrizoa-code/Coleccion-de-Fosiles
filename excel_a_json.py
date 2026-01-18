import pandas as pd
import json
from pathlib import Path
import numpy as np

# -----------------------------
# CONFIGURACIÓN
# -----------------------------
EXCEL_FILE = "Coleccion de Fosiles.xlsx"
OUTPUT_JSON = "catalogo_fosiles.json"
IMAGES_DIR = Path("imagenes")

# -----------------------------
# CARGA Y LIMPIEZA
# -----------------------------
# Cargamos el excel (Requiere: pip install openpyxl)
df = pd.read_excel(EXCEL_FILE)

# Reemplazamos valores nulos (NaN, NaT) por strings vacíos
df = df.fillna("")

records = []

# Función para convertir tipos de Numpy a tipos estándar de Python
def serializar_dato(obj):
    if isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    if isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    if isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    return obj

for _, row in df.iterrows():
    # Convertimos la fila a un diccionario de Python con tipos nativos
    rec = {k: serializar_dato(v) for k, v in row.to_dict().items()}

    # Identificador para la carpeta de imágenes
    inv = str(rec.get("Nº Inventario", "")).strip()
    imgs = []

    if inv:
        folder = IMAGES_DIR / inv
        if folder.exists() and folder.is_dir():
            # Filtramos solo archivos de imagen y los ordenamos
            imgs = sorted(
                [f.name for f in folder.iterdir()
                 if f.suffix.lower() in (".jpg", ".jpeg", ".png")]
            )

    rec["imagenes"] = imgs
    records.append(rec)

# -----------------------------
# GUARDAR JSON (MODO ROBUSTO)
# -----------------------------
# Usamos default=str como red de seguridad para cualquier tipo no previsto
contenido_json = json.dumps(records, ensure_ascii=False, indent=2, default=str)

Path(OUTPUT_JSON).write_text(contenido_json, encoding="utf-8")

print("[OK] JSON generado correctamente")
print(f"[OK] Registros exportados: {len(records)}")
print("[OK] Imágenes detectadas automáticamente")