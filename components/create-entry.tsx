"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Camera, Hash, X, Plus, Save, FileText, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export function CreateEntry() {
  const [entryType, setEntryType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const entryTypes = [
    {
      value: "defi",
      label: "Base DeFi",
      icon: "💱",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      value: "nft",
      label: "Base NFT",
      icon: "🖼️",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      value: "event",
      label: "Base Event",
      icon: "🎪",
      gradient: "from-blue-300 to-blue-500",
    },
    {
      value: "learning",
      label: "Base Learning",
      icon: "📚",
      gradient: "from-blue-600 to-blue-800",
    },
    {
      value: "dao",
      label: "Base Governance",
      icon: "🏛️",
      gradient: "from-blue-700 to-blue-900",
    },
    {
      value: "reward",
      label: "Base Rewards",
      icon: "🎁",
      gradient: "from-blue-200 to-blue-400",
    },
    {
      value: "other",
      label: "Other Base Activity",
      icon: "✨",
      gradient: "from-blue-500 to-blue-600",
    },
  ];

  const popularTags = [
    "#FirstTime",
    "#Base",
    "#DeFi",
    "#NFT",
    "#Learning",
    "#Milestone",
    "#Event",
    "#Rewards",
    "#Governance",
    "#Web3",
  ];

  const addTag = (tag: string) => {
    const cleanTag = tag.startsWith("#") ? tag : `#${tag}`;
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.address) {
      alert("You must be logged in to create an entry.");
      return;
    }

    const payload = {
      baseUserId: user.address, // wallet address
      photo: photos.length > 0 ? photos[0] : null, // Using first photo or null
      journal: `${title}\n\n${description}`, // Combining title and description
      likes: 0,
      tags,
      privacy: isPublic ? "public" : "private",
    };

    try {
      const res = await fetch("/api/journal/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Something went wrong");
      }

      const data = await res.json();
      console.log("Journal created:", data);
      alert("Entry saved successfully!");

      // Reset form
      setEntryType("");
      setTitle("");
      setDescription("");
      setTags([]);
      setPhotos([]);
      setIsPublic(false);
    } catch (err: any) {
      console.error("Error creating journal:", err);
      alert(err.message || "Failed to save entry");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Create New Entry
          </h2>
        </div>
        <p className="text-blue-600 text-lg">Document your Base journey</p>
      </div>

      {/* Form Card */}
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl border border-blue-100">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl text-blue-900">
              New Base Journal Entry
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Entry Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-blue-800">
                Activity Type
              </Label>
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger className="h-12 border-2 border-blue-200 hover:border-blue-400 rounded-xl">
                  <SelectValue placeholder="What did you do on Base?" />
                </SelectTrigger>
                <SelectContent>
                  {entryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 bg-gradient-to-br ${type.gradient} rounded-lg flex items-center justify-center text-sm`}
                        >
                          {type.icon}
                        </div>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-blue-800">
                Title
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bought my first Base NFT"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-blue-800">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about your Base experience..."
                rows={4}
              />
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-blue-800">
                Photos
              </Label>
              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <UploadButton<OurFileRouter, "imageUploader">
                  endpoint="imageUploader"
                  onUploadBegin={() => {
                    setIsUploading(true);
                  }}
                  onClientUploadComplete={(res) => {
                    setIsUploading(false);
                    if (res && res.length > 0) {
                      const uploadedUrl = res[0].url;
                      setPhotos([...photos, uploadedUrl]);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setIsUploading(false);
                    alert(`Upload failed: ${error.message}`);
                  }}
                  className="ut-button:bg-blue-500 ut-button:hover:bg-blue-600 ut-button:text-white ut-button:rounded-lg ut-button:px-4 ut-button:py-2 ut-button:font-medium"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                Upload images to share with your Base community. Max file size: 4MB
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-blue-800">
                Tags
              </Label>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-2 px-3 py-1"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(newTag);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addTag(newTag)}
                  disabled={!newTag.trim()}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    disabled={tags.includes(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-blue-800">
                  Make this entry public
                </Label>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Entry
              </Button>
              <Button type="button" variant="outline">
                <FileText className="w-5 h-5 mr-2" />
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
