"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Shield,
  Users,
  Clock,
  FileText,
  Edit,
} from "lucide-react";
import { EmployeeFromAPI } from "@/stores/employee";

export interface EmployeeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeFromAPI | null;
  onEdit?: (employee: EmployeeFromAPI) => void;
}

export function EmployeeViewDialog({
  open,
  onOpenChange,
  employee,
  onEdit,
}: EmployeeViewDialogProps) {
  if (!employee) return null;

  const fullName = [
    employee.first_name,
    employee.middle_name,
    employee.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const initials = [
    employee.first_name?.[0] || "",
    employee.last_name?.[0] || "",
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSalary = (salary: string) => {
    return `₱${parseFloat(salary).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatGender = (gender: string) => {
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const formatCivilStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getEmploymentTypeBadge = (type: string) => {
    const typeMap: Record<string, "success" | "info" | "warning" | "default"> =
      {
        "Full-time": "success",
        "Part-time": "info",
        Contract: "warning",
        Intern: "default",
      };
    return typeMap[type] || "default";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-lg border border-border flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-foreground mb-2">
                {fullName}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  ID: {employee.id}
                </Badge>
                <Badge
                  variant={getEmploymentTypeBadge(employee.employment_type)}
                  className="text-xs capitalize"
                >
                  {employee.employment_type}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-4 space-y-6">
            {/* Personal Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Personal Information
                </h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">First Name</p>
                    <p className="text-sm font-medium text-foreground">
                      {employee.first_name}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Middle Name</p>
                    <p className="text-sm font-medium text-foreground">
                      {employee.middle_name || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Last Name</p>
                    <p className="text-sm font-medium text-foreground">
                      {employee.last_name}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-5">
                      {employee.email}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Phone</p>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-5">
                      {employee.phone}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Birth Date</p>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-5">
                      {formatDate(employee.birth_date)}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <Badge variant="outline" className="text-xs">
                      {formatGender(employee.gender)}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Civil Status</p>
                    <Badge variant="outline" className="text-xs">
                      {formatCivilStatus(employee.civil_status)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Address</p>
                  </div>
                  <div className="pl-5 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      {employee.street_address}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">City</p>
                        <p className="text-sm font-medium text-foreground">
                          {employee.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Province
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {employee.province}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Zip Code
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {employee.zip_code}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Government IDs */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Government IDs (Philippines)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1.5">SSS Number</p>
                  <p className="text-sm font-mono font-medium text-foreground">
                    {employee.sss_number}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1.5">TIN</p>
                  <p className="text-sm font-mono font-medium text-foreground">
                    {employee.tin}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    PhilHealth Number
                  </p>
                  <p className="text-sm font-mono font-medium text-foreground">
                    {employee.phil_health_number}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Pag-IBIG Number
                  </p>
                  <p className="text-sm font-mono font-medium text-foreground">
                    {employee.pag_ibig_number}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Employment Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Employment Details
                </h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Department</p>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-5">
                      {employee.department}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Position</p>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-5">
                      {employee.position}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Employment Type</p>
                    <Badge
                      variant={getEmploymentTypeBadge(employee.employment_type)}
                      className="text-xs capitalize"
                    >
                      {employee.employment_type}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Start Date</p>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-5">
                      {formatDate(employee.start_date)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Monthly Salary</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {formatSalary(employee.monthly_salary)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Emergency Contact
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">
                    {employee.emergency_contact_name}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Phone</p>
                  </div>
                  <p className="text-sm font-medium text-foreground pl-5">
                    {employee.emergency_contact_phone}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Relationship</p>
                  <Badge variant="outline" className="text-xs">
                    {employee.emergency_contact_relationship}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Created: {formatDate(employee.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Last Updated: {formatDate(employee.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Close
          </Button>
          {onEdit && (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                if (employee) {
                  onEdit(employee);
                  onOpenChange(false);
                }
              }}
              className="w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Employee
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
