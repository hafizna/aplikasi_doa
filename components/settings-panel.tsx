"use client";

import { Minus, Moon, Plus, Sun, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useMunajatStore } from "@/lib/store/munajat-store";

export function SettingsPanel() {
  const settings = useMunajatStore((state) => state.settings);
  const updateSettings = useMunajatStore((state) => state.updateSettings);

  const updateFontSize = (delta: number) => {
    const nextSize = Math.min(40, Math.max(22, settings.arabicFontSize + delta));
    void updateSettings({ arabicFontSize: nextSize });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Preferensi bacaan</p>
          <p className="text-xs text-muted-foreground">Disimpan lokal di perangkat ini.</p>
        </div>
        <div className="flex rounded-md border">
          <Button
            variant={settings.theme === "light" ? "secondary" : "ghost"}
            size="icon"
            aria-label="Tema terang"
            onClick={() => void updateSettings({ theme: "light" })}
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant={settings.theme === "dark" ? "secondary" : "ghost"}
            size="icon"
            aria-label="Tema gelap"
            onClick={() => void updateSettings({ theme: "dark" })}
          >
            <Moon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Type className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Ukuran Arab</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Perkecil teks Arab" onClick={() => updateFontSize(-2)}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center text-sm tabular-nums">{settings.arabicFontSize}</span>
            <Button variant="outline" size="icon" aria-label="Perbesar teks Arab" onClick={() => updateFontSize(2)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <label className="flex items-center justify-between gap-4">
          <span className="text-sm">Tampilkan latin</span>
          <Switch
            checked={settings.showLatin}
            onCheckedChange={(checked) => void updateSettings({ showLatin: checked })}
          />
        </label>

        <label className="flex items-center justify-between gap-4">
          <span className="text-sm">Tampilkan terjemah</span>
          <Switch
            checked={settings.showTranslation}
            onCheckedChange={(checked) => void updateSettings({ showTranslation: checked })}
          />
        </label>
      </div>
    </Card>
  );
}
