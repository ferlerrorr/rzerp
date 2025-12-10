"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEmployeeStore, EmployeeFormData } from "@/stores/employee";

export interface EmployeeOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onSubmit?: (data: EmployeeFormData) => void;
  departments?: string[];
  positions?: string[];
  employmentTypes?: string[];
}

const defaultDepartments = [
  "IT",
  "Human Resources",
  "Sales",
  "Finance",
  "Marketing",
  "Operations",
  "Product",
  "Design",
];

const defaultPositions = [
  "Software Engineer",
  "HR Manager",
  "Sales Representative",
  "Accountant",
  "Marketing Specialist",
  "Operations Manager",
  "Product Manager",
  "Designer",
  "Developer",
  "Analyst",
  "Manager",
  "Coordinator",
];

const defaultEmploymentTypes = ["Full-time", "Part-time", "Contract", "Intern"];

export function EmployeeOnboardingDialog({
  open,
  onOpenChange,
  title = "Add Employee",
  onSubmit,
  departments = defaultDepartments,
  positions = defaultPositions,
  employmentTypes = defaultEmploymentTypes,
}: EmployeeOnboardingDialogProps) {
  const { formData, errors, updateField, setIsOpen, validateForm, resetForm } =
    useEmployeeStore();

  // Sync dialog open state with store
  useEffect(() => {
    setIsOpen(open);
  }, [open, setIsOpen]);

  const handleChange = (field: keyof EmployeeFormData, value: string) => {
    updateField(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          <div className="px-6 py-4 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName" className="text-sm">
                    Middle Name
                  </Label>
                  <Input
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleChange("middleName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+63 912 345 6789"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-sm">
                    Birth Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                    className={errors.birthDate ? "border-destructive" : ""}
                  />
                  {errors.birthDate && (
                    <p className="text-xs text-destructive">
                      {errors.birthDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange("gender", value)}
                  >
                    <SelectTrigger
                      className={errors.gender ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs text-destructive">{errors.gender}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="civilStatus" className="text-sm">
                    Civil Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.civilStatus}
                    onValueChange={(value) =>
                      handleChange("civilStatus", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.civilStatus ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.civilStatus && (
                    <p className="text-xs text-destructive">
                      {errors.civilStatus}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-semibold mb-3 block">
                  Address
                </Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="streetAddress" className="text-sm">
                      Street Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="streetAddress"
                      value={formData.streetAddress}
                      onChange={(e) =>
                        handleChange("streetAddress", e.target.value)
                      }
                      className={
                        errors.streetAddress ? "border-destructive" : ""
                      }
                    />
                    {errors.streetAddress && (
                      <p className="text-xs text-destructive">
                        {errors.streetAddress}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className={errors.city ? "border-destructive" : ""}
                      />
                      {errors.city && (
                        <p className="text-xs text-destructive">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province" className="text-sm">
                        Province <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) =>
                          handleChange("province", e.target.value)
                        }
                        className={errors.province ? "border-destructive" : ""}
                      />
                      {errors.province && (
                        <p className="text-xs text-destructive">
                          {errors.province}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-sm">
                        Zip Code <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) =>
                          handleChange("zipCode", e.target.value)
                        }
                        className={errors.zipCode ? "border-destructive" : ""}
                      />
                      {errors.zipCode && (
                        <p className="text-xs text-destructive">
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Government IDs */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Government IDs (Philippines)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sssNumber" className="text-sm">
                    SSS Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sssNumber"
                    placeholder="XX-XXXXXXX-X"
                    value={formData.sssNumber}
                    onChange={(e) => handleChange("sssNumber", e.target.value)}
                    className={errors.sssNumber ? "border-destructive" : ""}
                  />
                  {errors.sssNumber && (
                    <p className="text-xs text-destructive">
                      {errors.sssNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tin" className="text-sm">
                    TIN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="tin"
                    placeholder="XXX-XXX-XXX-XXX"
                    value={formData.tin}
                    onChange={(e) => handleChange("tin", e.target.value)}
                    className={errors.tin ? "border-destructive" : ""}
                  />
                  {errors.tin && (
                    <p className="text-xs text-destructive">{errors.tin}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="philHealthNumber" className="text-sm">
                    PhilHealth Number{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="philHealthNumber"
                    placeholder="XX-XXXXXXXXX-X"
                    value={formData.philHealthNumber}
                    onChange={(e) =>
                      handleChange("philHealthNumber", e.target.value)
                    }
                    className={
                      errors.philHealthNumber ? "border-destructive" : ""
                    }
                  />
                  {errors.philHealthNumber && (
                    <p className="text-xs text-destructive">
                      {errors.philHealthNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pagIbigNumber" className="text-sm">
                    Pag-IBIG Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pagIbigNumber"
                    placeholder="XXXX-XXXX-XXXX"
                    value={formData.pagIbigNumber}
                    onChange={(e) =>
                      handleChange("pagIbigNumber", e.target.value)
                    }
                    className={errors.pagIbigNumber ? "border-destructive" : ""}
                  />
                  {errors.pagIbigNumber && (
                    <p className="text-xs text-destructive">
                      {errors.pagIbigNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Employment Details */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                  >
                    <SelectTrigger
                      className={errors.department ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-xs text-destructive">
                      {errors.department}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm">
                    Position <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleChange("position", value)}
                  >
                    <SelectTrigger
                      className={errors.position ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position && (
                    <p className="text-xs text-destructive">
                      {errors.position}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType" className="text-sm">
                    Employment Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) =>
                      handleChange("employmentType", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.employmentType ? "border-destructive" : ""
                      }
                    >
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employmentType && (
                    <p className="text-xs text-destructive">
                      {errors.employmentType}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className={errors.startDate ? "border-destructive" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-destructive">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlySalary" className="text-sm">
                    Monthly Salary (₱){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="monthlySalary"
                    type="number"
                    placeholder="0.00"
                    value={formData.monthlySalary}
                    onChange={(e) =>
                      handleChange("monthlySalary", e.target.value)
                    }
                    className={errors.monthlySalary ? "border-destructive" : ""}
                  />
                  {errors.monthlySalary && (
                    <p className="text-xs text-destructive">
                      {errors.monthlySalary}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName" className="text-sm">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      handleChange("emergencyContactName", e.target.value)
                    }
                    className={
                      errors.emergencyContactName ? "border-destructive" : ""
                    }
                  />
                  {errors.emergencyContactName && (
                    <p className="text-xs text-destructive">
                      {errors.emergencyContactName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone" className="text-sm">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    placeholder="+63 912 345 6789"
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      handleChange("emergencyContactPhone", e.target.value)
                    }
                    className={
                      errors.emergencyContactPhone ? "border-destructive" : ""
                    }
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-xs text-destructive">
                      {errors.emergencyContactPhone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="emergencyContactRelationship"
                    className="text-sm"
                  >
                    Relationship <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="emergencyContactRelationship"
                    placeholder="e.g. Spouse, Parent, Sibling"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) =>
                      handleChange(
                        "emergencyContactRelationship",
                        e.target.value
                      )
                    }
                    className={
                      errors.emergencyContactRelationship
                        ? "border-destructive"
                        : ""
                    }
                  />
                  {errors.emergencyContactRelationship && (
                    <p className="text-xs text-destructive">
                      {errors.emergencyContactRelationship}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} variant="default">
            Submit Onboarding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
