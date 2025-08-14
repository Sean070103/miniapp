"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
<<<<<<< HEAD
import { Save, Edit3, Info, Hash, Camera, X, Loader2, AlertCircle, Image as ImageIcon, Check } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
=======
import { Save, Edit3, Info, Hash } from "lucide-react";
import { useAuth } from "@/contexts/auth-context" // adjust path
>>>>>>> 28bd1d750aae7f6de9743e2c163f1c535058d95c

interface Journal {
  id?: string;
  baseUserId: string;
  journal: string;
  tags: string[];
  photos?: string[]; // Changed from photo?: string | null
  likes?: number;
  privacy?: string;
  createdAt?: Date;
}

interface DailyEntryProps {
  userId: string;
  onSave?: (entry: Journal) => void;
  todayEntry?: Journal;
}

export function DailyEntry({ userId, onSave, todayEntry }: DailyEntryProps) {
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(!todayEntry);
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  const { user } = useAuth();
  

  const articleTypeTags = [
    { type: "DeFi", icon: "💱", color: "from-blue-400 to-blue-600" },
    { type: "NFT", icon: "🖼️", color: "from-blue-500 to-blue-700" },
    { type: "Event", icon: "🎪", color: "from-blue-300 to-blue-500" },
    { type: "Learning", icon: "📚", color: "from-blue-600 to-blue-800" },
    { type: "Governance", icon: "🏛️", color: "from-blue-700 to-blue-900" },
    { type: "Rewards", icon: "🎁", color: "from-blue-200 to-blue-400" },
    { type: "Other", icon: "✨", color: "from-blue-500 to-blue-600" },
  ];

  const suggestedTags = [
    "Base",
    "FirstTime",
    "Milestone",
    "Trading",
    "Building",
    "Community",
    "Web3",
  ];

  const handlePostClick = () => {
    if (!content.trim()) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmPost = async () => {
    setShowConfirmDialog(false);
    await handleSave();
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    if (!user) {
      throw new Error("User not logged in");
    }
    const journalData: Journal = {
      baseUserId: user.address,
      journal: content.trim(),
      tags,
      photos, // Save all photos instead of just the first one
      likes: 0,
      privacy: "public",
    };

    console.log("Saving journal with photos:", photos); // Debug log
    console.log("Full journal data:", journalData); // Debug log

    try {
      const response = await fetch("/api/journal/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journalData),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to save journal");
      }

      const data = await response.json();
      console.log("Response from server:", data); // Debug log
      console.log("Photos in response:", data.photos); // Debug log

      if (onSave) {
        onSave(data);
      }

      setIsPosted(true);
      setSuccess(true);
      
      // Show success animation instead of refreshing page
      setTimeout(() => {
        setSuccess(false);
        setIsPosted(false);
        // Reset form for new post
        setContent("");
        setTags([]);
        setPhotos([]);
        setError(null);
        setImageLoadErrors(new Set());
        // Switch to view mode to show the posted content
        setIsEditing(false);
      }, 5000); // Increased to 5 seconds to see the posted content

    } catch (err) {
      console.error("Error saving journal:", err);
      setError(err instanceof Error ? err.message : "Failed to save journal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    // Remove from error set if it was there
    const newErrors = new Set(imageLoadErrors);
    newErrors.delete(index);
    setImageLoadErrors(newErrors);
  };

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
  };

  const resetForm = () => {
    setContent("");
    setTags([]);
    setPhotos([]);
    setError(null);
    setSuccess(false);
    setIsPosted(false);
    setIsEditing(true);
    setImageLoadErrors(new Set());
  };

  // Image component with error handling
  const ImageWithFallback = ({ src, alt, className, index }: { src: string; alt: string; className: string; index?: number }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Reset states when src changes
    React.useEffect(() => {
      setIsLoading(true);
      setHasError(false);
    }, [src]);

    if (hasError || (index !== undefined && imageLoadErrors.has(index))) {
      return (
        <div className={`${className} bg-slate-600 flex items-center justify-center`}>
          <div className="text-center text-slate-400">
            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
            <span className="text-xs">Image failed to load</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {isLoading && (
          <div className={`${className} bg-slate-600 flex items-center justify-center absolute inset-0 z-10`}>
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
            if (index !== undefined) {
              handleImageError(index);
            }
          }}
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>
    );
  };

  if (!isEditing && todayEntry) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
          {todayEntry.photos && todayEntry.photos.length > 0 && (
            <div className="mb-4">
              <div className={`grid gap-1 rounded-xl overflow-hidden ${
                todayEntry.photos.length === 1 ? 'grid-cols-1' :
                todayEntry.photos.length === 2 ? 'grid-cols-2' :
                todayEntry.photos.length === 3 ? 'grid-cols-2' :
                'grid-cols-2'
              }`}>
                {todayEntry.photos.map((photo, index) => (
                  <div key={index} className={`relative ${
                    todayEntry.photos!.length === 3 && index === 2 ? 'col-span-2' : ''
                  }`}>
                    <div className="w-full h-full bg-slate-600">
                      <ImageWithFallback
                        src={photo}
                        alt={`Post image ${index + 1}`}
                        className={`w-full h-full object-cover ${
                          todayEntry.photos!.length === 1 ? 'max-h-96' :
                          todayEntry.photos!.length === 2 ? 'h-48' :
                          todayEntry.photos!.length === 3 && index === 2 ? 'h-48' : 'h-48'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-white text-lg leading-relaxed pixelated-text">
            {todayEntry.journal}
          </p>
          {todayEntry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {todayEntry.tags.map((tag, index) => (
                <Badge
                  key={index}
                  className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {todayEntry.createdAt && (
            <p className="text-slate-400 text-sm mt-4">
              Posted on {new Date(todayEntry.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="bg-slate-700 border-slate-600 text-white pixelated-text"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Entry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in your Web3 world today?"
          className="min-h-[120px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 pixelated-text"
        />

        {/* Photo Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-blue-300 text-sm pixelated-text">
            <Camera className="w-4 h-4" />
            <span>Add Photos</span>
          </div>
          
          {/* Photo Preview */}
          {photos.length > 0 && (
            <div className={`grid gap-1 rounded-xl overflow-hidden ${
              photos.length === 1 ? 'grid-cols-1' :
              photos.length === 2 ? 'grid-cols-2' :
              photos.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {photos.map((photo, index) => (
                <div key={index} className={`relative group ${
                  photos.length === 3 && index === 2 ? 'col-span-2' : ''
                }`}>
                  <div className="w-full h-full bg-slate-600">
                    <ImageWithFallback
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className={`w-full h-full object-cover ${
                        photos.length === 1 ? 'max-h-96' :
                        photos.length === 2 ? 'h-48' :
                        photos.length === 3 && index === 2 ? 'h-48' : 'h-48'
                      }`}
                      index={index}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-black/50 hover:bg-black/70 rounded-full"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center gap-3">
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
              className="ut-button:bg-blue-500 ut-button:hover:bg-blue-600 ut-button:text-white ut-button:rounded-lg ut-button:px-3 ut-button:py-2 ut-button:text-sm ut-button:font-medium"
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
          
          <p className="text-slate-400 text-xs pixelated-text">
            Upload images to share with your Base community. Max file size: 4MB
          </p>
        </div>

        {/* Article Type Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-300 text-sm pixelated-text">
            <Info className="w-4 h-4" />
            <span>Article Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {articleTypeTags.map((tag) => (
              <Button
                key={tag.type}
                variant={tags.includes(tag.type) ? "default" : "outline"}
                size="sm"
                onClick={() => addTag(tag.type)}
                className={`pixelated-text ${
                  tags.includes(tag.type)
                    ? "bg-gradient-to-r " + tag.color + " text-white border-0"
                    : "bg-slate-700/50 border-slate-600 text-white"
                }`}
              >
                {tag.icon} {tag.type}
              </Button>
            ))}
          </div>
        </div>

        {/* Suggested Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-300 text-sm pixelated-text">
            <Hash className="w-4 h-4" />
            <span>Suggested Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <Button
                key={tag}
                variant={tags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => addTag(tag)}
                className={`pixelated-text ${
                  tags.includes(tag)
                    ? "bg-blue-500 text-white border-0"
                    : "bg-slate-700/50 border-slate-600 text-white"
                }`}
              >
                #{tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Tags */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <div className="text-blue-300 text-sm pixelated-text">
              Selected Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-blue-500/20 text-blue-300 border-blue-400/30 cursor-pointer pixelated-text hover:bg-blue-500/30"
                  onClick={() => removeTag(tag)}
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                  <span className="ml-1 text-blue-200">×</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 items-center">
        {error && (
          <div className="text-red-400 text-sm mr-2 pixelated-text">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-400 text-sm mr-2 pixelated-text flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <span>Post created successfully!</span>
          </div>
        )}
        <Button
          onClick={handlePostClick}
          disabled={!content.trim() || isSubmitting || isPosted}
          className={`pixelated-text ${
            isPosted 
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white" 
              : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : isPosted ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Posted Successfully!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Post Entry
            </>
          )}
        </Button>
      </div>

      {/* Facebook-style Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-300">
              <AlertCircle className="w-5 h-5" />
              Confirm Post
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Are you sure you want to publish this post to your Base community?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {/* Preview of the post */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <p className="text-white text-sm leading-relaxed">
                {content.length > 100 ? `${content.substring(0, 100)}...` : content}
              </p>
              {photos.length > 0 && (
                <div className="mt-3">
                  <div className={`grid gap-1 rounded-lg overflow-hidden ${
                    photos.length === 1 ? 'grid-cols-1' :
                    photos.length === 2 ? 'grid-cols-2' :
                    photos.length === 3 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {photos.slice(0, 4).map((photo, index) => (
                      <div key={index} className={`relative ${
                        photos.length === 3 && index === 2 ? 'col-span-2' : ''
                      }`}>
                        <div className="w-full h-full bg-slate-600">
                          <ImageWithFallback
                            src={photo}
                            alt={`Preview ${index + 1}`}
                            className={`w-full h-full object-cover ${
                              photos.length === 1 ? 'max-h-32' :
                              photos.length === 2 ? 'h-24' :
                              photos.length === 3 && index === 2 ? 'h-24' : 'h-24'
                            }`}
                            index={index}
                          />
                        </div>
                      </div>
                    ))}
                    {photos.length > 4 && (
                      <div className="w-full h-24 bg-slate-600 rounded flex items-center justify-center text-xs text-slate-400">
                        +{photos.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 5 && (
                    <Badge className="bg-slate-600 text-slate-300 text-xs">
                      +{tags.length - 5} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPost}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Publish Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
