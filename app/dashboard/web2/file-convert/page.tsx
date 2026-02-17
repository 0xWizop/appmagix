"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, ImageIcon, Video } from "lucide-react";
import { DataConverter } from "./data-converter";
import { ImageConverter } from "./image-converter";
import { VideoConverter } from "./video-converter";

export default function FileConvertPage() {
  return (
    <div className="min-h-screen p-6 lg:p-8">
      <Tabs defaultValue="data" className="space-y-6">
        <TabsList className="h-12 p-1 bg-surface border border-border rounded-lg inline-flex gap-1">
          <TabsTrigger
            value="data"
            className="text-sm px-4 data-[state=active]:bg-brand-green data-[state=active]:text-black"
          >
            <FileCode className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
          <TabsTrigger
            value="image"
            className="text-sm px-4 data-[state=active]:bg-brand-green data-[state=active]:text-black"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Image
          </TabsTrigger>
          <TabsTrigger
            value="video"
            className="text-sm px-4 data-[state=active]:bg-brand-green data-[state=active]:text-black"
          >
            <Video className="h-4 w-4 mr-2" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="mt-6">
          <DataConverter />
        </TabsContent>
        <TabsContent value="image" className="mt-6">
          <ImageConverter />
        </TabsContent>
        <TabsContent value="video" className="mt-6">
          <VideoConverter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
