#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data Story Export Script
========================

Dieses Skript exportiert alle relevanten Daten für die Visualisierung des Satzes:
"Wir bieten elegantes Catering und exklusive Locations für unvergessliche Veranstaltungen."

Export-Struktur (Option 1):
- model_data.json: Alle Daten in einer Datei
- token_embeddings_2d.csv: 2D-Koordinaten für Visualisierung
- vocab_full_2d.csv: Globale 2D-Karte des Vokabulars
- neighbors_by_token.json: Nachbarn für jeden Satz-Token
- vocab_id2coord.json: Schneller Lookup von Token-ID zu Koordinaten
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import json
import numpy as np
from sklearn.decomposition import PCA
import pandas as pd
import os
import re

# Konstante für Speicherplatz-Optimierung
NEURON_LIMIT = 30  # Speichert nur die ersten 30 Neuronen statt alle

# --- VOCABULARY PROCESSING FUNCTIONS (exact implementation from plan) ---

def get_vocab_embeddings(model):
    """Return [V, D] embedding matrix on CPU."""
    return model.get_input_embeddings().weight.detach().cpu().numpy()

def l2_normalize_rows(X):
    n = np.linalg.norm(X, axis=1, keepdims=True) + 1e-9
    return X / n

def filter_vocab(tokenizer, keep_hash=False, min_len=3, allow_regex=r"^[A-Za-zÄÖÜäöüß\-]+$"):
    vocab = tokenizer.get_vocab()
    inv = sorted(vocab.items(), key=lambda kv: kv[1])  # (token, id) by id
    pat = re.compile(allow_regex) if allow_regex else None
    specials = set(["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"])
    kept_ids, kept_tokens = [], []
    for tok, tid in inv:
        if tok in specials:
            continue
        if not keep_hash and tok.startswith("##"):
            continue
        if len(tok.replace("#", "")) < min_len:
            continue
        if pat and not pat.match(tok.replace("#", "")):
            continue
        kept_ids.append(tid); kept_tokens.append(tok)
    return np.array(kept_ids, dtype=int), kept_tokens

def project_vocab_2d(W_norm, kept_ids, method="umap"):
    # PCA → 50D
    pca = PCA(n_components=50, random_state=42)
    Z50 = pca.fit_transform(W_norm[kept_ids])

    if method == "pca":
        Z2 = PCA(n_components=2, random_state=42).fit_transform(W_norm[kept_ids])
        return Z2, pca, None

    try:
        import umap
        reducer = umap.UMAP(
            n_neighbors=100, min_dist=0.1, metric="cosine",
            n_components=2, random_state=42
        )
        Z2 = reducer.fit_transform(Z50)
        return Z2, pca, reducer
    except Exception:
        # Fallback: PCA(2)
        Z2 = PCA(n_components=2, random_state=42).fit_transform(W_norm[kept_ids])
        return Z2, pca, None

def topk_neighbors(W_norm, token_id, candidate_ids, k=20):
    """Cosine neighbors among candidate_ids for a given token_id."""
    q = W_norm[token_id]  # [D]
    sims = W_norm[candidate_ids] @ q   # [Nc]
    order = np.argpartition(-sims, min(k, len(sims)-1))[:k]
    order = order[np.argsort(-sims[order])]
    return [(int(candidate_ids[i]), float(sims[i])) for i in order]

def export_vocab_map_and_neighbors(tokenizer, model, sentence_tokens, out_dir="."):
    """Export vocabulary map and neighbors exactly as specified in the plan."""
    os.makedirs(out_dir, exist_ok=True)

    # 1) Embeddings
    print("📥 Lade Input-Embedding-Matrix...")
    W = get_vocab_embeddings(model)
    print(f"✅ Embedding-Matrix geladen: {W.shape}")
    
    print("📏 L2-Normalisierung der Embeddings...")
    W_norm = l2_normalize_rows(W)
    print("✅ L2-Normalisierung abgeschlossen!")

    # 2) Filter vocab (tune to taste)
    print("🔍 Filtere Vokabular...")
    kept_ids, kept_tokens = filter_vocab(tokenizer, keep_hash=False, min_len=3)
    print(f"📚 Gefilterte Vokabular-Größe: {len(kept_tokens)} Tokens")

    # 3) Project to 2D
    print("🔄 Projiziere Vokabular zu 2D...")
    Z2, pca, reducer = project_vocab_2d(W_norm, kept_ids, method="umap")
    print("✅ 2D-Projektion abgeschlossen!")

    # 4) Save full vocab 2D map
    print("💾 Speichere globale Vokabular-2D-Karte...")
    df = pd.DataFrame({
        "token_id": kept_ids,
        "token": kept_tokens,
        "x": Z2[:, 0],
        "y": Z2[:, 1],
    })
    df.to_csv(os.path.join(out_dir, "vocab_full_2d.csv"), index=False)
    print("✅ Globale Vokabular-2D-Karte gespeichert: vocab_full_2d.csv")

    # 5) Neighbors for your sentence tokens (IDs may be outside kept_ids if filtered)
    print("🔍 Berechne Cosine-Nachbarn für Satz-Tokens...")
    cand_set = set(map(int, kept_ids))
    neighbors_payload = {}
    for tok in sentence_tokens:
        tid = tokenizer.convert_tokens_to_ids(tok)
        if tid is None or tid < 0 or tok in ["[CLS]", "[SEP]", "[PAD]", "[UNK]", "[MASK]"]:
            continue
        # only compute neighbors within kept_ids for clean UI
        nns = topk_neighbors(W_norm, tid, kept_ids, k=20)
        neighbors_payload[tok] = [
            {"token_id": nid,
             "token": tokenizer.convert_ids_to_tokens(nid),
             "similarity": round(sim, 3)}
            for (nid, sim) in nns
        ]
    
    print(f"✅ Nachbarn für {len(neighbors_payload)} Satz-Tokens berechnet!")

    # Save neighbors to JSON
    with open(os.path.join(out_dir, "neighbors_by_token.json"), "w", encoding="utf-8") as f:
        json.dump(neighbors_payload, f, ensure_ascii=False, indent=2)
    print("✅ Nachbarn gespeichert: neighbors_by_token.json")

    # 6) Also store a quick lookup dict from token_id → (x, y)
    print("🔍 Erstelle Token-ID zu Koordinaten Lookup...")
    id2coord = {int(tid): (float(x), float(y)) for tid, x, y in zip(kept_ids, Z2[:,0], Z2[:,1])}
    with open(os.path.join(out_dir, "vocab_id2coord.json"), "w", encoding="utf-8") as f:
        json.dump(id2coord, f)
    print(f"✅ Lookup-Dictionary erstellt: {len(id2coord)} Token-IDs")
    print("✅ Lookup gespeichert: vocab_id2coord.json")

    return df, neighbors_payload, id2coord

def main():
    print("🚀 Starte Data Export...")
    print(f"💾 Neuron-Limit: {NEURON_LIMIT} (Speicherplatz-Optimierung aktiviert)")
    
    # Pfad zum feingetunten Modell
    checkpoint_path = "/Users/davidbirkenberger/Documents/rifel_models/final/checkpoint-378"
    
    # Prüfe ob Modell-Pfad existiert
    if not os.path.exists(checkpoint_path):
        print(f"❌ Fehler: Modell-Pfad existiert nicht: {checkpoint_path}")
        print("Bitte überprüfe den Pfad zum feingetunten Modell.")
        return
    
    # Modell und Tokenizer laden
    print("📥 Lade Modell...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(checkpoint_path)
        model = AutoModelForSequenceClassification.from_pretrained(checkpoint_path)
        print("✅ Modell geladen!")
    except Exception as e:
        print(f"❌ Fehler beim Laden des Modells: {e}")
        return
    
    # Neue Eingabe: Wir bieten elegantes Catering und exklusive Locations für unvergessliche Veranstaltungen.
    text = "Wir bieten elegantes Catering und exklusive Locations für unvergessliche Veranstaltungen."
    
    print(f"📝 Verarbeite Text: {text}")
    
    # Tokenisierung
    inputs = tokenizer(text, return_tensors="pt")
    input_ids = inputs["input_ids"]
    tokens = tokenizer.convert_ids_to_tokens(input_ids[0])
    
    print(f"🔤 Tokens: {tokens}")
    print(f"📊 Anzahl Tokens: {len(tokens)}")
    
    # Modell in Evaluierungsmodus setzen
    model.eval()
    
    # Zugriff auf die Token-Embedding-Schicht
    embedding_layer = model.get_input_embeddings()
    
    print("🔄 Starte Vorwärtsdurchlauf...")
    
    # Vorwärtsdurchlauf mit allen Ausgaben
    with torch.no_grad():
        # Token-Embeddings (ohne Kontext)
        token_embeddings_raw = embedding_layer(input_ids)[0]  # Shape: [seq_len, hidden_size]
        
        # Vollständiger Vorwärtsdurchlauf
        outputs = model(**inputs, output_hidden_states=True, output_attentions=True)
        
        # Hidden States für jeden Layer
        hidden_states = outputs.hidden_states  # List of [1, seq_len, hidden_size]
        
        # Attention-Matrizen
        attentions = outputs.attentions  # List of [1, num_heads, seq_len, seq_len]
        
        # Finale Ausgabe
        logits = outputs.logits[0]
        cls_embedding = hidden_states[-1][0, 0]  # CLS-Token aus dem letzten Layer
        
        # Predictions (Softmax über Logits)
        probabilities = torch.softmax(logits, dim=0)
        predicted_class = torch.argmax(logits).item()
    
    print(f"✅ Vorwärtsdurchlauf abgeschlossen!")
    print(f"🏗️  Anzahl Layer: {len(hidden_states)}")
    print(f"👁️  Anzahl Attention Heads: {attentions[0].shape[1]}")
    print(f"📏 Hidden Size: {hidden_states[0].shape[2]}")
    print(f"🎯 Anzahl Output-Klassen: {logits.shape[0]}")
    print(f"🏆 Vorhergesagte Klasse: {predicted_class}")
    
    # PCA für 2D-Visualisierung der Token-Embeddings
    print("📊 Berechne 2D-Koordinaten mit PCA...")
    pca = PCA(n_components=2)
    token_embeddings_2d = pca.fit_transform(token_embeddings_raw.cpu().numpy())
    print("✅ PCA abgeschlossen!")
    
    # Feed-Forward-Layer-Daten extrahieren (KORRIGIERT)
    print("🏗️  Extrahiere echte Feed-Forward-Layer-Daten...")
    feedforward_layers = []
    
    # Zugriff auf die Transformer-Layer
    transformer_layers = model.bert.encoder.layer
    
    for layer_idx in range(len(transformer_layers)):
        layer = transformer_layers[layer_idx]
        
        # Feed-Forward-Netzwerk des Layers
        ff_layer = layer.intermediate  # Linear1 + GELU
        output_layer = layer.output.dense  # Linear2
        
        # Gewichte und Bias extrahieren (nur erste 30 Neuronen)
        linear1_weights = ff_layer.dense.weight.detach().cpu().numpy()[:NEURON_LIMIT, :NEURON_LIMIT]  # Shape: [30, 30]
        linear1_bias = ff_layer.dense.bias.detach().cpu().numpy()[:NEURON_LIMIT]      # Shape: [30]
        linear2_weights = output_layer.weight.detach().cpu().numpy()[:NEURON_LIMIT, :NEURON_LIMIT]   # Shape: [30, 30]
        linear2_bias = output_layer.bias.detach().cpu().numpy()[:NEURON_LIMIT]        # Shape: [30]
        
        # Hidden States für diesen Layer (Input für Feed-Forward)
        layer_input = hidden_states[layer_idx]  # Shape: [1, seq_len, 768]
        
        # Feed-Forward-Berechnung für jeden Token (nur erste 30 Neuronen)
        linear1_output = {}
        gelu_output = {}
        linear2_output = {}
        
        for token_idx, token in enumerate(tokens):
            # Input für diesen Token (nur erste 30 Neuronen)
            token_input = layer_input[0, token_idx][:NEURON_LIMIT]  # Shape: [30]
            
            # Linear1: 30 -> 30 (reduziert)
            token_linear1 = torch.matmul(token_input, ff_layer.dense.weight[:NEURON_LIMIT, :NEURON_LIMIT].t()) + ff_layer.dense.bias[:NEURON_LIMIT]
            linear1_output[token] = token_linear1.tolist()
            
            # GELU-Aktivierung
            token_gelu = torch.nn.functional.gelu(token_linear1)
            gelu_output[token] = token_gelu.tolist()
            
            # Linear2: 30 -> 30 (reduziert)
            token_linear2 = torch.matmul(token_gelu, output_layer.weight[:NEURON_LIMIT, :NEURON_LIMIT].t()) + output_layer.bias[:NEURON_LIMIT]
            linear2_output[token] = token_linear2.tolist()
        
        # Layer-Daten strukturieren
        layer_data = {
            "layer_id": layer_idx,
            "name": f"Transformer Block {layer_idx} - Feed-Forward",
            "linear1": {
                "weights": linear1_weights.tolist(),  # [30, 30]
                "bias": linear1_bias.tolist(),       # [30]
                "output_values": linear1_output      # {token: [30 Werte]}
            },
            "gelu": {
                "output_values": gelu_output         # {token: [30 Werte]}
            },
            "linear2": {
                "weights": linear2_weights.tolist(), # [30, 30]
                "bias": linear2_bias.tolist(),      # [30]
                "output_values": linear2_output     # {token: [30 Werte]}
            }
        }
        
        feedforward_layers.append(layer_data)
    
    print(f"✅ {len(feedforward_layers)} Feed-Forward-Layer extrahiert!")
    
    # Attention-Daten strukturieren
    print("👁️  Strukturiere Attention-Daten...")
    attention_data = {}
    for layer_idx, layer_attention in enumerate(attentions):
        layer_key = f"layer_{layer_idx}"
        attention_data[layer_key] = {}
        
        # Entferne Batch-Dimension
        layer_attention = layer_attention[0]  # Shape: [num_heads, seq_len, seq_len]
        
        for head_idx in range(layer_attention.shape[0]):
            head_key = f"head_{head_idx}"
            attention_data[layer_key][head_key] = layer_attention[head_idx].tolist()
    
    print(f"✅ Attention-Daten für {len(attention_data)} Layer strukturiert!")
    
    # CLS zu Output-Neuronen Verbindungen berechnen (KORRIGIERT)
    print("🔗 Berechne CLS-zu-Output-Neuronen Verbindungen...")
    
    # Zugriff auf Klassifikator-Gewichte
    classifier_weight = model.classifier.weight  # Shape: [num_classes, hidden_size]
    classifier_bias = model.classifier.bias      # Shape: [num_classes]
    
    cls_to_output_connections = []
    
    # Berechne Verbindungsstärken zwischen CLS und jedem Output-Neuron
    for class_idx in range(classifier_weight.shape[0]):
        # Gewichte für diese Klasse (nur erste 30 Neuronen)
        class_weights = classifier_weight[class_idx][:NEURON_LIMIT]  # Shape: [30]
        
        # Verbindungsstärke = Dot-Product zwischen CLS-Embedding und Klassengewichten
        connection_strength = torch.dot(cls_embedding[:NEURON_LIMIT], class_weights).item()
        
        # Bias für diese Klasse
        class_bias = classifier_bias[class_idx].item()
        
        # Logit-Wert für diese Klasse
        class_logit = logits[class_idx].item()
        
        # Wahrscheinlichkeit für diese Klasse
        class_probability = probabilities[class_idx].item()
        
        cls_to_output_connections.append({
            "class_id": int(class_idx),
            "class_name": f"class_{class_idx}",  # Du kannst hier echte Klassennamen einsetzen
            "weights": class_weights.tolist(),    # Nur [30] statt [768]
            "bias": class_bias,
            "logit": class_logit,
            "probability": class_probability,
            "connection_strength": connection_strength
        })
    
    # Sortiere Verbindungen nach Wahrscheinlichkeit (höchste zuerst)
    cls_to_output_connections.sort(key=lambda x: x["probability"], reverse=True)
    
    print(f"✅ {len(cls_to_output_connections)} CLS-zu-Output-Verbindungen berechnet!")
    
    # --- VOCABULARY EXPORT (exact implementation from plan) ---
    print("🌍 Exportiere Vokabular-Karte und Nachbarn...")
    
    # Get sentence tokens (excluding special tokens)
    sentence_tokens = [t for t in tokens if t not in ["[CLS]", "[SEP]", "[PAD]", "[UNK]", "[MASK]"]]
    
    # Export vocabulary map and neighbors
    vocab_df, neighbors_payload, id2coord = export_vocab_map_and_neighbors(
        tokenizer, model, sentence_tokens, out_dir="."
    )
    
    # Finale Export-Struktur (Option 1: Eine Datei)
    print("📦 Erstelle Export-Struktur...")
    model_data = {
        "text": text,
        "tokens": tokens,
        "cls_embedding": cls_embedding[:NEURON_LIMIT].tolist(),  # Nur [30] statt [768]
        "token_embeddings": {
            "raw": {token: embedding[:NEURON_LIMIT].tolist() for token, embedding in zip(tokens, token_embeddings_raw)},  # Nur [30] statt [768]
            "2d": {token: {"x": float(x), "y": float(y)} for token, (x, y) in zip(tokens, token_embeddings_2d)}
        },
        "feedforward_layers": feedforward_layers,
        "attention_data": attention_data,
        "cls_to_output_connections": cls_to_output_connections,
        "classifier_info": {
            "num_classes": int(classifier_weight.shape[0]),
            "hidden_size": int(classifier_weight.shape[1]),
            "classifier_weight_shape": list(classifier_weight.shape),
            "classifier_bias_shape": list(classifier_bias.shape),
            "neuron_limit": NEURON_LIMIT,
            "note": f"Alle neuronalen Werte sind auf die ersten {NEURON_LIMIT} Neuronen reduziert"
        },
        "predictions": {
            "logits": logits.tolist(),
            "probabilities": probabilities.tolist(),
            "predicted_class": predicted_class,
            "confidence": float(probabilities[predicted_class].item())
        },
        "vocab_export": {
            "total_tokens": len(vocab_df),
            "sentence_tokens": sentence_tokens,
            "neighbors_by_token": neighbors_payload,
            "note": "Vocabulary export with neighbors. Use vocab_full_2d.csv for coordinates and vocab_id2coord.json for fast lookups."
        }
    }
    
    print("✅ Export-Struktur erstellt!")
    
    # Als JSON speichern
    print("💾 Speichere model_data.json...")
    try:
        with open("model_data.json", "w", encoding="utf-8") as f:
            json.dump(model_data, f, ensure_ascii=False, indent=2)
        print("✅ Export abgeschlossen!")
        print(f"📁 Datei gespeichert: model_data.json")
    except Exception as e:
        print(f"❌ Fehler beim Speichern der JSON-Datei: {e}")
        return
    
    print(f"📊 Anzahl Tokens: {len(tokens)}")
    print(f"🔗 Anzahl Output-Klassen: {len(cls_to_output_connections)}")
    print(f"📈 Anzahl Feed-Forward-Layer: {len(feedforward_layers)}")
    
    # Zusätzlich: CSV für einfache Visualisierung
    print("📊 Erstelle 2D-Koordinaten CSV...")
    try:
        df_2d = pd.DataFrame({
            "token": tokens,
            "x": [coord["x"] for coord in model_data["token_embeddings"]["2d"].values()],
            "y": [coord["y"] for coord in model_data["token_embeddings"]["2d"].values()]
        })
        
        df_2d.to_csv("token_embeddings_2d.csv", index=False)
        print(f"📊 2D-Koordinaten gespeichert: token_embeddings_2d.csv")
    except Exception as e:
        print(f"❌ Fehler beim Speichern der CSV-Datei: {e}")
    
    # Übersicht der Verbindungen
    print("\n🔗 Top 5 CLS-zu-Output-Verbindungen (nach Wahrscheinlichkeit):")
    for i, conn in enumerate(cls_to_output_connections[:5]):
        print(f"  {i+1}. {conn['class_name']}: Prob={conn['probability']:.3f}, Logit={conn['logit']:.3f}, Strength={conn['connection_strength']:.3f}")
    
    # Übersicht der Layer
    print(f"\n🏗️  Feed-Forward-Layer:")
    for layer in feedforward_layers:
        print(f"  - {layer['name']}")
        print(f"    Linear1: {layer['linear1']['weights'][0][:3]}... (30×30)")
        print(f"    Linear2: {layer['linear2']['weights'][0][:3]}... (30×30)")
    
    # Übersicht der Vokabular-Daten
    print(f"\n🌍 Vokabular-Export:")
    print(f"  - Globale Karte: {len(vocab_df)} Tokens")
    print(f"  - Satz-Tokens: {len(sentence_tokens)}")
    print(f"  - Nachbarn berechnet: {len(neighbors_payload)}")
    print(f"  - Dateien: vocab_full_2d.csv, neighbors_by_token.json, vocab_id2coord.json")
    
    print("\n🎉 Alle Daten erfolgreich exportiert!")
    print("\n📋 Export-Zusammenfassung:")
    print(f"  • Hauptdatei: model_data.json")
    print(f"  • 2D-Koordinaten: token_embeddings_2d.csv")
    print(f"  • Globale Vokabular-Karte: vocab_full_2d.csv")
    print(f"  • Nachbarn: neighbors_by_token.json")
    print(f"  • Lookup: vocab_id2coord.json")
    print(f"  • Eingabetext: {text}")
    print(f"  • Tokens: {len(tokens)}")
    print(f"  • Output-Klassen: {len(cls_to_output_connections)}")
    print(f"  • Feed-Forward-Layer: {len(feedforward_layers)}")
    print(f"  • Attention Heads: {attentions[0].shape[1]}")
    print(f"  • Vorhergesagte Klasse: {predicted_class}")
    print(f"  • Konfidenz: {probabilities[predicted_class].item():.3f}")
    print(f"  • Neuron-Limit: {NEURON_LIMIT} (Speicherplatz optimiert)")
    print(f"  • Globale Vokabular-Karte: {len(vocab_df)} Tokens")
    print(f"  • Nachbarn für {len(neighbors_payload)} Satz-Tokens")

if __name__ == "__main__":
    main() 