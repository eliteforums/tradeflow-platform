import { useState, useRef, useMemo } from "react";
import { Camera, Upload, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/collection/lib/lorelei/index.js";
import * as bottts from "@dicebear/collection/lib/bottts/index.js";
import * as avataaars from "@dicebear/collection/lib/avataaars/index.js";
import * as funEmoji from "@dicebear/collection/lib/fun-emoji/index.js";
import * as notionists from "@dicebear/collection/lib/notionists/index.js";

const STYLES: Record<string, any> = {
  lorelei,
  bottts,
  avataaars,
  funEmoji,
  notionists,
};

const STYLE_LABELS: Record<string, string> = {
  lorelei: "Lorelei",
  bottts: "Robots",
  avataaars: "Avataaars",
  funEmoji: "Fun Emoji",
  notionists: "Notionists",
};

const SEEDS = Array.from({ length: 12 }, (_, i) => `seed-${i + 1}`);

/** Generate a DiceBear avatar data URI */
export const getDiceBearUri = (styleName: string, seed: string): string => {
  const style = STYLES[styleName];
  if (!style) return "";
  return createAvatar(style, { seed, size: 128 }).toDataUri();
};

/** Resolve any avatar_url value to a renderable src */
export const resolveAvatarUrl = (url: string | null | undefined, fallbackSeed?: string): string | null => {
  if (!url && fallbackSeed) {
    return getDiceBearUri("bottts", fallbackSeed);
  }
  if (!url) return null;
  if (url.startsWith("dicebear:")) {
    const [, style, seed] = url.split(":");
    return getDiceBearUri(style, seed);
  }
  if (url.startsWith("emoji:")) return null; // legacy, treat as no avatar
  return url;
};

interface AvatarUploadProps {
  size?: "sm" | "lg";
  institutionId?: string;
  institutionLogoUrl?: string | null;
  onLogoUpdated?: (url: string) => void;
}

const AvatarUpload = ({ size = "lg", institutionId, institutionLogoUrl, onLogoUpdated }: AvatarUploadProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("lorelei");
  const fileRef = useRef<HTMLInputElement>(null);

  const isInstitution = !!institutionId;
  const currentUrl = isInstitution ? institutionLogoUrl : profile?.avatar_url;
  const isStudent = profile?.role === "student";

  const avatarGrid = useMemo(
    () => SEEDS.map((seed) => ({ seed, uri: getDiceBearUri(selectedStyle, seed) })),
    [selectedStyle]
  );

  // Students get a static deterministic avatar
  if (!isInstitution && isStudent) {
    const src = resolveAvatarUrl(currentUrl, user?.id);
    const sizeClass = size === "lg" ? "w-20 h-20" : "w-14 h-14";
    return (
      <div className={`${sizeClass} rounded-2xl overflow-hidden shrink-0 bg-muted/50`}>
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className={`${sizeClass} bg-gradient-eternia flex items-center justify-center`}>
            <User className={`${size === "lg" ? "w-10 h-10" : "w-7 h-7"} text-background`} />
          </div>
        )}
      </div>
    );
  }

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }

    setUploading(true);
    try {
      const folder = isInstitution ? `institutions/${institutionId}` : user.id;
      const filename = isInstitution ? "logo" : "avatar";
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${filename}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      if (isInstitution) {
        const { error } = await supabase.from("institutions").update({ logo_url: publicUrl } as any).eq("id", institutionId);
        if (error) throw error;
        onLogoUpdated?.(publicUrl);
      } else {
        const { error } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
        if (error) throw error;
        await refreshProfile();
      }
      toast.success(isInstitution ? "Logo updated" : "Avatar updated");
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const handleDiceBearSelect = async (seed: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const avatarUrl = `dicebear:${selectedStyle}:${seed}`;
      if (isInstitution) {
        const { error } = await supabase.from("institutions").update({ logo_url: avatarUrl } as any).eq("id", institutionId);
        if (error) throw error;
        onLogoUpdated?.(avatarUrl);
      } else {
        const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
        if (error) throw error;
        await refreshProfile();
      }
      toast.success("Avatar updated");
      setOpen(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };

  const renderAvatar = () => {
    const sizeClass = size === "lg" ? "w-20 h-20" : "w-14 h-14";
    const iconSize = size === "lg" ? "w-10 h-10" : "w-7 h-7";
    const src = resolveAvatarUrl(currentUrl, user?.id);

    if (src) {
      return (
        <div className={`${sizeClass} rounded-2xl overflow-hidden shrink-0`}>
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      );
    }

    return (
      <div className={`${sizeClass} rounded-2xl bg-gradient-eternia flex items-center justify-center shrink-0`}>
        <User className={`${iconSize} text-background`} />
      </div>
    );
  };

  return (
    <>
      <div className="relative group cursor-pointer" onClick={() => setOpen(true)}>
        {renderAvatar()}
        <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isInstitution ? "Update Logo" : "Update Avatar"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="preset" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="preset" className="flex-1 text-xs">Avatars</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 text-xs">Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="preset" className="space-y-3 pt-2">
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="h-9 text-xs bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STYLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-4 gap-2">
                {avatarGrid.map(({ seed, uri }) => (
                  <button
                    key={seed}
                    onClick={() => handleDiceBearSelect(seed)}
                    disabled={uploading}
                    className="w-full aspect-square rounded-xl bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 transition-colors overflow-hidden disabled:opacity-50 p-1"
                  >
                    <img src={uri} alt={seed} className="w-full h-full" />
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">Upload an image (max 2MB, JPG/PNG/WebP)</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <Button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                variant="outline"
                className="w-full gap-2 h-10"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Choose Image"}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarUpload;
