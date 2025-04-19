import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Share2, Download } from "lucide-react";
import { SocialShare } from "@/components/SocialShare";

interface PurchaseConfirmationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  project: any;
  amount: number;
  cost: number;
}

export const PurchaseConfirmationDialog: React.FC<PurchaseConfirmationDialogProps> = ({
  isOpen,
  setIsOpen,
  project,
  amount,
  cost
}) => {
  const impactText = `By offsetting ${amount} tons of CO₂, you're helping to reduce emissions equivalent to:`;
  
  // Calculate equivalent impacts (these are rough estimates)
  const carMiles = Math.round(amount * 2500); // 2,500 miles per ton of CO2
  const smartphones = Math.round(amount * 90); // 90 smartphones charged per ton of CO2
  const trees = Math.round(amount * 16.5); // Each ton of CO2 is roughly equivalent to what 16.5 trees absorb annually
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">Offset Purchase Successful!</DialogTitle>
          <DialogDescription className="text-center">
            Thank you for supporting {project?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-neutral-50 rounded-lg mb-4">
          <h3 className="font-medium text-sm text-neutral-700 mb-2">Purchase Summary</h3>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-neutral-600">Project:</span>
            <span className="text-sm font-medium">{project?.name}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-neutral-600">Location:</span>
            <span className="text-sm font-medium">{project?.location}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-neutral-600">Amount Offset:</span>
            <span className="text-sm font-medium">{amount} tons CO₂</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-sm font-medium text-neutral-700">Total:</span>
            <span className="text-sm font-bold">${cost.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium text-sm text-neutral-700 mb-2">{impactText}</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>Driving {carMiles.toLocaleString()} miles in an average car</span>
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>Charging {smartphones.toLocaleString()} smartphones</span>
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
              <span>The annual carbon sequestration of {trees.toLocaleString()} trees</span>
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              // This would typically download a certificate
              alert("Certificate download functionality would go here");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Certificate
          </Button>
          
          <SocialShare
            title="I just offset my carbon footprint!"
            text={`I just offset ${amount} tons of CO₂ by supporting ${project?.name}. That's equivalent to taking ${Math.round(amount * 2)} cars off the road for a year!`}
            image={project?.imageUrl}
            triggerElement={
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share Impact
              </Button>
            }
          />
          
          <Button
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};