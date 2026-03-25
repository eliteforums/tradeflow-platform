import { useState, useRef } from "react";
import { Camera, Upload, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PRESET_AVATARS = [
  "🦊", "🐱", "🐶", "🦁", "🐼", "🐨",
  "🦄", "🐸", "🦋", "🌸", "🌊", "⭐",
];

interface AvatarUploadProps {
  size?: "sm" | "lg";
  /** For institution logos — pass institution id + current logo url */
  institutionId?: string;
  institutionLogoUrl?: string | null;
  onLogoUpdated?: (url: string) => void;
}

const AvatarUpload = ({ size = "lg", institutionId, institutionLogoUrl, onLogoUpdated }: AvatarUploadProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isInstitution = !!institutionId;
  const currentUrl = isInstitution ? institutionLogoUrl : profile?.avatar_url;
  const isStudent = profile?.role === "student";

  // Students cannot upload
  if (!isInstitution && isStudent) {
    return (
      <div className={`${size === "lg" ? "w-20 h-20" : "w-14 h-14"} rounded-2xl bg-gradient-eternia flex items-center justify-center shrink-0`}>
        {currentUrl ? (
          <img src={currentUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
        ) : (
          <User className={`${size === "lg" ? "w-10 h-10" : "w-7 h-7"} text-background`} />
        )}
      </div>
    );
  }

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

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
        const { error } = await supabase
          .from("institutions")
          .update({ logo_url: publicUrl } as any)
          .eq("id", institutionId);
        if (error) throw error;
        onLogoUpdated?.(publicUrl);
      } else {
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl })
          .eq("id", user.id);
        if (error) throw error;
        await refreshProfile();
      }

      toast.success(isInstitution ? "Logo updated" : "Avatar updated");
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePresetSelect = async (emoji: string) => {
    if (!user) return;
    setUploading(true);
    try {
      // Store emoji as avatar_url with emoji: prefix
      const emojiUrl = `emoji:${emoji}`;
      if (isInstitution) {
        const { error } = await supabase
          .from("institutions")
          .update({ logo_url: emojiUrl } as any)
          .eq("id", institutionId);
        if (error) throw error;
        onLogoUpdated?.(emojiUrl);
      } else {
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: emojiUrl })
          .eq("id", user.id);
        if (error) throw error;
        await refreshProfile();
      }
      toast.success("Avatar updated");
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const renderAvatar = () => {
    const sizeClass = size === "lg" ? "w-20 h-20" : "w-14 h-14";
    const iconSize = size === "lg" ? "w-10 h-10" : "w-7 h-7";

    if (currentUrl?.startsWith("emoji:")) {
      return (
        <div className={`${sizeClass} rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 text-3xl`}>
          {currentUrl.replace("emoji:", "")}
        </div>
      );
    }

    if (currentUrl) {
      return (
        <div className={`${sizeClass} rounded-2xl overflow-hidden shrink-0`}>
          <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover" />
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

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1 text-xs">Upload</TabsTrigger>
              {!isInstitution && (
                <TabsTrigger value="preset" className="flex-1 text-xs">Presets</TabsTrigger>
              )}
            </TabsList>

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

            {!isInstitution && (
              <TabsContent value="preset" className="pt-2">
                <p className="text-xs text-muted-foreground mb-3">Pick an avatar</p>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handlePresetSelect(emoji)}
                      disabled={uploading}
                      className="w-full aspect-square rounded-xl bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 transition-colors flex items-center justify-center text-2xl disabled:opacity-50"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarUpload;
