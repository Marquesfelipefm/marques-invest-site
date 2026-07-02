#!/usr/bin/env python3
"""
ml_signal.py — Sinal Quantitativo (ML) para BTCUSDT H4
==========================================================
Gradient Boosting Classifier com validação walk-forward obrigatória.
Exporta signals.json para consumo pelo painel-performance.html

Dependências:
    pip install requests pandas numpy scikit-learn

Uso:
    python ml_signal.py

Agendamento (cron, a cada 4h nos fechamentos H4):
    0 0,4,8,12,16,20 * * * cd /caminho/do/projeto && python ml_signal.py
"""

import json
import time
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score

# ─── Configuração ──────────────────────────────────────────────────────────────
SYMBOL         = "BTCUSDT"
INTERVAL_H4    = "240"    # 4 horas em minutos
INTERVAL_H1    = "60"     # 1 hora em minutos
LIMIT          = 200      # máx por requisição Bybit v5
CANDLES_H4     = 4380     # ~2 anos de H4
CANDLES_H1     = 17520    # ~2 anos de H1
OUTPUT_FILE    = "signals.json"

# Threshold de neutralidade: se P(classe predita) entre 0.45 e 0.55 → NEUTRO
NEUTRAL_LOW    = 0.45
NEUTRAL_HIGH   = 0.55

# Walk-forward: tamanho de cada fold em candles H4 (~27 dias)
WF_FOLD_SIZE   = 160
WF_MIN_TRAIN   = WF_FOLD_SIZE * 3   # mínimo de histórico antes do primeiro fold

# ─── Bybit API ─────────────────────────────────────────────────────────────────
BYBIT_URL = "https://api.bybit.com/v5/market/kline"


def fetch_ohlcv(symbol: str, interval: str, target: int) -> pd.DataFrame:
    """Busca dados OHLCV da Bybit API v5, paginando até cobrir `target` candles."""
    all_rows: list = []
    end_time: int | None = None

    while len(all_rows) < target:
        params: dict = {
            "category": "linear",
            "symbol": symbol,
            "interval": interval,
            "limit": LIMIT,
        }
        if end_time is not None:
            params["end"] = end_time

        resp = requests.get(BYBIT_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        if data.get("retCode") != 0:
            raise RuntimeError(f"Bybit API erro: {data.get('retMsg')}")

        rows = data["result"]["list"]
        if not rows:
            break

        all_rows.extend(rows)
        # Bybit retorna do mais recente ao mais antigo — continua paginando
        end_time = int(rows[-1][0]) - 1
        time.sleep(0.25)   # gentil com o rate-limit

    # Colunas Bybit v5: [startTime, open, high, low, close, volume, turnover]
    df = pd.DataFrame(
        all_rows,
        columns=["ts", "open", "high", "low", "close", "volume", "turnover"],
    )
    df = df.astype({
        "ts": int, "open": float, "high": float,
        "low": float, "close": float, "volume": float,
    })
    df["ts"] = pd.to_datetime(df["ts"], unit="ms", utc=True)
    df = df.sort_values("ts").reset_index(drop=True)
    return df.tail(target).reset_index(drop=True)


# ─── Indicadores auxiliares ────────────────────────────────────────────────────
def _rsi(series: pd.Series, window: int = 14) -> pd.Series:
    delta = series.diff()
    gain  = delta.clip(lower=0)
    loss  = -delta.clip(upper=0)
    ag    = gain.ewm(alpha=1 / window, min_periods=window, adjust=False).mean()
    al    = loss.ewm(alpha=1 / window, min_periods=window, adjust=False).mean()
    rs    = ag / al.replace(0, np.nan)
    return 100 - 100 / (1 + rs)


def _atr(df: pd.DataFrame, window: int = 14) -> pd.Series:
    tr = pd.concat([
        df["high"] - df["low"],
        (df["high"] - df["close"].shift()).abs(),
        (df["low"]  - df["close"].shift()).abs(),
    ], axis=1).max(axis=1)
    return tr.ewm(alpha=1 / window, min_periods=window, adjust=False).mean()


# ─── Feature Engineering ───────────────────────────────────────────────────────
def build_features(h4: pd.DataFrame, h1: pd.DataFrame) -> pd.DataFrame:
    """
    Constrói as 13 features sobre os candles H4, usando H1 para confirmação MTF.
    NUNCA utiliza dados do futuro — target = direção do candle SEGUINTE.
    """
    df = h4.copy()

    # EMAs H4 (usadas internamente e como features)
    df["ema21_h4"] = df["close"].ewm(span=21, adjust=False).mean()
    df["ema50_h4"] = df["close"].ewm(span=50, adjust=False).mean()

    # Features 1-2: distância % do preço às EMAs
    df["f_ema21_dist"]  = (df["close"] - df["ema21_h4"]) / df["ema21_h4"] * 100
    df["f_ema50_dist"]  = (df["close"] - df["ema50_h4"]) / df["ema50_h4"] * 100

    # Feature 3: RSI 14
    df["f_rsi14"]       = _rsi(df["close"], 14)

    # Feature 4: ATR 14 normalizado (%)
    df["f_atr14_norm"]  = _atr(df, 14) / df["close"] * 100

    # Features 5-7: retornos defasados
    df["f_ret_lag1"]    = df["close"].pct_change(1)
    df["f_ret_lag3"]    = df["close"].pct_change(3)
    df["f_ret_lag6"]    = df["close"].pct_change(6)

    # Feature 8: volume relativo (vs média 20 períodos)
    df["f_vol_rel"]     = df["volume"] / df["volume"].rolling(20).mean()

    # Feature 9: amplitude do candle (%)
    df["f_candle_amp"]  = (df["high"] - df["low"]) / df["open"] * 100

    # Feature 10: posição do fechamento no range (0 = mínima, 1 = máxima)
    hl = df["high"] - df["low"]
    df["f_close_pos"]   = np.where(hl > 0, (df["close"] - df["low"]) / hl, 0.5)

    # Feature 11: diferença EMA21 vs EMA50 normalizada (momentum)
    df["f_ema_spread"]  = (df["ema21_h4"] - df["ema50_h4"]) / df["ema50_h4"] * 100

    # Feature 12: variação de volume (lag 1)
    df["f_vol_chg"]     = df["volume"].pct_change(1)

    # Feature 13: confirmação multi-timeframe (H4 + H1 alinhados)
    h1c = h1.copy()
    h1c["ema21_h1"] = h1c["close"].ewm(span=21, adjust=False).mean()
    h1c["ema50_h1"] = h1c["close"].ewm(span=50, adjust=False).mean()
    h1c["h1_bull"]  = (h1c["ema21_h1"] > h1c["ema50_h1"]).astype(int)

    # merge_asof: para cada candle H4, pega o valor H1 mais recente
    df_sorted  = df.sort_values("ts")
    h1_sorted  = h1c.sort_values("ts")[["ts", "h1_bull"]]
    merged     = pd.merge_asof(df_sorted, h1_sorted, on="ts", direction="backward")
    merged["h4_bull"]   = (merged["ema21_h4"] > merged["ema50_h4"]).astype(int)
    # Alinhamento: H4 e H1 com a mesma direção (ambos bull ou ambos bear)
    merged["f_mtf_align"] = (merged["h4_bull"] == merged["h1_bull"]).astype(int)
    df = merged.sort_values("ts").reset_index(drop=True)

    # Target: próximo candle H4 fecha acima? (1 = sim, 0 = não)
    df["target"] = (df["close"].shift(-1) > df["close"]).astype(int)

    feat_cols = [c for c in df.columns if c.startswith("f_")]
    result = df[["ts", "ema21_h4", "ema50_h4", "h4_bull"] + feat_cols + ["target"]]
    return result.dropna().reset_index(drop=True)


# ─── Walk-Forward Cross-Validation ────────────────────────────────────────────
def walk_forward_cv(X: np.ndarray, y: np.ndarray) -> list[dict]:
    """
    Validação walk-forward com janela EXPANSIVA.
    NUNCA embaralha os dados — respeita a ordem temporal rigorosamente.
    """
    results = []
    start = WF_MIN_TRAIN

    while start + WF_FOLD_SIZE <= len(X):
        X_tr, y_tr = X[:start],               y[:start]
        X_te, y_te = X[start:start + WF_FOLD_SIZE], y[start:start + WF_FOLD_SIZE]

        clf = GradientBoostingClassifier(
            n_estimators=200, max_depth=3,
            learning_rate=0.05, subsample=0.8,
            random_state=42,
        )
        clf.fit(X_tr, y_tr)
        y_pred = clf.predict(X_te)

        baseline = float(max(y_te.mean(), 1 - y_te.mean()))

        results.append({
            "fold":           len(results) + 1,
            "train_size":     int(start),
            "accuracy":       round(float(accuracy_score(y_te, y_pred)), 4),
            "baseline":       round(baseline, 4),
            "precision_long": round(float(precision_score(y_te, y_pred, zero_division=0)), 4),
            "recall_long":    round(float(recall_score(y_te, y_pred, zero_division=0)), 4),
            "precision_short":round(float(precision_score(y_te, y_pred, pos_label=0, zero_division=0)), 4),
            "recall_short":   round(float(recall_score(y_te, y_pred, pos_label=0, zero_division=0)), 4),
        })
        start += WF_FOLD_SIZE

    return results


def _avg(results: list[dict], key: str) -> float:
    return round(float(np.mean([r[key] for r in results])), 4)


# ─── Detecção de Regime ────────────────────────────────────────────────────────
def detect_regime(df_feat: pd.DataFrame) -> dict:
    last = df_feat.iloc[-1]
    mtf_aligned  = int(last.get("f_mtf_align", 0)) == 1
    h4_bull      = int(last.get("h4_bull", 0)) == 1
    atr_norm     = float(last.get("f_atr14_norm", 0))
    high_vol     = atr_norm > 1.5   # threshold empírico para H4 BTCUSDT

    if mtf_aligned and h4_bull:
        label  = "Tendência"
        detail = f"EMA21 > EMA50 em H4 e H1 — alta confirmada {'(volatilidade elevada)' if high_vol else ''}"
    elif mtf_aligned and not h4_bull:
        label  = "Tendência"
        detail = f"EMA21 < EMA50 em H4 e H1 — queda confirmada {'(volatilidade elevada)' if high_vol else ''}"
    else:
        label  = "Lateralização"
        detail = "H4 e H1 desalinhados — mercado sem direção definida"

    return {"regime": label, "detail": detail.strip()}


# ─── Main ──────────────────────────────────────────────────────────────────────
def main() -> None:
    print("=" * 60)
    print("  Sinal Quantitativo ML — BTCUSDT H4")
    print("=" * 60)

    print("\n[1/5] Buscando OHLCV H4...")
    h4 = fetch_ohlcv(SYMBOL, INTERVAL_H4, CANDLES_H4)
    print(f"      {len(h4)} candles H4 carregados.")

    print("[2/5] Buscando OHLCV H1...")
    h1 = fetch_ohlcv(SYMBOL, INTERVAL_H1, CANDLES_H1)
    print(f"      {len(h1)} candles H1 carregados.")

    print("[3/5] Calculando 13 features...")
    df_feat   = build_features(h4, h1)
    feat_cols = [c for c in df_feat.columns if c.startswith("f_")]
    X = df_feat[feat_cols].values
    y = df_feat["target"].values
    print(f"      {len(df_feat)} candles com features completas | {len(feat_cols)} features.")

    print(f"[4/5] Walk-forward CV (fold={WF_FOLD_SIZE} candles)...")
    wf = walk_forward_cv(X, y)
    oos_acc     = _avg(wf, "accuracy")
    baseline    = _avg(wf, "baseline")
    prec_long   = _avg(wf, "precision_long")
    rec_long    = _avg(wf, "recall_long")
    prec_short  = _avg(wf, "precision_short")
    rec_short   = _avg(wf, "recall_short")
    beats       = oos_acc > baseline
    verdict     = "✅ Supera baseline" if beats else "⚠️  NÃO supera baseline"
    print(f"      Folds: {len(wf)} | OOS accuracy: {oos_acc:.3f} | Baseline: {baseline:.3f} | {verdict}")

    print("[5/5] Treinando modelo final + gerando sinal...")
    # Treina em tudo exceto o último candle (cujo target = próxima vela, ainda não fechou)
    clf_final = GradientBoostingClassifier(
        n_estimators=200, max_depth=3,
        learning_rate=0.05, subsample=0.8,
        random_state=42,
    )
    clf_final.fit(X[:-1], y[:-1])

    # Prediz o próximo candle H4
    prob    = clf_final.predict_proba(X[-1].reshape(1, -1))[0]
    p_long  = float(prob[1])   # P(alta)
    p_short = float(prob[0])   # P(queda)

    if p_long > NEUTRAL_HIGH:
        signal   = "LONG"
        sig_prob = p_long
    elif p_short > NEUTRAL_HIGH:
        signal   = "SHORT"
        sig_prob = p_short
    else:
        signal   = "NEUTRO"
        sig_prob = max(p_long, p_short)

    last_ts    = h4["ts"].iloc[-1]
    next_close = last_ts + pd.Timedelta(hours=4)
    regime     = detect_regime(df_feat)

    payload = {
        "signal":            signal,
        "probability":       round(sig_prob, 4),
        "p_long":            round(p_long, 4),
        "p_short":           round(p_short, 4),
        "regime":            regime["regime"],
        "regime_detail":     regime["detail"],
        "oos_accuracy":      oos_acc,
        "baseline_accuracy": baseline,
        "beats_baseline":    beats,
        "precision_long":    prec_long,
        "recall_long":       rec_long,
        "precision_short":   prec_short,
        "recall_short":      rec_short,
        "folds":             len(wf),
        "candles_trained":   int(len(X) - 1),
        "features_used":     len(feat_cols),
        "model_version":     "GBClassifier-v1.0",
        "symbol":            SYMBOL,
        "timeframe":         "H4",
        "updated_at":        datetime.now(timezone.utc).isoformat(),
        "next_candle_closes":next_close.isoformat(),
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print(f"  ✅ signals.json exportado com sucesso!")
    print(f"  Sinal    : {signal}  ({sig_prob:.1%})")
    print(f"  P(LONG)  : {p_long:.1%}  |  P(SHORT): {p_short:.1%}")
    print(f"  Regime   : {regime['regime']} — {regime['detail']}")
    print(f"  Próx. H4 : {next_close.strftime('%d/%m/%Y %H:%M UTC')}")
    print(f"  OOS Acc  : {oos_acc:.3f} vs Baseline {baseline:.3f}  →  {verdict}")
    print("=" * 60)


if __name__ == "__main__":
    main()
