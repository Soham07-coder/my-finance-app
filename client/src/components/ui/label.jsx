import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const labelVariants = cva(
  "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef(({ className, style, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    style={{ 
      fontSize: '12px', 
      fontWeight: '500', 
      lineHeight: '1.5',
      ...style 
    }}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };