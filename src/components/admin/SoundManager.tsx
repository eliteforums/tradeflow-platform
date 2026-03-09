import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Music,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SoundForm {
  title: string;
  artist: string;
  category: string;
  description: string;
  duration_sec: string;
  cover_emoji: string;
  file_url: string;
}

const EMPTY_FORM: SoundForm = {
  title: "",
  artist: "",
  category: "meditation",
  description: "",
  duration_sec: "",
  cover_emoji: "🎵",
  file_url: "",
};

const CATEGORIES = ["meditation", "relaxation", "focus", "sleep", "nature", "ambient"];

export default function SoundManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SoundForm>(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: sounds = [], isLoading } = useQuery({
    queryKey: ["admin-sounds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sound_content")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        artist: form.artist || null,
        category: form.category,
        description: form.description || null,
        duration_sec: form.duration_sec ? parseInt(form.duration_sec) : null,
        cover_emoji: form.cover_emoji || null,
        file_url: form.file_url || null,
        is_active: true,
      };

      if (editingId) {
        const { error } = await supabase
          .from("sound_content")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sound_content")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sounds"] });
      queryClient.invalidateQueries({ queryKey: ["sound-content"] });
      toast.success(editingId ? "Sound updated!" : "Sound added!");
      resetForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sound_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sounds"] });
      queryClient.invalidateQueries({ queryKey: ["sound-content"] });
      toast.success("Sound deleted!");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (sound: any) => {
    setForm({
      title: sound.title,
      artist: sound.artist || "",
      category: sound.category,
      description: sound.description || "",
      duration_sec: sound.duration_sec?.toString() || "",
      cover_emoji: sound.cover_emoji || "🎵",
      file_url: sound.file_url || "",
    });
    setEditingId(sound.id);
    setShowForm(true);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Sound Therapy Library ({sounds.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Sound
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">
                {editingId ? "Edit Sound" : "Add New Sound"}
              </p>
              <Button variant="ghost" size="icon" onClick={resetForm} className="h-7 w-7">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
              <Input
                placeholder="Artist"
                value={form.artist}
                onChange={(e) => setForm((p) => ({ ...p, artist: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Duration (sec)"
                type="number"
                value={form.duration_sec}
                onChange={(e) => setForm((p) => ({ ...p, duration_sec: e.target.value }))}
              />
              <Input
                placeholder="Emoji 🎵"
                value={form.cover_emoji}
                onChange={(e) => setForm((p) => ({ ...p, cover_emoji: e.target.value }))}
              />
            </div>

            <Input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <Input
              placeholder="Audio URL (optional)"
              value={form.file_url}
              onChange={(e) => setForm((p) => ({ ...p, file_url: e.target.value }))}
            />

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.title || saveMutation.isPending}
              className="w-full gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingId ? "Update Sound" : "Add Sound"}
            </Button>
          </div>
        )}

        {/* Sound List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : sounds.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No sounds added yet. Click "Add Sound" to get started.
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {sounds.map((sound: any) => (
              <div
                key={sound.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0">{sound.cover_emoji || "🎵"}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{sound.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {sound.category} · {sound.artist || "Unknown"} ·{" "}
                      {sound.duration_sec ? `${Math.floor(sound.duration_sec / 60)}:${(sound.duration_sec % 60).toString().padStart(2, "0")}` : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    sound.is_active
                      ? "bg-eternia-success/10 text-eternia-success"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {sound.is_active ? "Active" : "Inactive"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => startEdit(sound)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(sound.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
