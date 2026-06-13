"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { EnquiryDialog } from "@/components/site/enquiry-dialog";
import type { Car } from "@/lib/database.types";

export function CarDetailEnquiry({ car }: { car: Car }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="gradient" size="lg" onClick={() => setOpen(true)}>
        Send Enquiry
      </Button>
      <EnquiryDialog open={open} onOpenChange={setOpen} car={car} />
    </>
  );
}
