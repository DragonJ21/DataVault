import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    { value: 'pdf', label: 'PDF Report', icon: FileText, color: 'text-red-500' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet, color: 'text-green-500' },
    { value: 'csv', label: 'CSV Data', icon: File, color: 'text-blue-500' },
    { value: 'json', label: 'JSON Data', icon: Code, color: 'text-gray-500' },
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
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <div className="space-y-2">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex items-center cursor-pointer">
                        <Icon className={`h-4 w-4 mr-2 ${option.color}`} />
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
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
