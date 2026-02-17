"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast-context";
import { ToolCard } from "./tool-card";
import { DollarSign, ArrowRightLeft, Loader2 } from "lucide-react";

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "INR", name: "Indian Rupee" },
  { code: "BRL", name: "Brazilian Real" },
];

export function CurrencyConverter() {
  const toast = useToast();
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (from === to) {
      setResult(num);
      setRate(1);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${num}&from=${from}&to=${to}`
      );
      const data = await res.json();
      if (data.message) throw new Error(data.message);
      setResult(data.rates[to]);
      setRate(data.rates[to] / num);
      toast.success("Converted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setResult(null);
      toast.error("Conversion failed", "Check your connection or try again");
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
    setRate(null);
    setError(null);
  };

  return (
    <ToolCard title="Currency Converter" icon={DollarSign}>
      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Amount</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-sm h-9"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 items-end">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">From</label>
            <select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setResult(null);
                setRate(null);
              }}
              className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center pb-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={swap}
              aria-label="Swap currencies"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">To</label>
            <select
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setResult(null);
                setRate(null);
              }}
              className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="w-full h-9 bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          onClick={convert}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Convert"
          )}
        </Button>

        {result !== null && !error && (
          <div className="rounded border border-zinc-600 bg-zinc-800 p-3 space-y-1">
            <p className="text-lg font-medium">
              {result.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {to}
            </p>
            {rate && rate !== 1 && (
              <p className="text-xs text-zinc-500">
                1 {from} = {rate.toFixed(4)} {to}
              </p>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
    </ToolCard>
  );
}
