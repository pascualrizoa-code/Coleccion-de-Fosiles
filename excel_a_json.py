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
# CARGA EXCEL
# -----------------------------
df = pd.read_excel(EXCEL_FILE)

# Limpieza total
df = df.astype(object)
df = df.replace({pd.NaT: "", np.nan: ""})

records = []

for _, row in df.iterrows():
    rec = row.to_dict()

    inv = str(rec.get("Nº Inventario", "")).strip()
    imgs = []

    if inv:
        folder = IMAGES_DIR / inv
        if folder.exists() and folder.is_dir():
            imgs = sorted(
                [f.name for f in folder.iterdir()
                 if f.suffix.lower() in (".jpg", ".jpeg", ".png")]
            )

    rec["imagenes"] = imgs
    records.append(rec)

# -----------------------------
# GUARDAR JSON
# -----------------------------
Path(OUTPUT_JSON).write_text(
    json.dumps(records, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print("✔ JSON generado correctamente")
print(f"✔ Registros exportados: {len(records)}")
print("✔ Imágenes detectadas automáticamente")
