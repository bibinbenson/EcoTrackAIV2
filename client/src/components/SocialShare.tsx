import React from 'react';
import { Twitter, Facebook, Linkedin, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  title: string;
  text: string;
  url?: string;
  image?: string;
  triggerElement?: React.ReactNode;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  title,
  text,
  url = window.location.href,
  image,
  triggerElement
}) => {
  const { toast } = useToast();
  
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const encodedTitle = encodeURIComponent(title);
  
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${text}\n\n${url}`);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Couldn't copy link",
        description: "Please try copying the URL manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerElement || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your impact</DialogTitle>
          <DialogDescription>
            Share your sustainability achievement on social media
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-2">
          <div className="mb-4">
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
          
          {image && (
            <div className="mb-4 rounded-md overflow-hidden">
              <img src={image} alt="Share preview" className="w-full h-auto" />
            </div>
          )}
          
          <div className="flex gap-2 mt-4 justify-center">
            <Button onClick={() => window.open(twitterUrl, '_blank')} size="lg" variant="outline" className="flex-1">
              <Twitter className="h-5 w-5 mr-2" />
              Twitter
            </Button>
            
            <Button onClick={() => window.open(facebookUrl, '_blank')} size="lg" variant="outline" className="flex-1">
              <Facebook className="h-5 w-5 mr-2" />
              Facebook
            </Button>
            
            <Button onClick={() => window.open(linkedinUrl, '_blank')} size="lg" variant="outline" className="flex-1">
              <Linkedin className="h-5 w-5 mr-2" />
              LinkedIn
            </Button>
          </div>
          
          <Button 
            onClick={copyToClipboard} 
            variant="secondary" 
            className="w-full mt-3"
          >
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};