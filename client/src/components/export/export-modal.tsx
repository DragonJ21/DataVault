import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, FileSpreadsheet, File, Code, Download } from 'lucide-react';
import { exportData, type ExportFormat } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [sections, setSections] = useState({
    travel: true,
    flights: true,
    employers: true,
    education: false,
    addresses: false,
    personal: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatOptions = [
    { value: 'pdf', label: 'PDF Report', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet },
    { value: 'csv', label: 'CSV Data', icon: File },
    { value: 'json', label: 'JSON Data', icon: Code },
  ];

  const sectionOptions = [
    { key: 'travel', label: 'Travel History' },
    { key: 'flights', label: 'Flight Records' },
    { key: 'employers', label: 'Employment History' },
    { key: 'education', label: 'Education Records' },
    { key: 'addresses', label: 'Address History' },
    { key: 'personal', label: 'Personal Information' },
  ];

  const handleSectionChange = (key: string, checked: boolean) => {
    setSections(prev => ({ ...prev, [key]: checked }));
  };

  const handleExport = async () => {
    const selectedSections = Object.entries(sections)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key);

    if (selectedSections.length === 0) {
      toast({
        title: 'No sections selected',
        description: 'Please select at least one data section to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportData({
        format,
        sections: selectedSections,
      });
      
      toast({
        title: 'Export successful',
        description: `Your data has been exported as ${format.toUpperCase()}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>
            Choose the format and data sections you want to export.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          {/* Data Sections */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Data Sections</Label>
            <div className="space-y-2">
              {sectionOptions.map((option) => (
                <div key={option.key} className="flex items-center space-x-3">
                  <Checkbox
                    id={option.key}
                    checked={sections[option.key as keyof typeof sections]}
                    onCheckedChange={(checked) => handleSectionChange(option.key, !!checked)}
                  />
                  <Label htmlFor={option.key} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              className="flex-1" 
              disabled={isExporting}
            >
              {isExporting ? (
                'Exporting...'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
